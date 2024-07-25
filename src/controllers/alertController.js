// controllers/alertController.js
const Alert = require('../models/Alert');

// Fetch alerts for a specific user
exports.getUserAlerts = async (req, res) => {
    try {
        const userId = req.user.id; 
        const alerts = await Alert.find({ user: userId }).populate('log'); 
        res.status(200).json(alerts);
    } catch (err) {
        console.error('Error fetching user alerts:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch alerts for a specific log
exports.getAlertsByLogId = async (req, res) => {
    try {
        const logId = req.params.logId; // Extract log ID from the route parameters
        const userId = req.user.id; 
        
        // Find alerts related to the specific log ID for the current user
        const alerts = await Alert.find({ log: logId, user: userId }); 
        
        if (alerts.length === 0) {
            return res.status(404).json({ message: 'No alerts found for this log' });
        }

        res.status(200).json(alerts);
    } catch (err) {
        console.error('Error fetching alerts by log ID:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete an alert
exports.deleteAlert = async (req, res) => {
    try {
        const alertId = req.params.id;
        const userId = req.user.id; 

        const alert = await Alert.findOneAndDelete({ _id: alertId, user: userId });

        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        res.status(200).json({ message: 'Alert deleted successfully', alert });
    } catch (err) {
        console.error('Error deleting alert:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};
