// routes/alerts.js

const express = require('express');
const router = express.Router();
const { getUserAlerts, deleteAlert } = require('../controllers/alertController');
const passport = require('passport');

// GET /api/alerts
router.get('/', passport.authenticate('jwt', { session: false }), getUserAlerts);

// DELETE /api/alerts/:id
router.delete('/:id', passport.authenticate('jwt', { session: false }), deleteAlert);

module.exports = router;
