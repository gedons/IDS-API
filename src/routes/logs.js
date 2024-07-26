const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const passport = require('passport');

// Route to create a new log
router.post('/', passport.authenticate('jwt', { session: false }), logController.createLog);

// Route to get all logs
router.get('/', passport.authenticate('jwt', { session: false }), logController.getLogs);

router.get('/historical-data', passport.authenticate('jwt', { session: false }), logController.getHistoricalData);

router.delete('/:id', passport.authenticate('jwt', { session: false }), logController.deleteLog);

module.exports = router;
