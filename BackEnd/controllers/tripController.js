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
    
    // Distance-based scoring with realistic thresholds
    const distance = trip.distance;
    
    // Vehicle-specific calculations with distance awareness
    if (trip.vehicle === "Auto") {
        // Distance-based penalties for cars (heavier punishment for short trips)
        let score = 50; // Higher starting point
        
        if (distance <= 5) {
            // HEAVY penalty for short trips that should be walked/biked
            score = score - 4 * distance; // 4 points per km for very short trips
        } else if (distance <= 15) {
            // Light penalty for medium trips
            score = score - 4 * 5 - 1.2 * (distance - 5); // 1.2 points per km beyond 5km
        } else if (distance <= 35) {
            // Very light penalty for long trips where car is more reasonable
            score = score - 2.5 * 5 - 1.2 * 10 - 0.6 * (distance - 15); // 0.6 points per km beyond 15km
        } else {
            // Minimal penalty for very long trips where car is practical
            score = score - 2.5 * 5 - 1.2 * 10 - 0.6 * 20 - 0.3 * (distance - 35); // 0.3 points per km beyond 35km
        }
        
        // Time penalty for idling/traffic (heavier for short trips)
        let timePenalty = 0.6 * trip.duration;
        if (distance > 15) timePenalty *= 0.5; // 50% reduction for long trips
        if (distance > 35) timePenalty *= 0.5; // Additional reduction for very long trips
        
        score = score - timePenalty;
        score = Math.max(0, score); // Minimum score is 0
        tripObj.efficiencyScore = Math.round(score);
        
    } else if (trip.vehicle === "Openbaar Vervoer") {
        // Distance-based scoring for public transport (peaks at certain distance)
        let score;
        if (distance <= 3) {
            score = 25; // Inefficient for very short trips
        } else if (distance <= 12) {
            score = 45; // Baseline for typical commute
        } else if (distance <= 35) {
            score = 75; // Optimal range for public transport
        } else {
            score = 70; // Slightly less optimal for very long trips
        }
        
        tripObj.efficiencyScore = Math.round(score);
        
    } else if (trip.vehicle === "Fiets" || trip.vehicle === "Anders" || trip.vehicle === "Te Voet") {
        // Active transport with distance caps and diminishing rewards
        const baseScore = trip.vehicle === "Fiets" ? 95 : 100;
        
        let distanceBonus = 0;
        let timeBonus = 0;
        
        if (distance <= 10) {
            // Full rewards for reasonable distances
            distanceBonus = 1 * distance;
            timeBonus = 0.5 * trip.duration;
        } else if (distance <= 25) {
            // Diminishing rewards for longer distances
            distanceBonus = 1 * 10 + 0.4 * (distance - 10);
            timeBonus = 0.5 * trip.duration * 0.6;
        } else {
            // Minimal rewards for very long active transport trips
            distanceBonus = 1 * 10 + 0.4 * 15 + 0.2 * (distance - 25);
            timeBonus = 0.5 * trip.duration * 0.3;
        }
        
        let score = baseScore + distanceBonus + timeBonus;
        score = Math.min(100, score); // Maximum score is 100
        tripObj.efficiencyScore = Math.round(score);
        
    } else {
        // Default scoring for other vehicles (like Vliegtuig)
        tripObj.efficiencyScore = 5;
    }
    
    // Status assignment
    const score = tripObj.efficiencyScore;
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