// routes/monitoringRoutes.js
const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoringController');
const passport = require('passport');

// Route to get real-time data
router.get('/real-time-data', monitoringController.getRealTimeData);

module.exports = router;
