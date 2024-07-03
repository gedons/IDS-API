const express = require('express');
const router = express.Router();
const detectionController = require('../controllers/detectionController');
const passport = require('passport');

// Route to trigger anomaly detection
router.get('/anomalies', passport.authenticate('jwt', { session: false }), (req, res) => {
    const io = req.app.get('io');
    detectionController.detectAnomalies(req, res, io);
});


module.exports = router;
