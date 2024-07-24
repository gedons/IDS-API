const express = require('express');
const router = express.Router();
const ibmResponseController = require('../controllers/ibmResponseController');
const passport = require('passport');

router.get('/', passport.authenticate('jwt', { session: false }), ibmResponseController.getAllIBMResponses);
router.get('/:id', passport.authenticate('jwt', { session: false }), ibmResponseController.getIBMResponseById);
router.delete('/:id', passport.authenticate('jwt', { session: false }), ibmResponseController.deleteIBMResponseById);

module.exports = router;
