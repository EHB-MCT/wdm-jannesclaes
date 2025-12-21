const BACKEND_URL = "http://localhost:5050"; // <--- Let op: 5050

const car = document.getElementById("carBtn");
const bike = document.getElementById("bikeBtn");
const train = document.getElementById("nmbsBtn");
const bus = document.getElementById("deLijnBtn");
const walk = document.getElementById("walkBtn");
const submitBtn = document.getElementById("submitBtn");
const userNameInput = document.getElementById("inputUsername");

let transport = "";

function setTransport(type) { transport = type; console.log("Gekozen:", type); }
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

    const tripData = {
        username: userNameInput.value,
        vehicle: transport,
        distance: Number(document.getElementById("inputDistance").value),
        duration: Number(document.getElementById("inputDuration").value),
        location_a: "Thuis",
        location_b: document.getElementById("inputDestination").value || "Werk"
    };

    await createTrip(tripData);
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