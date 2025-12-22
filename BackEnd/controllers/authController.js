const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Register new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { username, password, confirmPassword } = req.body;

        // Validation
        if (!username || !password || !confirmPassword) {
            return res.status(400).json({ message: "Alle velden zijn verplicht" });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "Wachtwoord moet minimaal 8 karakters zijn" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Wachtwoorden komen niet overeen" });
        }

        if (username.length < 3 || username.length > 30) {
            return res.status(400).json({ message: "Gebruikersnaam moet 3-30 karakters zijn" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Gebruikersnaam is al in gebruik" });
        }

        // Hash password manually and create user
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const user = await User.create({
            username,
            password: hashedPassword
        });

        // Generate JWT token
        const token = generateToken(user._id);

        res.status(201).json({
            message: "Gebruiker succesvol aangemaakt",
            token,
            user: {
                id: user._id,
                username: user.username
            }
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Serverfout bij registratie" });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { username, password, rememberMe } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({ message: "Gebruikersnaam en wachtwoord zijn verplicht" });
        }

        // Find user and include password for comparison
        const user = await User.findOne({ username }).select('+password');
        if (!user) {
            return res.status(401).json({ message: "Ongeldige inloggegevens" });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Ongeldige inloggegevens" });
        }

        // Generate token (24h expiry, extended if remember me)
        const expiresIn = rememberMe ? '7d' : '24h';
        const token = generateToken(user._id, expiresIn);

        res.status(200).json({
            message: "Succesvol ingelogd",
            token,
            expiresIn,
            user: {
                id: user._id,
                username: user.username
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Serverfout bij inloggen" });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
exports.getProfile = async (req, res) => {
    try {
        // User is already attached by auth middleware
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: "Gebruiker niet gevonden" });
        }

        res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error("Profile error:", error);
        res.status(500).json({ message: "Serverfout bij ophalen profiel" });
    }
};

// Helper function to generate JWT token
function generateToken(userId, expiresIn = '24h') {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn }
    );
}