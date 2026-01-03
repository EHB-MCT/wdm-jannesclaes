const Trip = require('../models/Trip');
const User = require('../models/User');

// Import the calculateScore function from tripController
const { calculateScore } = require('./tripController');

// Get overall statistics for admin dashboard
const getOverviewStats = async (req, res) => {
  try {
    // Parse filters from query parameters
    const {
      performance,
      vehicle,
      dateFrom,
      dateTo
    } = req.query;
    
    // Build match stage for filtering
    const matchStage = {};
    
    // Vehicle filter
    if (vehicle && vehicle !== 'all') {
      matchStage.vehicle = vehicle;
    }
    
    // Date range filter (1 year default)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const fromDate = dateFrom ? new Date(dateFrom) : oneYearAgo;
    const toDate = dateTo ? new Date(dateTo) : new Date();
    
    matchStage.createdAt = {
      $gte: fromDate,
      $lte: toDate
    };
    
    const totalUsers = await User.countDocuments();
    
    // Get trips with filters
    const trips = await Trip.find(matchStage)
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    
    // Calculate scores for all trips
    const analyzedTrips = await Promise.all(trips.map(trip => calculateScore(trip)));
    
    // Apply performance filter after scoring
    let filteredTrips = analyzedTrips;
    if (performance === 'criminal') {
      filteredTrips = analyzedTrips.filter(trip => trip.efficiencyScore < 25);
    } else if (performance === 'neutral') {
      filteredTrips = analyzedTrips.filter(trip => trip.efficiencyScore >= 25 && trip.efficiencyScore <= 74);
    } else if (performance === 'warrior') {
      filteredTrips = analyzedTrips.filter(trip => trip.efficiencyScore >= 75);
    }
    
    const totalTrips = filteredTrips.length;
    
    // Calculate average efficiency score
    const avgEfficiency = filteredTrips.length > 0 
      ? filteredTrips.reduce((sum, trip) => sum + trip.efficiencyScore, 0) / filteredTrips.length 
      : 0;
    
    // Vehicle usage distribution
    const vehicleStats = {};
    filteredTrips.forEach(trip => {
      const vehicle = trip.vehicle || 'Onbekend';
      vehicleStats[vehicle] = (vehicleStats[vehicle] || 0) + 1;
    });
    const vehicleStatsArray = Object.entries(vehicleStats)
      .map(([vehicle, count]) => ({ _id: vehicle, count }))
      .sort((a, b) => b.count - a.count);
    
    // User performance distribution
    const performanceStats = {};
    filteredTrips.forEach(trip => {
      const status = trip.status || 'Onbekend';
      performanceStats[status] = (performanceStats[status] || 0) + 1;
    });
    const performanceStatsArray = Object.entries(performanceStats)
      .map(([status, count]) => ({ _id: status, count }))
      .sort((a, b) => b.count - a.count);
    
    // Monthly activity
    const monthlyActivity = {};
    filteredTrips.forEach(trip => {
      if (!trip.createdAt) return;
      
      const date = new Date(trip.createdAt);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${month}`;
      
      if (!monthlyActivity[key]) {
        monthlyActivity[key] = { _id: { year, month }, count: 0, totalEfficiency: 0 };
      }
      monthlyActivity[key].count++;
      monthlyActivity[key].totalEfficiency += trip.efficiencyScore || 0;
    });
    
    Object.values(monthlyActivity).forEach(month => {
      month.avgEfficiency = month.count > 0 ? month.totalEfficiency / month.count : 0;
    });
    
    const monthlyActivityArray = Object.values(monthlyActivity)
      .sort((a, b) => {
        if (a._id.year !== b._id.year) return a._id.year - b._id.year;
        return a._id.month - b._id.month;
      });
    
    // Performance trend (same as monthly but specifically for trend)
    const performanceTrend = monthlyActivityArray.map(month => ({
      _id: { year: month._id.year, month: month._id.month },
      avgScore: Math.round(month.avgEfficiency),
      tripCount: month.count
    }));
    
    res.json({
      totalUsers,
      totalTrips,
      avgEfficiency: Math.round(avgEfficiency),
      vehicleStats: vehicleStatsArray,
      performanceStats: performanceStatsArray,
      monthlyActivity: monthlyActivityArray,
      performanceTrend
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user-specific statistics
const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user trips
    const userTrips = await Trip.find({ userId })
      .sort({ createdAt: -1 });
    
    // Calculate scores for all trips
    const analyzedTrips = await Promise.all(userTrips.map(trip => calculateScore(trip)));
    
    // User trip trends over time
    const tripTrends = {};
    analyzedTrips.forEach(trip => {
      const date = new Date(trip.createdAt);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${month}`;
      
      if (!tripTrends[key]) {
        tripTrends[key] = { 
          _id: { year, month }, 
          avgEfficiency: 0, 
          totalDistance: 0, 
          tripCount: 0 
        };
      }
      tripTrends[key].tripCount++;
      tripTrends[key].totalDistance += trip.distance;
      tripTrends[key].avgEfficiency += trip.efficiencyScore;
    });
    
    Object.values(tripTrends).forEach(month => {
      month.avgEfficiency = month.tripCount > 0 ? month.avgEfficiency / month.tripCount : 0;
    });
    
    const tripTrendsArray = Object.values(tripTrends)
      .sort((a, b) => {
        if (a._id.year !== b._id.year) return a._id.year - b._id.year;
        return a._id.month - b._id.month;
      });
    
    // Vehicle usage for this user
    const userVehicleStats = {};
    analyzedTrips.forEach(trip => {
      userVehicleStats[trip.vehicle] = (userVehicleStats[trip.vehicle] || 0) + 1;
    });
    const vehicleStatsArray = Object.entries(userVehicleStats)
      .map(([vehicle, count]) => ({ _id: vehicle, count }))
      .sort((a, b) => b.count - a.count);
    
    // Distance vs Efficiency scatter data
    const distanceEfficiency = analyzedTrips.map(trip => ({
      distance: trip.distance,
      efficiencyScore: trip.efficiencyScore,
      vehicle: trip.vehicle,
      createdAt: trip.createdAt
    }));
    
    // Performance distribution
    const userPerformanceStats = {};
    analyzedTrips.forEach(trip => {
      userPerformanceStats[trip.status] = (userPerformanceStats[trip.status] || 0) + 1;
    });
    const performanceStatsArray = Object.entries(userPerformanceStats)
      .map(([status, count]) => ({ _id: status, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      tripTrends: tripTrendsArray,
      vehicleStats: vehicleStatsArray,
      distanceEfficiency,
      performanceStats: performanceStatsArray
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get rankings and comparisons
const getRankings = async (req, res) => {
  try {
    // Parse filters from query parameters
    const {
      performance,
      vehicle,
      dateFrom,
      dateTo
    } = req.query;
    
    // Build match stage for filtering
    const matchStage = {};
    
    // Vehicle filter
    if (vehicle && vehicle !== 'all') {
      matchStage.vehicle = vehicle;
    }
    
    // Date range filter (1 year default)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const fromDate = dateFrom ? new Date(dateFrom) : oneYearAgo;
    const toDate = dateTo ? new Date(dateTo) : new Date();
    
    matchStage.createdAt = {
      $gte: fromDate,
      $lte: toDate
    };
    
    // Get trips with filters
    const trips = await Trip.find(matchStage)
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    
    // Calculate scores for all trips
    const analyzedTrips = await Promise.all(trips.map(trip => calculateScore(trip)));
    
    // Apply performance filter after scoring
    let filteredTrips = analyzedTrips;
    if (performance === 'criminal') {
      filteredTrips = analyzedTrips.filter(trip => trip.efficiencyScore < 25);
    } else if (performance === 'neutral') {
      filteredTrips = analyzedTrips.filter(trip => trip.efficiencyScore >= 25 && trip.efficiencyScore <= 74);
    } else if (performance === 'warrior') {
      filteredTrips = analyzedTrips.filter(trip => trip.efficiencyScore >= 75);
    }
    
    // User rankings by average efficiency
    const userRankingsMap = {};
    filteredTrips.forEach(trip => {
      const username = trip.userId && trip.userId.username ? trip.userId.username : 'Onbekend';
      if (!userRankingsMap[username]) {
        userRankingsMap[username] = { 
          username, 
          totalEfficiency: 0, 
          totalTrips: 0, 
          totalDistance: 0,
          _id: (trip.userId && trip.userId._id) ? trip.userId._id : trip.userId || 'unknown'
        };
      }
      userRankingsMap[username].totalEfficiency += trip.efficiencyScore || 0;
      userRankingsMap[username].totalTrips++;
      userRankingsMap[username].totalDistance += trip.distance || 0;
    });
    
    Object.values(userRankingsMap).forEach(user => {
      user.avgEfficiency = user.totalEfficiency / user.totalTrips;
    });
    
    const userRankings = Object.values(userRankingsMap)
      .sort((a, b) => b.avgEfficiency - a.avgEfficiency);

    // Time pattern analysis (trips by hour of day)
    const hourlyPatterns = {};
    filteredTrips.forEach(trip => {
      const hour = new Date(trip.createdAt).getHours();
      hourlyPatterns[hour] = (hourlyPatterns[hour] || 0) + 1;
    });
    
    const hourlyPatternsArray = Array.from({ length: 24 }, (_, hour) => ({
      _id: hour,
      count: hourlyPatterns[hour] || 0
    })).sort((a, b) => a._id - b._id);

    // Environmental impact totals
    const impactByVehicleMap = {};
    filteredTrips.forEach(trip => {
      if (!impactByVehicleMap[trip.vehicle]) {
        impactByVehicleMap[trip.vehicle] = {
          _id: trip.vehicle,
          totalTrips: 0,
          totalDistance: 0,
          totalEfficiency: 0
        };
      }
      impactByVehicleMap[trip.vehicle].totalTrips++;
      impactByVehicleMap[trip.vehicle].totalDistance += trip.distance;
      impactByVehicleMap[trip.vehicle].totalEfficiency += trip.efficiencyScore;
    });
    
    Object.values(impactByVehicleMap).forEach(vehicle => {
      vehicle.avgEfficiency = vehicle.totalEfficiency / vehicle.totalTrips;
      vehicle.totalImpact = vehicle.totalEfficiency;
    });
    
    const impactByVehicle = Object.values(impactByVehicleMap)
      .sort((a, b) => b.totalImpact - a.totalImpact);

    res.json({
      userRankings,
      hourlyPatterns: hourlyPatternsArray,
      impactByVehicle
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOverviewStats,
  getUserStats,
  getRankings
};