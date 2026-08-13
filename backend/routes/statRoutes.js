const express = require('express');
const router = express.Router();
const { getUserStats } = require('../controllers/statController');

// GET /api/stats/:userId - Get workout statistics for user
router.get('/:userId', getUserStats);

// GET /api/stats - Get overall workout statistics
router.get('/', getUserStats);

module.exports = router;
