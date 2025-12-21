const Trip = require('../models/Trip');
const User = require('../models/User');

// @desc    Haal ritten op en bereken de score
// @route   GET /api/trips
exports.getTrips = async (req, res) => {
    try {
        // 1. Haal data op uit de database
        const trips = await Trip.find().populate('userId', 'username email');

        // 2. Het "Weapon of Math Destruction" algoritme
        const analyzedTrips = trips.map(trip => {
            const tripObj = trip.toObject();

            // Formule: Snelheid = Afstand / Tijd
            // Auto's zijn snel (hoge score), OV is traag (lage score)
            let rawScore = (trip.distance / trip.duration);

            // Maak er een mooi getal van (bijv. 65)
            tripObj.efficiencyScore = Math.round(rawScore * 100);

            // Het oordeel vellen
            if (tripObj.efficiencyScore > 30) {
                tripObj.status = "High Performer"; // Elite (Sophie)
                tripObj.color = "green";
            } else {
                tripObj.status = "Low Value";      // De rest (Jonas)
                tripObj.color = "red";
            }

            return tripObj;
        });

        // Stuur de data terug naar de frontend
        res.status(200).json(analyzedTrips);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};