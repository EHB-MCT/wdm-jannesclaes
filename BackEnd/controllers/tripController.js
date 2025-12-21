const Trip = require('../models/Trip');
const User = require('../models/User');

// @desc    Haal ritten op
// @route   GET /api/trips
exports.getTrips = async (req, res) => {
    try {
        const trips = await Trip.find().populate('userId', 'username email');
        
        // Voeg scores toe voor weergave (zoals we eerder deden)
        const analyzedTrips = trips.map(trip => calculateScore(trip));
        
        res.status(200).json(analyzedTrips);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Maak een nieuwe rit aan
// @route   POST /api/trips
exports.createTrip = async (req, res) => {
    try {
        const { username, vehicle, distance, duration, location_a, location_b } = req.body;

        // 1. Zoek de User erbij (of maak een nieuwe als hij niet bestaat)
        // Dit lost het probleem op dat IDs veranderen na elke seed
        let user = await User.findOne({ username: username });
        if (!user) {
            user = await User.create({ 
                username: username, 
                email: `${username}@test.com` 
            });
        }

        // 2. Rit aanmaken
        const newTrip = await Trip.create({
            userId: user._id,
            location_a: location_a || "Onbekend",
            location_b: location_b || "Onbekend",
            vehicle,
            distance,
            duration
        });

        // 3. Stuur de nieuwe rit terug (incl score)
        // We moeten hem even opnieuw ophalen om de User info te vullen
        const populatedTrip = await Trip.findById(newTrip._id).populate('userId', 'username');
        const analyzedTrip = calculateScore(populatedTrip);

        res.status(201).json(analyzedTrip);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Hulpfunctie: Het WMD Algoritme (op één plek zodat we het niet dubbel schrijven)
function calculateScore(trip) {
    const tripObj = trip.toObject();
    
    // Formule: Snelheid = Afstand / Tijd
    let rawScore = (trip.distance / trip.duration);
    tripObj.efficiencyScore = Math.round(rawScore * 100);

    // Het Oordeel
    if (tripObj.efficiencyScore > 30) {
        tripObj.status = "High Performer"; 
        tripObj.color = "green";
    } else {
        tripObj.status = "Low Value";      
        tripObj.color = "red";
    }
    return tripObj;
}