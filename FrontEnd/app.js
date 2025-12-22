const BACKEND_URL = "http://localhost:5050";

// DOM Elements
const authSection = document.getElementById("auth-section");
const tripSection = document.getElementById("trip-section");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const currentUsername = document.getElementById("current-username");

// Auth elements
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

// Trip elements
const car = document.getElementById("carBtn");
const bike = document.getElementById("bikeBtn");
const train = document.getElementById("nmbsBtn");
const bus = document.getElementById("deLijnBtn");
const walk = document.getElementById("walkBtn");
const submitBtn = document.getElementById("submitBtn");

let transport = "";
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupEventListeners();
});

function setupEventListeners() {
    // Auth event listeners
    loginBtn.addEventListener('click', login);
    registerBtn.addEventListener('click', register);
    logoutBtn.addEventListener('click', logout);
    showRegister.addEventListener('click', showRegisterForm);
    showLogin.addEventListener('click', showLoginForm);
    
    // Trip event listeners
    car.onclick = () => setTransport("Auto");
    bike.onclick = () => setTransport("Fiets");
    train.onclick = () => setTransport("Openbaar Vervoer");
    bus.onclick = () => setTransport("Openbaar Vervoer");
    walk.onclick = () => setTransport("Anders");
    
    if (submitBtn) {
        submitBtn.onclick = submitTrip;
    }
}

function setTransport(type) { 
    transport = type; 
}

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
// Duplicate event handlers removed - already defined in setupEventListeners()

// Authentication Functions
async function login() {
    try {
        const username = document.getElementById("loginUsername").value;
        const password = document.getElementById("loginPassword").value;
        const rememberMe = document.getElementById("rememberMe").checked;

        if (!username || !password) {
            alert("Vul gebruikersnaam en wachtwoord in!");
            return;
        }

        loginBtn.textContent = "Inloggen...";
        loginBtn.disabled = true;

        const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, rememberMe })
        });

        const data = await response.json();

        if (response.ok) {
            // Store token
            if (rememberMe) {
                localStorage.setItem('authToken', data.token);
            } else {
                sessionStorage.setItem('authToken', data.token);
            }
            
            currentUser = data.user;
            showTripSection();
            loadTrips();
            
        } else {
            alert(data.message || "Inloggen mislukt");
        }

    } catch (error) {
        console.error("Login error:", error);
        alert("Inloggen mislukt. Probeer opnieuw.");
    } finally {
        loginBtn.textContent = "Inloggen";
        loginBtn.disabled = false;
    }
}

async function register() {
    try {
        const username = document.getElementById("registerUsername").value;
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (!username || !password || !confirmPassword) {
            alert("Vul alle velden in!");
            return;
        }

        if (password.length < 8) {
            alert("Wachtwoord moet minimaal 8 karakters zijn!");
            return;
        }

        if (password !== confirmPassword) {
            alert("Wachtwoorden komen niet overeen!");
            return;
        }

        registerBtn.textContent = "Registreren...";
        registerBtn.disabled = true;

        const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, confirmPassword })
        });

        const data = await response.json();

        if (response.ok) {
            // Auto-login after registration
            localStorage.setItem('authToken', data.token);
            currentUser = data.user;
            showTripSection();
            loadTrips();
            
        } else {
            alert(data.message || "Registreren mislukt");
        }

    } catch (error) {
        console.error("Register error:", error);
        alert("Registreren mislukt. Probeer opnieuw.");
    } finally {
        registerBtn.textContent = "Registreer";
        registerBtn.disabled = false;
    }
}

function logout() {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    currentUser = null;
    transport = "";
    showAuthSection();
}

function checkAuthStatus() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (token) {
        // Verify token by calling profile endpoint
        fetch(`${BACKEND_URL}/api/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(data => {
            if (response.ok) {
                currentUser = data.user;
                showTripSection();
                loadTrips();
            } else {
                showAuthSection();
            }
        })
        .catch(() => showAuthSection());
    } else {
        showAuthSection();
    }
}

function showAuthSection() {
    authSection.style.display = 'block';
    tripSection.style.display = 'none';
}

function showTripSection() {
    authSection.style.display = 'none';
    tripSection.style.display = 'block';
    currentUsername.textContent = currentUser.username;
}

function showRegisterForm(e) {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
}

function showLoginForm(e) {
    e.preventDefault();
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
}

// Trip submission (updated for authenticated user)
async function submitTrip(event) {
    event.preventDefault();

    if (!transport) {
        alert("Kies een vervoersmiddel!");
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

        
        // Get destination coordinates
        const destinationCoords = await getDestinationCoordinates(destination);

        
        // Calculate distance using Haversine formula
        const calculatedDistance = calculateDistance(
            userLocation.lat, userLocation.lon,
            destinationCoords.lat, destinationCoords.lon
        );
        
        // Calculate distance and round to 1 decimal place
        const calculatedDistanceRounded = Math.round(calculatedDistance * 10) / 10;
        


        const tripData = {
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
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        
        const response = await fetch(`${BACKEND_URL}/api/trips`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(trip)
        });

        const result = await response.json();
        
        if (response.ok) {

            loadTrips(); // Lijst verversen
            alert(`Je score: ${result.efficiencyScore}\nOordeel: ${result.status}`);
            
            // Reset form
            document.getElementById("inputDestination").value = "";
            document.getElementById("inputDuration").value = "1";
            transport = "";
            
            // Remove active button styling
            document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
            
        } else {
            alert(result.message || "Rit opslaan mislukt");
        }

    } catch (error) {
        console.error("Fout:", error);
        alert("Kan server niet bereiken");
    }
}

async function loadTrips() {
    const list = document.getElementById('tripList');
    if(!list) return;

    try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        
        const res = await fetch(`${BACKEND_URL}/api/trips`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.ok) {
            const trips = await res.json();

            list.innerHTML = "";
            if (trips.length === 0) {
                list.innerHTML = "<p>Je hebt nog geen ritten geregistreerd.</p>";
            } else {
                trips.forEach(t => {
                    const color = t.color === 'green' ? '#2ecc71' : '#ff2e1f';
                    list.innerHTML += `
                        <div class="trip-card" style="border-left: 5px solid ${color}; background: white; padding: 10px; margin-bottom: 5px;">
                            <strong style="float:right; color:${color}">${t.efficiencyScore}</strong>
                            <strong>${t.userId ? t.userId.username : 'Onbekend'}</strong><br>
                            <small>${t.vehicle} - ${t.distance}km in ${t.duration}min</small><br>
                            <small>${t.location_a} → ${t.location_b}</small><br>
                            <small>${new Date(t.createdAt).toLocaleDateString()}</small>
                        </div>`;
                });
            }
        } else {
            // Unauthorized - redirect to login
            logout();
        }
    } catch(e) { 
 
        logout();
    }
}