const mongoose = require('mongoose');

const telemetrySchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    actionType: { 
        type: String, 
        enum: ['click', 'hover', 'move'], 
        required: true 
    },
    target: { 
        type: String, 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    },
    metadata: {
        x: { type: Number },
        y: { type: Number },
        page: { type: String },
        userAgent: { type: String }
    }
});

// Index for faster queries by userId and timestamp
telemetrySchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Telemetry', telemetrySchema);