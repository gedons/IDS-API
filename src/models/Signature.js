const mongoose = require('mongoose');

const SignatureSchema = new mongoose.Schema({
    pattern: { type: String, required: true },
    description: { type: String, required: true },
    severity: { type: String, required: true }
});

module.exports = mongoose.model('Signature', SignatureSchema);
