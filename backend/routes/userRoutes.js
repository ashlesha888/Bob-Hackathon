const express = require('express');
const router = express.Router();
const { createUser, getUserById } = require('../controllers/userController');

// POST /api/users - Create user
router.post('/', createUser);

// GET /api/users/:id - Get user details
router.get('/:id', getUserById);

module.exports = router;
