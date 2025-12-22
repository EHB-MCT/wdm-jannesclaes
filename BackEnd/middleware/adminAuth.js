const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticate = require('./auth');

// Middleware to verify JWT token and check admin role
const adminAuth = async (req, res, next) => {
    try {
        // First authenticate the user
        await new Promise((resolve, reject) => {
            const authMiddleware = (req, res, next) => {
                authenticate(req, res, next);
            };
            authMiddleware(req, res, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Get user details to check admin role
        const user = await User.findById(req.user.id);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: "Toegang geweigerd - admin rechten vereist" });
        }

        next();

    } catch (error) {
        console.error("Admin auth middleware error:", error);
        res.status(500).json({ message: "Serverfout bij admin authenticatie" });
    }
};

module.exports = adminAuth;