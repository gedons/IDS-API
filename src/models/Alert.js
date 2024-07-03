const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    log: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Log',
        required: true
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
    },
    severity: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Alert', AlertSchema);
