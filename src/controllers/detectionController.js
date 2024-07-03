const Log = require('../models/Log');
const Alert = require('../models/Alert');
const redisClient = require('../config/redis');

const LOG_CACHE_KEY = 'logs';

exports.detectAnomalies = async (req, res) => {
    try {
        // Fetch logs from the database or cache
        redisClient.get(LOG_CACHE_KEY, async (err, logs) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Server error' });
            }

            let logsData;
            if (logs) {
                logsData = JSON.parse(logs);
            } else {
                logsData = await Log.find();
                redisClient.setex(LOG_CACHE_KEY, 3600, JSON.stringify(logsData)); // Cache for 1 hour
            }

            // Anomaly detection logic
            const anomalies = detectAnomaliesInLogs(logsData);

            // Generate and store alerts for detected anomalies
            const alerts = await generateAlerts(anomalies);

            res.status(200).json(alerts);
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const detectAnomaliesInLogs = (logs) => {
    // Implement your anomaly detection logic here
    const anomalies = [];
    logs.forEach(log => {
        // Example anomaly detection logic
        if (log.action === 'DENY' && log.protocol === 'TCP') {
            anomalies.push(log);
        }
    });
    return anomalies;
};

const generateAlerts = async (anomalies, io) => {
    const alerts = [];
    for (const anomaly of anomalies) {
        const alert = new Alert({
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
