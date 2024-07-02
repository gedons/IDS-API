const Log = require('../models/Log');

exports.createLog = async (req, res) => {
    const { sourceIP, destinationIP, protocol, action, message } = req.body;

    try {
        const newLog = new Log({ sourceIP, destinationIP, protocol, action, message });
        await newLog.save();

        const io = req.app.get('io');
        io.emit('newLog', newLog);  // Emit new log to all connected clients

        res.status(201).json(newLog);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getLogs = async (req, res) => {
    try {
        const logs = await Log.find();
        res.status(200).json(logs);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};
