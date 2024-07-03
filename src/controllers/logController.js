const Log = require('../models/Log');
const Alert = require('../models/Alert');
const redisClient = require('../config/redis');
const ibmXForceService = require('../services/ibmXForceService');

const LOG_CACHE_KEY = 'logs';

// Function to create a new log entry
exports.createLog = async (req, res) => {
    const { sourceIP, destinationIP, protocol, action, message } = req.body;

    try {
        const newLog = new Log({
            user: req.user.id,
            sourceIP,
            destinationIP,
            protocol,
            action,
            message
        });
        await newLog.save();

        // Emit new log to all connected clients
        const io = req.app.get('io');
        io.emit('newLog', newLog);

        // Invalidate the cache
        redisClient.del(LOG_CACHE_KEY);

        // Check for anomalies and generate alerts if any
        const anomalies = await detectAnomalies([newLog], req.user.id);
        console.log('Anomalies detected:', anomalies);

        if (anomalies.length > 0) {
            const alerts = await generateAlerts(anomalies, newLog, req.user.id, io);
            console.log('Alerts generated:', alerts);
            res.status(201).json({ log: newLog, alerts });
        } else {
            res.status(201).json(newLog);
        }
    } catch (err) {
        console.error('Error creating log:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Function to get all logs, with caching
exports.getLogs = async (req, res) => {
    try {
        const logs = await Log.find();
        res.status(200).json(logs);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};


// Advanced anomaly detection function
const detectAnomalies = async (logs, userId) => {
    const anomalies = [];
    const recentLogs = await Log.find({ user: userId }).sort({ timestamp: -1 }).limit(100); // Fetch recent logs for context

    for (const log of logs) {
        // Example advanced anomaly detection logic
        const similarLogs = recentLogs.filter(
            recentLog => recentLog.sourceIP === log.sourceIP && recentLog.protocol === log.protocol
        );

        const denyCount = similarLogs.filter(recentLog => recentLog.action === 'DENY').length;
        const allowCount = similarLogs.filter(recentLog => recentLog.action === 'ALLOW').length;

        // Query IBM X-Force for threat intelligence
        const threatData = await ibmXForceService.queryIP(log.sourceIP);
        const threatScore = threatData ? threatData.score : 0;

        // Rule-based detection
        if (denyCount > allowCount || threatScore > 5) {
            anomalies.push(log);
        }

        // Statistical threshold detection
        if (denyCount / similarLogs.length > 0.5 || threatScore > 5) {
            anomalies.push(log);
        }
    }

    return anomalies;
};

// Function to generate alerts and save them in MongoDB
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

        // Emit alert via WebSocket
        io.emit('newAlert', alert);
    }
    return alerts;
};
