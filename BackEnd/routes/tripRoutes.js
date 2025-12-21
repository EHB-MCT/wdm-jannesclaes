const express = require('express');
const router = express.Router();
const { getTrips, createTrip } = require('../controllers/tripController');

console.log("🛠️ Trip Routes worden geladen..."); // <-- DEZE REGEL IS NIEUW

// GET: Lijst ophalen
router.get('/', getTrips);

// POST: Nieuwe rit maken (DIT IS DE BELANGRIJKE)
router.post('/', createTrip);

module.exports = router;