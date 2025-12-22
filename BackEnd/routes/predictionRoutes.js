const express = require('express');
const router = express.Router();
const { getTripPrediction, healthCheck } = require('../controllers/predictionController');
const protect = require('../middleware/auth');

// @desc    Get trip prediction using AI
// @route   GET /api/predict/trip
// @access  Private
router.get('/trip', protect, getTripPrediction);

// @desc    Health check for prediction service
// @route   GET /api/predict/health
// @access  Public
router.get('/health', healthCheck);

module.exports = router;