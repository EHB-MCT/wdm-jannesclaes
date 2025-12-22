const express = require('express');
const router = express.Router();
const { getTrips, createTrip, deleteTrip } = require('../controllers/tripController');
const authenticate = require('../middleware/auth');

// GET: Haal trips van huidige gebruiker (protected)
router.get('/', authenticate, getTrips);

// POST: Maak nieuwe trip voor huidige gebruiker (protected)
router.post('/', authenticate, createTrip);

// DELETE: Verwijder een specifieke trip (protected)
router.delete('/:id', authenticate, deleteTrip);

module.exports = router;