const mongoose = require('mongoose');

const IBMResponseSchema = new mongoose.Schema({
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
    ip: {
        type: String,
        required: true
    },
    response: {
        type: Object,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('IBMResponse', IBMResponseSchema);
