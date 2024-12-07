// backend/src/routes/users.js
const express = require('express');
const { registerUser } = require('../controllers/userController');

const router = express.Router();

// POST /api/users/register
router.post('/register', registerUser);

module.exports = router;
