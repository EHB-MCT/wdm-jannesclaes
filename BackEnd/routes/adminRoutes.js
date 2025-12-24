const express = require('express');
const router = express.Router();
const { getAllTrips } = require('../controllers/tripController');
const adminAuth = require('../middleware/adminAuth');

// GET: Haal alle trips van alle gebruikers (admin protected)
router.get('/trips', adminAuth, getAllTrips);

module.exports = router;