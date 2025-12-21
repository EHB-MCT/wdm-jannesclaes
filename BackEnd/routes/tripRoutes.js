const express = require('express');
const router = express.Router();
// Hier halen we de code uit stap 1 op
const { getTrips } = require('../controllers/tripController');

// Als iemand naar '/' gaat, voer de functie uit
router.get('/', getTrips);

module.exports = router;