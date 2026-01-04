// Node.js 18+ has built-in fetch, no need for node-fetch

// @desc    Geocode destination using OpenStreetMap Nominatim API
// @route   GET /api/geocode/:destination
const geocodeDestination = async (req, res) => {
    try {
        const { destination } = req.params;
        
        if (!destination) {
            return res.status(400).json({ message: "Destination is required" });
        }

        console.log('Geocoding destination:', destination);
        
        // Call OpenStreetMap Nominatim API with proper headers
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'WDM-App/1.0 (geocoding; contact: admin@wdm.app)',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Geocoding API error:', response.status, response.statusText);
            return res.status(response.status).json({ 
                message: `Geocoding service error: ${response.statusText}` 
            });
        }

        const data = await response.json();
        console.log('Geocoding response:', data);

        if (!data || data.length === 0) {
            return res.status(404).json({ 
                message: `No coordinates found for "${destination}"` 
            });
        }

        const result = data[0];
        if (!result.lat || !result.lon) {
            return res.status(422).json({ 
                message: `Invalid coordinates received for "${destination}"` 
            });
        }

        // Validate parsed coordinates
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        
        if (isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) {
            return res.status(422).json({ 
                message: `Invalid coordinate values for "${destination}"` 
            });
        }

        console.log('Successful geocoding:', { destination, lat, lon });
        
        res.json({ 
            lat, 
            lon,
            display_name: result.display_name || destination,
            success: true 
        });

    } catch (error) {
        console.error('Geocoding error:', error);
        res.status(500).json({ 
            message: `Geocoding failed: ${error.message}` 
        });
    }
};

module.exports = {
    geocodeDestination
};