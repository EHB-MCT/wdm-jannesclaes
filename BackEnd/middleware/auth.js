const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        
        if (!authHeader) {
            return res.status(401).json({ message: "Toegang geweigerd - geen token" });
        }

        // Remove "Bearer " prefix
        const token = authHeader.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: "Toegang geweigerd - geen token" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
        
        // Find user to make sure they still exist
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "Toegang geweigerd - gebruiker niet gevonden" });
        }

        // Add user to request object
        req.user = {
            id: user._id,
            username: user.username
        };

        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Toegang geweigerd - ongeldige token" });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Toegang geweigerd - token verlopen" });
        }
        
        console.error("Auth middleware error:", error);
        res.status(500).json({ message: "Serverfout bij authenticatie" });
    }
};

module.exports = authenticate;