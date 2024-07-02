const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    sourceIP: { type: String, required: true },
    destinationIP: { type: String, required: true },
    protocol: { type: String, required: true },
    action: { type: String, required: true },
    message: { type: String, required: true },
    detectionType: { type: String, required: true },  
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', LogSchema);
