const Trip = require('../models/Trip');
const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://wmd_ollama:11434';

// @desc    Predict optimal trip details using Ollama Mistral
// @route   GET /api/predict/trip (protected)
exports.getTripPrediction = async (req, res) => {
    try {
        const { destination, distance } = req.query;
        const userId = req.user.id;

        if (!destination || !distance) {
            return res.status(400).json({ 
                message: "Destination and distance are required" 
            });
        }

        // Get user's trip history for context
        const userTrips = await Trip.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10);

        // Get all trips for broader patterns (limited for performance)
        const allTrips = await Trip.find({})
            .sort({ createdAt: -1 })
            .limit(50);

        // Format data for Ollama
        const prompt = formatPromptForOllama(userTrips, allTrips, destination, parseFloat(distance));

        // Call Ollama API
        const ollamaResponse = await callOllamaAPI(prompt);

        // Parse and return prediction
        const prediction = parseOllamaResponse(ollamaResponse);

        res.status(200).json(prediction);

    } catch (error) {
        console.error("Prediction error:", error);
        res.status(500).json({ 
            message: "Failed to generate prediction",
            error: error.message 
        });
    }
};

// Format trip data and create prompt for Ollama
function formatPromptForOllama(userTrips, allTrips, destination, distance) {
    const currentUsernHistory = userTrips.map(trip => ({
        vehicle: trip.vehicle,
        distance: trip.distance,
        duration: trip.duration,
        efficiencyScore: (trip.distance / trip.duration) * 100,
        location_b: trip.location_b
    }));

    const similarTrips = allTrips
        .filter(trip => 
            Math.abs(trip.distance - distance) <= (distance * 0.3) // Within 30% distance range
        )
        .map(trip => ({
            vehicle: trip.vehicle,
            distance: trip.distance,
            duration: trip.duration,
            efficiencyScore: (trip.distance / trip.duration) * 100
        }))
        .slice(0, 10);

    const prompt = `
You are a transportation prediction AI. Analyze the following data to predict the optimal trip details.

USER HISTORY:
${currentUsernHistory.map((trip, i) => 
    `Trip ${i+1}: ${trip.vehicle} - ${trip.distance}km in ${trip.duration}h (Score: ${trip.efficiencyScore.toFixed(1)})`
).join('\n') || 'No previous trips'}

SIMILAR TRIPS (same distance range):
${similarTrips.map((trip, i) => 
    `Similar ${i+1}: ${trip.vehicle} - ${trip.distance}km in ${trip.duration}h (Score: ${trip.efficiencyScore.toFixed(1)})`
).join('\n') || 'No similar trips found'}

NEW TRIP DETAILS:
- Destination: ${destination}
- Distance: ${distance}km

Based on the historical data and patterns, predict the optimal trip details. Consider:
1. User's preferred transport methods from history
2. Efficiency scores from similar trips
3. Reasonable duration for the distance
4. Expected efficiency score

Respond in JSON format exactly like this:
{
    "predictedVehicle": "Car|Bike|Public Transport|Walking",
    "predictedDuration": number,
    "predictedDestination": "${destination}",
    "predictedScore": number,
    "confidence": number,
    "reasoning": "Brief explanation of the prediction"
}

Vehicle guidelines:
- Te Voet (Walking): < 5km, duration ~ distance/5
- Fiets (Bike): 5-15km, duration ~ distance/15  
- NMBS/De Lijn (Public Transport): 10-50km, duration ~ distance/8
- Auto (Car): > 10km, duration ~ distance/40

Duration should be in hours (decimal allowed). Score calculated as (distance/duration)*100. Confidence 0-100.
`;

    return prompt;
}

// Call Ollama API with Mistral model
async function callOllamaAPI(prompt) {
    try {
        const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
            model: 'mistral',
            prompt: prompt,
            stream: false,
            options: {
                temperature: 0.3,
                top_p: 0.9,
                max_tokens: 500
            }
        }, {
            timeout: 30000 // 30 second timeout
        });

        return response.data;
    } catch (error) {
        console.error('Ollama API call failed:', error.message);
        throw new Error('Failed to connect to AI service');
    }
}

// Parse Ollama response and extract JSON
function parseOllamaResponse(ollamaResponse) {
    try {
        const responseText = ollamaResponse.response;
        
        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in AI response');
        }

        const prediction = JSON.parse(jsonMatch[0]);

        // Validate and sanitize response
        const validVehicles = ['Auto', 'Fiets', 'Openbaar Vervoer', 'NMBS', 'De Lijn', 'Te Voet'];
        
        return {
            predictedVehicle: validVehicles.includes(prediction.predictedVehicle) 
                ? prediction.predictedVehicle 
                : 'Car',
            predictedDuration: Math.max(0.1, Math.min(24, parseFloat(prediction.predictedDuration) || 1)),
            predictedDestination: prediction.predictedDestination || 'Unknown',
            predictedScore: Math.max(0, Math.min(100, parseFloat(prediction.predictedScore) || 30)),
            confidence: Math.max(0, Math.min(100, parseFloat(prediction.confidence) || 50)),
            reasoning: prediction.reasoning || 'AI prediction based on historical patterns'
        };

    } catch (error) {
        console.error('Failed to parse Ollama response:', error);
        
        // Return fallback prediction
        return {
            predictedVehicle: 'Auto',
            predictedDuration: 1,
            predictedDestination: destination,
            predictedScore: 30,
            confidence: 25,
            reasoning: 'Fallback prediction due to AI service error'
        };
    }
}

// @desc    Health check for prediction service
// @route   GET /api/predict/health
exports.healthCheck = async (req, res) => {
    try {
        // Test Ollama connection
        const response = await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 5000 });
        
        res.status(200).json({ 
            status: 'healthy',
            ollamaAvailable: true,
            models: response.data.models?.map(m => m.name) || []
        });
    } catch (error) {
        res.status(503).json({ 
            status: 'unhealthy',
            ollamaAvailable: false,
            error: error.message 
        });
    }
};