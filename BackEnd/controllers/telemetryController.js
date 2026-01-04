const Telemetry = require('../models/Telemetry');

// Save batch telemetry data
const saveTelemetryBatch = async (req, res) => {
    try {
        const { events } = req.body;
        
        if (!Array.isArray(events) || events.length === 0) {
            return res.status(400).json({ 
                message: "Invalid data: events array is required" 
            });
        }

        // Validate and prepare telemetry data
        const telemetryData = events.map(event => ({
            userId: req.user.id,
            actionType: event.actionType,
            target: event.target,
            timestamp: new Date(event.timestamp),
            metadata: {
                x: event.metadata?.x || 0,
                y: event.metadata?.y || 0,
                page: event.metadata?.page || window?.location?.pathname || 'unknown',
                userAgent: event.metadata?.userAgent || req.get('User-Agent')
            }
        }));

        // Batch insert telemetry data
        const savedTelemetry = await Telemetry.insertMany(telemetryData, { 
            ordered: false // Continue on errors for individual documents
        });

        res.status(201).json({
            message: `Successfully saved ${savedTelemetry.length} telemetry events`,
            count: savedTelemetry.length
        });

    } catch (error) {
        console.error('Telemetry save error:', error);
        res.status(500).json({ 
            message: "Error saving telemetry data" 
        });
    }
};

module.exports = {
    saveTelemetryBatch
};