const BACKEND_URL = "http://localhost:5050"; // <--- Backend running on port 5050

const car = document.getElementById("carBtn");
const bike = document.getElementById("bikeBtn");
const train = document.getElementById("nmbsBtn");
const bus = document.getElementById("deLijnBtn");
const walk = document.getElementById("walkBtn");
const submitBtn = document.getElementById("submitBtn");
const userNameInput = document.getElementById("inputUsername");

let transport = "";

function setTransport(type) { transport = type; console.log("Gekozen:", type); }

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

// Get coordinates from OpenStreetMap Nominatim API
async function getDestinationCoordinates(destination) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}`);
    const data = await response.json();
    
    if (data && data.length > 0) {
        return {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon)
        };
    }
    throw new Error(`Geen coördinaten gevonden voor "${destination}"`);
}

// Get user's current location
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation wordt niet ondersteund door je browser'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
            },
            (error) => {
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        reject(new Error('Locatietoegang geweigerd. Sta locatie toe in je browser instellingen.'));
                        break;
                    case error.POSITION_UNAVAILABLE:
                        reject(new Error('Locatie informatie niet beschikbaar.'));
                        break;
                    case error.TIMEOUT:
                        reject(new Error('Locatie verzoek timeout.'));
                        break;
                    default:
                        reject(new Error('Onbekende locatie fout.'));
                        break;
                }
            }
        );
    });
}
car.onclick = () => setTransport("Auto");
bike.onclick = () => setTransport("Fiets");
train.onclick = () => setTransport("Trein");
bus.onclick = () => setTransport("Bus");
walk.onclick = () => setTransport("Benen");

// Submit
submitBtn.onclick = async function(event) {
    event.preventDefault();

    if (!userNameInput.value || !transport) {
        alert("Vul alles in!");
        return;
    }

    const destination = document.getElementById("inputDestination").value || "Werk";
    
    // Change button text to show loading state
    const originalButtonText = submitBtn.textContent;
    submitBtn.textContent = "Calculating...";
    submitBtn.disabled = true;

    try {
        // Get user's current location
        const userLocation = await getCurrentLocation();
        console.log("User location:", userLocation);
        
        // Get destination coordinates
        const destinationCoords = await getDestinationCoordinates(destination);
        console.log("Destination coordinates:", destinationCoords);
        
        // Calculate distance using Haversine formula
        const calculatedDistance = calculateDistance(
            userLocation.lat, userLocation.lon,
            destinationCoords.lat, destinationCoords.lon
        );
        
        // Calculate distance and round to 1 decimal place
        const calculatedDistanceRounded = Math.round(calculatedDistance * 10) / 10;
        
        console.log(`Calculated distance: ${calculatedDistanceRounded.toFixed(1)} km`);

        const tripData = {
            username: userNameInput.value,
            vehicle: transport,
            distance: calculatedDistanceRounded,
            duration: Number(document.getElementById("inputDuration").value),
            location_a: "Thuis",
            location_b: destination
        };

        await createTrip(tripData);

    } catch (error) {
        console.error("Fout bij berekening:", error);
        alert(`Fout bij afstandsberekening: ${error.message}\n\nControleer je locatietoegang en internetverbinding.`);
    } finally {
        // Restore button state
        submitBtn.textContent = originalButtonText;
        submitBtn.disabled = false;
    }
}

async function createTrip(trip) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/trips`, { // <--- Route is /api/trips
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(trip)
        });

        const result = await response.json();
        console.log("✅ Opgeslagen:", result);
        
        loadTrips(); // Lijst verversen
        alert(`Je score: ${result.efficiencyScore}\nOordeel: ${result.status}`);

    } catch (error) {
        console.error("Fout:", error);
        alert("Kan server niet bereiken op 5050");
    }
}

async function loadTrips() {
    const list = document.getElementById('tripList');
    if(!list) return;

    try {
        const res = await fetch(`${BACKEND_URL}/api/trips`);
        const trips = await res.json();

        list.innerHTML = "";
        trips.reverse().forEach(t => {
            const color = t.color === 'green' ? '#2ecc71' : '#ff2e1f';
            list.innerHTML += `
                <div class="trip-card" style="border-left: 5px solid ${color}; background: white; padding: 10px; margin-bottom: 5px;">
                    <strong style="float:right; color:${color}">${t.efficiencyScore}</strong>
                    <strong>${t.userId ? t.userId.username : 'Onbekend'}</strong><br>
                    <small>${t.vehicle}</small>
                </div>`;
        });
    } catch(e) { console.log(e); }
}

// Start
loadTrips();