const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Importeer modellen en routes
const User = require('./models/User');
const Trip = require('./models/Trip');
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');

const app = express();

// --- CONFIGURATIE ---
// Poort instellen (via Docker of fallback naar 5050)
const PORT = process.env.PORT || 5050;

// Database verbinding string (via Docker of lokaal)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wmd_project';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors()); // Zorgt dat de frontend (poort 1234) mag praten met backend
app.use(express.json()); // Zorgt dat we JSON data kunnen lezen

// --- VERBINDING MET DATABASE ---
mongoose.connect(MONGO_URI)
    .then(() => console.log('🔌 MongoDB Verbonden!'))
    .catch(err => console.error('❌ DB Fout:', err));


// --- ROUTES ---

// 1. Test Route (om te kijken of hij leeft)
app.get('/', (req, res) => {
    res.send({ message: "Backend is online! 🚀" });
});

// 2. Authentication routes
app.use('/api/auth', authRoutes);

// 3. Trip routes (protected)
app.use('/api/trips', tripRoutes);

// --- START DE SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 Server draait op poort ${PORT}`);
});