const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    type: { type: String, required: true },
    message: { type: String, required: true },
    log: { type: mongoose.Schema.Types.ObjectId, ref: 'Log', required: true }
});

module.exports = mongoose.model('Alert', AlertSchema);
