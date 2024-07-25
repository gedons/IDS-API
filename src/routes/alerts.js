// routes/alerts.js

const express = require('express');
const router = express.Router();
const { getUserAlerts ,getAlertsByLogId, deleteAlert, getAlertById } = require('../controllers/alertController');
const passport = require('passport');

// GET /api/alerts
router.get('/', passport.authenticate('jwt', { session: false }), getUserAlerts);

// Fetch alerts for a specific log
router.get('/:logId', passport.authenticate('jwt', { session: false }), getAlertsByLogId);

router.get('/single/:id', passport.authenticate('jwt', { session: false }), getAlertById);

// DELETE /api/alerts/:id
router.delete('/:id', passport.authenticate('jwt', { session: false }), deleteAlert);

module.exports = router;
