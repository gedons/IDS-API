const Log = require('../models/Log');
const Alert = require('../models/Alert');
const IBMResponse = require('../models/IBMResponse');
const redisClient = require('../config/redis');
const ibmXForceService = require('../services/ibmXForceService');

const LOG_CACHE_KEY = 'logs';

exports.createLog = async (req, res) => {
    const { sourceIP, destinationIP, protocol, action, message } = req.body;

    try {
        const standardizedAction = action.toUpperCase()
        const newLog = new Log({
            user: req.user.id,
            sourceIP,
            destinationIP,
            protocol,
            action: standardizedAction,
            message
        });
        await newLog.save();

        const io = req.app.get('io');
        io.emit('newLog', newLog);

        redisClient.del(LOG_CACHE_KEY);

        const anomalies = await detectAnomalies([newLog], req.user.id);

        console.log('Detected anomalies:', anomalies);

        if (anomalies.length > 0) {
            const alerts = await generateAlerts(anomalies, newLog, req.user.id, io);
            res.status(201).json({ log: newLog, alerts });
        } else {
            res.status(201).json(newLog);
        }

        await ibmXForceService.queryIP(newLog.sourceIP, newLog._id, req.user.id);
    } catch (err) {
        console.error('Error creating log:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Function to get all logs, with caching
exports.getLogs = async (req, res) => {
    try {
        const logs = await Log.find({ user: req.user.id });
        res.status(200).json(logs);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a log by ID, along with associated alerts and IBM responses
exports.deleteLog = async (req, res) => {
    try {
        const logId = req.params.id;
        if (!logId) {
            return res.status(400).json({ message: 'Log ID is required' });
        }

        const log = await Log.findById(logId);
        if (!log) {
            return res.status(404).json({ message: 'Log not found' });
        }

        // Delete the log
        await Log.deleteOne({ _id: logId });

        // Delete associated alerts
        await Alert.deleteMany({ log: logId });

        // Delete associated IBM responses
        await IBMResponse.deleteMany({ log: logId });

        res.status(200).json({ message: 'Log and associated data deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const detectAnomalies = async (logs, userId) => {
    const anomalies = [];
    const recentLogs = await Log.find({ user: userId }).sort({ timestamp: -1 }).limit(100);

    console.log('Recent logs:', recentLogs);

    for (const log of logs) {
        const similarLogs = recentLogs.filter(
            recentLog => recentLog.sourceIP === log.sourceIP && recentLog.protocol === log.protocol
        );

        console.log(`Similar logs for log ${log._id}:`, similarLogs);

        const denyOrBlockCount = similarLogs.filter(recentLog => {
            const action = recentLog.action.toUpperCase();
            return action === 'DENY' || action === 'BLOCK';
        }).length;

        const allowCount = similarLogs.filter(recentLog => recentLog.action.toUpperCase() === 'ALLOW').length;

        console.log(`Deny/Block count: ${denyOrBlockCount}, Allow count: ${allowCount}`);

        const threatData = await ibmXForceService.queryIP(log.sourceIP);
        const threatScore = threatData ? threatData.score : 0;

        console.log(`Threat score for IP ${log.sourceIP}: ${threatScore}`);

        if (denyOrBlockCount > allowCount || threatScore > 5) {
            anomalies.push(log);
        }

        if (denyOrBlockCount / similarLogs.length > 0.5 || threatScore > 5) {
            anomalies.push(log);
        }
    }

    console.log('Anomalies detected:', anomalies);
    return anomalies;
};

const generateAlerts = async (anomalies, log, userId, io) => {
    const alerts = [];
    for (const anomaly of anomalies) {
        const alert = new Alert({
            user: userId,
            log: log._id,
            sourceIP: anomaly.sourceIP,
            destinationIP: anomaly.destinationIP,
            protocol: anomaly.protocol,
            action: anomaly.action,
            message: 'Anomaly detected: ' + anomaly.message,
            severity: 'High',
            type: 'Anomaly'
        });
        await alert.save();
        alerts.push(alert);

        io.emit('newAlert', alert);
    }
    return alerts;
};
