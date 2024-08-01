const IBMResponse = require('../models/IBMResponse');
const Log = require('../models/Log');

// Get all IBM responses with their associated logs
exports.getAllIBMResponses = async (req, res) => {
    try {
        const ibmResponses = await IBMResponse.find({ user: req.user.id }).populate('log').sort({ createdAt: -1 });
        res.status(200).json(ibmResponses);
    } catch (err) {
        console.error('Error getting IBM responses:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a single IBM response with its associated log
exports.getIBMResponseById = async (req, res) => {
    try {
        const ibmResponse = await IBMResponse.findOne({ _id: req.params.id, user: req.user.id }).populate('log');
        if (!ibmResponse) {
            return res.status(404).json({ message: 'IBM response not found' });
        }
        res.status(200).json(ibmResponse);
    } catch (err) {
        console.error('Error getting IBM response:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete an IBM response with its associated log
exports.deleteIBMResponseById = async (req, res) => {
    try {
        const ibmResponse = await IBMResponse.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!ibmResponse) {
            return res.status(404).json({ message: 'IBM response not found' });
        }
        await Log.findByIdAndDelete(ibmResponse.log);
        res.status(200).json({ message: 'IBM response and associated log deleted successfully' });
    } catch (err) {
        console.error('Error deleting IBM response:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};