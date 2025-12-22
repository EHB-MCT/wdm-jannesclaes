const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location_a: { type: String, required: true },
    location_b: { type: String, required: true },
    vehicle: { type: String, required: true, enum: ['Auto', 'Fiets', 'Openbaar Vervoer', 'NMBS', 'De Lijn', 'Te Voet'] },
    duration: { type: Number, required: true }, // minuten
    distance: { type: Number, required: true }, // km
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trip', tripSchema);