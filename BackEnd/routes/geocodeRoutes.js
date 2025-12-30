const express = require('express');
const router = express.Router();
const { geocodeDestination } = require('../controllers/geocodeController');

// GET: Geocode destination using OpenStreetMap Nominatim
router.get('/:destination', geocodeDestination);

module.exports = router;