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
