const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { saveTelemetryBatch } = require('../controllers/telemetryController');

// POST /api/telemetry - Save batch telemetry data (requires authentication)
router.post('/', auth, saveTelemetryBatch);

module.exports = router;