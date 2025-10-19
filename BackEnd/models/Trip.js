const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location_a: {
        type: String,
        required: true,
        trim: true,
        description: 'Startlocatie van de reis'
    },
    location_b: {
        type: String,
        required: true,
        trim: true,
        description: 'Eindlocatie van de reis'
    },
    vehicle: {
        type: String,
        required: true,
        trim: true,
        enum: ['Auto', 'Fiets', 'Openbaar Vervoer', 'Vliegtuig', 'Anders'],
        description: 'Gebruikt vervoermiddel'
    },
    duration: {
        type: Number,
        required: true,
        min: 0,
        description: 'Reisduur in minuten of seconden (kies een eenheid)'
    },
    distance: {
        type: Number,
        required: true,
        min: 0,
        description: 'Afstand van de reis in kilometers of mijlen (kies een eenheid)'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        description: 'Tijdstip van aanmaken van de reis (komt overeen met "time(created at)")'
    }
});

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;