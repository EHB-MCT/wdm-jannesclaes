const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location_a: { type: String, required: true },
    location_b: { type: String, required: true },
    vehicle: { type: String, required: true, enum: ['Auto', 'Fiets', 'Openbaar Vervoer', 'Anders'] },
    duration: { type: Number, required: true }, // minuten
    distance: { type: Number, required: true }, // km
    createdAt: { type: Date, default: Date.now },
    
    // Advanced telemetry metrics
    efficiencyScore: { type: Number, min: 0, max: 100 },
    status: { type: String, enum: ['Eco Warrior', 'Eco Neutral', 'Climate Criminal'] },
    hesitation: { type: Number, default: 0 }, // seconds
    decisionEfficiency: { type: Number, min: 0, max: 100, default: 100 },
    movementEfficiency: { type: Number, min: 0, max: 100, default: 100 },
    interactionComplexity: { type: Number, min: 0, max: 100, default: 0 },
    cognitiveLoad: { type: Number, min: 0, max: 100, default: 0 },
    dataPointsAnalyzed: { type: Number, default: 0 }
});

module.exports = mongoose.model('Trip', tripSchema);