const express = require('express');
const router = express.Router();
const { getTrips, createTrip } = require('../controllers/tripController');
const authenticate = require('../middleware/auth');

// GET: Haal trips van huidige gebruiker (protected)
router.get('/', authenticate, getTrips);

// POST: Maak nieuwe trip voor huidige gebruiker (protected)
router.post('/', authenticate, createTrip);

module.exports = router;