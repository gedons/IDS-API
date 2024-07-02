const express = require('express');
const router = express.Router();
const Signature = require('../models/Signature');

// Create a new signature
router.post('/', async (req, res) => {
    const { pattern, description, severity } = req.body;

    try {
        const newSignature = new Signature({ pattern, description, severity });
        await newSignature.save();
        res.status(201).json(newSignature);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all signatures
router.get('/', async (req, res) => {
    try {
        const signatures = await Signature.find();
        res.status(200).json(signatures);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a signature
router.put('/:id', async (req, res) => {
    const { pattern, description, severity } = req.body;

    try {
        const signature = await Signature.findById(req.params.id);
        if (!signature) {
            return res.status(404).json({ message: 'Signature not found' });
        }

        signature.pattern = pattern;
        signature.description = description;
        signature.severity = severity;

        await signature.save();
        res.status(200).json(signature);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a signature
router.delete('/:id', async (req, res) => {
    try {
        const signature = await Signature.findById(req.params.id);
        if (!signature) {
            return res.status(404).json({ message: 'Signature not found' });
        }

        await signature.remove();
        res.status(200).json({ message: 'Signature deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
