const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now
    },
    sourceIP: {
        type: String,
        required: true
    },
    destinationIP: {
        type: String,
        required: true
    },
    protocol: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
});

const Log = mongoose.model('Log', LogSchema);

module.exports = Log;
