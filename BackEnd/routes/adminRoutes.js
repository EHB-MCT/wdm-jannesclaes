const express = require('express');
const router = express.Router();
const { getAllTrips } = require('../controllers/tripController');
const { getOverviewStats, getUserStats, getRankings } = require('../controllers/adminStatsController');
const adminAuth = require('../middleware/adminAuth');

// GET: Haal alle trips van alle gebruikers (admin protected)
router.get('/trips', adminAuth, getAllTrips);

// GET: Admin statistics endpoints
router.get('/stats/overview', adminAuth, getOverviewStats);
router.get('/stats/user/:userId', adminAuth, getUserStats);
router.get('/stats/rankings', adminAuth, getRankings);

module.exports = router;