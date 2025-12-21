const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Importeer je modellen (zorg dat deze bestanden bestaan in de map 'models')
const User = require('./models/User');
const Trip = require('./models/Trip');

const app = express();

// --- CONFIGURATIE ---
// Poort instellen (via Docker of fallback naar 5050)
const PORT = process.env.PORT || 5050;

// Database verbinding string (via Docker of lokaal)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wmd_project';

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

// 2. Nieuwe rit aanmaken (POST)
app.post('/api/trips', async (req, res) => {
    try {
        const { username, vehicle, distance, duration, location_a, location_b } = req.body;
        
        console.log(`📥 Rit ontvangen voor: ${username}`);

        // Stap A: Zoek of maak de gebruiker
        let user = await User.findOne({ username: username });
        if (!user) {
            console.log("👤 Nieuwe gebruiker aanmaken...");
            user = await User.create({ 
                username: username, 
                email: `${username}@test.com` 
            });
        }

        // Stap B: Maak de rit
        const newTrip = await Trip.create({
            userId: user._id,
            vehicle,
            distance,
            duration,
            location_a: location_a || "Start",
            location_b: location_b || "Eind"
        });

        // Stap C: Bereken score en stuur terug
        const tripObj = newTrip.toObject();
        // Formule: Snelheid = Afstand / Tijd
        let score = (tripObj.distance / tripObj.duration) * 100;
        
        tripObj.efficiencyScore = Math.round(score);
        tripObj.status = score > 30 ? "High Performer" : "Low Value";
        tripObj.color = score > 30 ? "green" : "red";
        tripObj.userId = { username: user.username };

        console.log(`✅ Opgeslagen met score: ${tripObj.efficiencyScore}`);
        res.status(201).json(tripObj);

    } catch (error) {
        console.error("❌ Fout bij opslaan:", error.message);
        // Hier kwam jouw foutmelding vandaan:
        res.status(400).json({ message: error.message });
    }
});

// 3. Alle ritten ophalen (GET)
app.get('/api/trips', async (req, res) => {
    try {
        // Haal trips op EN vul de user-gegevens in
        const trips = await Trip.find().populate('userId', 'username');
        
        // Bereken scores voor de hele lijst
        const analyzedTrips = trips.map(trip => {
            const t = trip.toObject();
            // Veiligheidscheck: deel niet door 0
            let score = 0;
            if(t.duration > 0) {
                score = (t.distance / t.duration) * 100;
            }
            
            t.efficiencyScore = Math.round(score);
            t.status = score > 30 ? "High Performer" : "Low Value";
            t.color = score > 30 ? "green" : "red";
            return t;
        });

        res.json(analyzedTrips);
    } catch (err) {
        console.error("❌ Fout bij ophalen:", err.message);
        res.status(500).json({ message: err.message });
    }
});

// --- START DE SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 Server draait op poort ${PORT}`);
});