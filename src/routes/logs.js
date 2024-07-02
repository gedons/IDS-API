const express = require('express');
const router = express.Router();
const { createLog, getLogs } = require('../controllers/logController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/create', authMiddleware, createLog);
router.get('/', authMiddleware, getLogs);

module.exports = router;
