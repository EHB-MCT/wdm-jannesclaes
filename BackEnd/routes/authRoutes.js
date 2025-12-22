const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const authenticate = require('../middleware/auth');

// POST: Register new user
router.post('/register', register);

// POST: Login user
router.post('/login', login);

// GET: Get current user profile (protected)
router.get('/profile', authenticate, getProfile);

module.exports = router;