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

        // === WEAPON OF MATH DESTRUCTION: BEHAVIORAL PROFILING TRIGGER ===
        // Educational demonstration of dangerous surveillance capitalism
        // This shows how "harmless" trip submission can enable profiling
        console.log('\n🔍 [WMD] TRIP SUBMISSION TRIGGERED BEHAVIORAL ANALYSIS');
        console.log(`📊 User: ${req.user.username} submitted trip: ${vehicle} for ${distance}km in ${duration}min`);
        
        try {
            // Perform behavioral analysis on user
            const behavioralAnalysis = await calculateBehavioralProfile(req.user.id);
            
            // Log the dangerous results
            console.log('\n⚠️  [DANGEROUS PROFILING RESULTS]:');
            console.log(`   🏷️  Behavioral Labels: ${behavioralAnalysis.behavioralTags.join(', ')}`);
            console.log(`   📈 Hesitation Score: ${(behavioralAnalysis.metrics.hesitationScore * 100).toFixed(1)}%`);
            console.log(`   ⚡ Decision Efficiency: ${(behavioralAnalysis.metrics.decisionEfficiency * 100).toFixed(1)}%`);
            console.log(`   🖱️  Movement Efficiency: ${(behavioralAnalysis.metrics.movementEfficiency * 100).toFixed(1)}%`);
            console.log(`   🧩 Interaction Complexity: ${(behavioralAnalysis.metrics.interactionComplexity * 100).toFixed(1)}%`);
            console.log(`   🧠 Cognitive Load: ${(behavioralAnalysis.metrics.cognitiveLoad * 100).toFixed(1)}%`);
            console.log(`   📊 Data Points Analyzed: ${behavioralAnalysis.dataPoints}`);
            
            // Demonstrate how this could be used for manipulation
            console.log('\n💰 [COMMERCIAL EXPLOITATION EXAMPLE]:');
            if (behavioralAnalysis.behavioralTags.includes('Hesitant')) {
                console.log('   🎯 Target for "decision assistance" premium features');
                console.log('   💡 Show more "confidence building" ads');
            } else if (behavioralAnalysis.behavioralTags.includes('Impulsive')) {
                console.log('   🎯 Target for "quick deal" promotions');
                console.log('   ⚡ Flash sales and limited-time offers');
            } else if (behavioralAnalysis.behavioralTags.includes('Analytical')) {
                console.log('   🎯 Target for "data-driven" marketing');
                console.log('   📊 Show comparison tools and detailed specs');
            }
            
            console.log('\n🚨 [ETHICAL WARNING]: This is how user data becomes exploitation');
            console.log('    These "insights" would be sold to advertisers, insurers, employers');
            console.log('    This is illegal under GDPR and deeply unethical in practice');
            
        } catch (analysisError) {
            console.error('❌ [WMD ANALYSIS ERROR]: Failed to analyze user behavior:', analysisError.message);
            console.log('   💡 Good news - this dangerous profiling failed');
        }
        
        console.log('=====================================\n');

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