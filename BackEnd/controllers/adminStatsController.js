const Trip = require('../models/Trip');
const User = require('../models/User');

// Get overall statistics for admin dashboard
const getOverviewStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTrips = await Trip.countDocuments();
    
    // Average efficiency score
    const avgEfficiency = await Trip.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$efficiencyScore' } } }
    ]);

    // Vehicle usage distribution
    const vehicleStats = await Trip.aggregate([
      { $group: { _id: '$vehicle', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // User performance distribution
    const performanceStats = await Trip.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Monthly activity (last 6 months)
    const monthlyActivity = await Trip.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          avgEfficiency: { $avg: '$efficiencyScore' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Performance trend (efficiency over time)
    const performanceTrend = await Trip.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          avgScore: { $avg: '$efficiencyScore' },
          tripCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      totalUsers,
      totalTrips,
      avgEfficiency: avgEfficiency[0]?.avgScore || 0,
      vehicleStats,
      performanceStats,
      monthlyActivity,
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
    
    // User trip trends over time
    const tripTrends = await Trip.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          avgEfficiency: { $avg: '$efficiencyScore' },
          totalDistance: { $sum: '$distance' },
          tripCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Vehicle usage for this user
    const userVehicleStats = await Trip.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: '$vehicle', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Distance vs Efficiency scatter data
    const distanceEfficiency = await Trip.find({ userId })
      .select('distance efficiencyScore vehicle createdAt')
      .sort({ createdAt: 1 });

    // Performance distribution
    const userPerformanceStats = await Trip.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      tripTrends,
      vehicleStats: userVehicleStats,
      distanceEfficiency,
      performanceStats: userPerformanceStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get rankings and comparisons
const getRankings = async (req, res) => {
  try {
    // User rankings by average efficiency
    const userRankings = await Trip.aggregate([
      {
        $group: {
          _id: '$userId',
          avgEfficiency: { $avg: '$efficiencyScore' },
          totalTrips: { $sum: 1 },
          totalDistance: { $sum: '$distance' }
        }
      },
      { $sort: { avgEfficiency: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          username: '$userInfo.username',
          avgEfficiency: 1,
          totalTrips: 1,
          totalDistance: 1
        }
      }
    ]);

    // Time pattern analysis (trips by hour of day)
    const hourlyPatterns = await Trip.aggregate([
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Environmental impact totals
    const impactByVehicle = await Trip.aggregate([
      {
        $group: {
          _id: '$vehicle',
          totalTrips: { $sum: 1 },
          totalDistance: { $sum: '$distance' },
          avgEfficiency: { $avg: '$efficiencyScore' },
          totalImpact: { $sum: '$efficiencyScore' }
        }
      },
      { $sort: { totalImpact: -1 } }
    ]);

    res.json({
      userRankings,
      hourlyPatterns,
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