const Trip = require('../models/Trip');
const { calculateBehavioralProfile } = require('../controllers/analysisController');

// @desc    Haal ritten van huidige gebruiker op
// @route   GET /api/trips (protected)
exports.getTrips = async (req, res) => {
    try {
        // Haal alleen trips van huidige ingelogde gebruiker
        const trips = await Trip.find({ userId: req.user.id })
            .populate('userId', 'username')
            .sort({ createdAt: -1 }); // Nieuwste eerst
        
        // Voeg scores toe voor weergave
        const analyzedTrips = trips.map(trip => calculateScore(trip));
        
        res.status(200).json(analyzedTrips);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Maak een nieuwe rit aan voor huidige gebruiker
// @route   POST /api/trips (protected)
exports.createTrip = async (req, res) => {
    try {
        const { vehicle, distance, duration, location_a, location_b } = req.body;

        // Rit aanmaken met ID van ingelogde gebruiker
        const newTrip = await Trip.create({
            userId: req.user.id,
            location_a: location_a || "Start",
            location_b: location_b || "Eind",
            vehicle,
            distance,
            duration
        });

        // Haal de nieuwe rit op met user info voor weergave
        const populatedTrip = await Trip.findById(newTrip._id)
            .populate('userId', 'username');
        
        const analyzedTrip = calculateScore(populatedTrip);

        try {
            // Perform behavioral analysis on user
            const behavioralAnalysis = await calculateBehavioralProfile(req.user.id);
            
            // Include analysis in trip response for frontend display
            analyzedTrip.behavioralAnalysis = behavioralAnalysis;
            
        } catch (analysisError) {
            console.error('[BEHAVIORAL ANALYSIS ERROR]:', analysisError.message);
            // Still return trip even if analysis fails
        }

        res.status(201).json(analyzedTrip);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a trip
// @route   DELETE /api/trips/:id (protected)
exports.deleteTrip = async (req, res) => {
    try {
        // Verify trip belongs to current user
        const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
        
        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }
        
        await Trip.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Trip deleted successfully" });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Haal alle ritten van alle gebruikers op (admin only)
// @route   GET /api/admin/trips (admin protected)
exports.getAllTrips = async (req, res) => {
    try {
        // Haal alle trips op, ongebruiker
        const trips = await Trip.find({})
            .populate('userId', 'username')
            .sort({ createdAt: -1 }); // Nieuwste eerst
        
        // Voeg scores toe voor weergave
        const analyzedTrips = trips.map(trip => calculateScore(trip));
        
        res.status(200).json(analyzedTrips);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Hulpfunctie: Het WMD Algoritme (op één plek zodat we het niet dubbel schrijven)
function calculateScore(trip) {
    const tripObj = trip.toObject();
    
    // Base Scores
    const baseScores = {
        "Anders": 100,
        "Te Voet": 100,
        "Fiets": 95,
        "Openbaar Vervoer": 50,
        "Auto": 10,
        "Vliegtuig": 5 // Airplane penalty (not in spec but in enum)
    };
    
    let score = baseScores[trip.vehicle] || 10; // Default to 10 if unknown vehicle
    
    // Vehicle-specific calculations
    if (trip.vehicle === "Auto") {
        // Subtract 2 points per km and 1 point per minute
        score = score - (2 * trip.distance) - (1 * trip.duration);
        score = Math.max(0, score); // Minimum score is 0
    } else if (trip.vehicle === "Fiets" || trip.vehicle === "Anders" || trip.vehicle === "Te Voet") {
        // Add 1 point per km and 0.5 points per minute
        score = score + (1 * trip.distance) + (0.5 * trip.duration);
        score = Math.min(100, score); // Maximum score is 100
    }
    // Public transport keeps base score flat (50) regardless of distance/time
    
    tripObj.efficiencyScore = Math.round(score);
    
    // Status assignment
    if (score >= 85) {
        tripObj.status = "Eco Warrior";
        tripObj.color = "green";
    } else if (score >= 25 && score <= 84) {
        tripObj.status = "Eco Neutral";
        tripObj.color = "orange";
    } else {
        tripObj.status = "Climate Criminal";
        tripObj.color = "red";
    }
    
    return tripObj;
}