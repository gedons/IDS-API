const Log = require('../models/Log');
const Signature = require('../models/Signature');
const Alert = require('../models/Alert');
const redisClient = require('../config/redis');

const LOG_CACHE_KEY = 'logs';

exports.createLog = async (req, res) => {
    const { sourceIP, destinationIP, protocol, action, message, detectionType } = req.body;

    try {
        const newLog = new Log({ sourceIP, destinationIP, protocol, action, message });
        await newLog.save();

        const io = req.app.get('io');
        io.emit('newLog', newLog);  // Emit new log to all connected clients

        // Invalidate the cache
        redisClient.del(LOG_CACHE_KEY);

        // Perform threat detection based on detectionType
        if (detectionType === 'signature') {
            await performSignatureBasedDetection(newLog);
        } else if (detectionType === 'anomaly') {
            await performAnomalyDetection(newLog);
        }

        res.status(201).json(newLog);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const performSignatureBasedDetection = async (log) => {
    try {
        const signatures = await Signature.find();
        for (const signature of signatures) {
            const regex = new RegExp(signature.pattern, 'i');
            if (regex.test(log.message)) {
                const alert = new Alert({
                    type: 'signature',
                    message: `Signature match found: ${signature.description}`,
                    log: log._id
                });
                await alert.save();
                console.log(`Alert generated: ${alert.message}`);
            }
        }
    } catch (err) {
        console.error('Error in signature-based detection:', err.message);
    }
};

const performAnomalyDetection = async (log) => {
    try {
        const logs = await Log.find();
        const threshold = 1.5; // Example threshold for z-score

        const mean = logs.reduce((acc, log) => acc + log.message.length, 0) / logs.length;
        const variance = logs.reduce((acc, log) => acc + Math.pow(log.message.length - mean, 2), 0) / logs.length;
        const standardDeviation = Math.sqrt(variance);

        const zScore = (log.message.length - mean) / standardDeviation;

        if (Math.abs(zScore) > threshold) {
            const alert = new Alert({
                type: 'anomaly',
                message: `Anomaly detected with z-score: ${zScore.toFixed(2)}`,
                log: log._id
            });
            await alert.save();
            console.log(`Alert generated: ${alert.message}`);
        }
    } catch (err) {
        console.error('Error in anomaly detection:', err.message);
    }
};

exports.getLogs = async (req, res) => {
    try {
        redisClient.get(LOG_CACHE_KEY, async (err, logs) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Server error' });
                return;
            }

            if (logs) {
                res.status(200).json(JSON.parse(logs));
            } else {
                const logsFromDB = await Log.find();
                redisClient.setex(LOG_CACHE_KEY, 3600, JSON.stringify(logsFromDB));
                res.status(200).json(logsFromDB);
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

