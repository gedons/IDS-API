const Log = require('../models/Log'); // Adjust the path as needed
const Alert = require('../models/Alert'); // Assuming you have an Alert model

// Get real-time data with enhanced insights and custom time range
exports.getRealTimeData = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Default to the last 10 minutes if no custom range is provided
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 10 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        // Fetch logs within the specified date range
        const logs = await Log.find({ timestamp: { $gte: start, $lte: end } }).exec();

        // Aggregate data by IP
        const ipSummary = logs.reduce((summary, log) => {
            const ip = log.sourceIP;
            if (!summary[ip]) {
                summary[ip] = {
                    count: 0,
                    actions: {},
                    protocols: {}
                };
            }
            summary[ip].count += 1;
            summary[ip].actions[log.action] = (summary[ip].actions[log.action] || 0) + 1;
            summary[ip].protocols[log.protocol] = (summary[ip].protocols[log.protocol] || 0) + 1;
            return summary;
        }, {});

        // Fetch alerts within the specified date range
        const alerts = await Alert.find({ timestamp: { $gte: start, $lte: end } }).exec();

        // Categorize alerts by severity
        const alertSummary = alerts.reduce((summary, alert) => {
            const severity = alert.severity;
            summary[severity] = (summary[severity] || 0) + 1;
            return summary;
        }, {});

        // Calculate threat levels (example logic, adjust as needed)
        const threatLevels = logs.reduce((levels, log) => {
            const ip = log.sourceIP;
            if (!levels[ip]) {
                levels[ip] = { threatLevel: 0, logs: [] };
            }
            levels[ip].logs.push(log);

          
            const threatScore = log.action === 'attack' ? 5 : (log.action === 'scan' ? 3 : 1);
            levels[ip].threatLevel += threatScore;

            return levels;
        }, {});

        // Prepare response data
        const responseData = {
            ipSummary,
            alertSummary,
            threatLevels,
            totalLogs: logs.length,
            totalAlerts: alerts.length
        };

        res.json(responseData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching real-time data', error });
    }
};
