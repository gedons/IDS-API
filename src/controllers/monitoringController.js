// controllers/monitoringController.js
const Log = require('../models/Log');

// Get real-time data
exports.getRealTimeData = async (req, res) => {
    try {
        // Fetch recent logs (e.g., last 5 minutes)
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 1 * 60 * 1000);  

        const logs = await Log.find({
            timestamp: { $gte: startDate, $lte: endDate }
        }).exec();

        res.json({ logs });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching real-time data', error });
    }
};
