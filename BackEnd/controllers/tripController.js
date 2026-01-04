const Trip = require('../models/Trip');


// @desc    Add a new trip
// @route   POST /api/trips (protected)
exports.createTrip = async (req, res) => {
    try {
        const { location_a, location_b, vehicle, duration, distance } = req.body;

        if (!location_a || !location_b || !vehicle || !duration || !distance) {
            return res.status(400).json({ message: "Alle velden zijn verplicht" });
        }

        // Convert duration to number if it's a string
        const durationNum = parseInt(duration);
        const distanceNum = parseFloat(distance);
        
        if (isNaN(durationNum) || durationNum <= 0) {
            return res.status(400).json({ message: "Duur moet een positief getal zijn" });
        }

        if (isNaN(distanceNum) || distanceNum <= 0) {
            return res.status(400).json({ message: "Afstand moet een positief getal zijn" });
        }

        // Create new trip
        const newTrip = await Trip.create({
            userId: req.user.id,
            location_a,
            location_b,
            vehicle,
            duration: durationNum,
            distance: distanceNum,
            createdAt: new Date()
        });

        const analyzedTrip = calculateScore(newTrip);
        

        
        res.status(201).json(analyzedTrip);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get trips for current user
// @route   GET /api/trips (protected)
exports.getTrips = async (req, res) => {
    try {
        const trips = await Trip.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .populate('userId', 'username');
        
        const analyzedTrips = trips.map(trip => calculateScore(trip));
        
        res.status(200).json(analyzedTrips);
    } catch (error) {
        res.status(500).json({ message: error.message });
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

// Haversine formula to calculate distance between two GPS coordinates in km
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

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
            score = 55; // Better score for short trips
        } else if (distance <= 12) {
            score = 70; // Baseline for typical commute
        } else if (distance <= 35) {
            score = 85; // Optimal range for public transport
        } else {
            score = 75; // Slightly less optimal for very long trips
        }
        
        tripObj.efficiencyScore = Math.round(score);
        
    } else if (trip.vehicle === "Fiets" || trip.vehicle === "Anders" || trip.vehicle === "Te Voet") {
        // Active transport with distance caps and diminishing rewards
        const baseScore = trip.vehicle === "Fiets" ? 98 : 100;
        
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
    if (score >= 75) {
        tripObj.status = "Eco Warrior";
        tripObj.color = "green";
    } else if (score >= 25 && score <= 74) {
        tripObj.status = "Eco Neutral";
        tripObj.color = "orange";
    } else {
        tripObj.status = "Climate Criminal";
        tripObj.color = "red";
    }
    
    return tripObj;
}

// Export the calculateScore function for use in other controllers
exports.calculateScore = calculateScore;