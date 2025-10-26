console.log("Hello")

const car = document.getElementById("carBtn")
const bike = document.getElementById("bikeBtn")
const train = document.getElementById("nmbsBtn")
const bus = document.getElementById("deLijnBtn")
const walk = document.getElementById("walkBtn")

let userName = document.getElementById("inputUsername")

const submitBtn = document.getElementById("submitBtn")

let coords 
let transport = ""

car.onclick = function(){
    //console.log("auto");
    transport = "Auto"
};

bike.onclick = function(){
    //console.log("fiets");
    transport = "Fiets"
};

train.onclick = function(){
    //console.log("trein");
    transport = "Trein"
};

bus.onclick = function(){
    //console.log("trein");
    transport = "Bus"

};

walk.onclick = function(){
    //console.log("te voet");
    transport = "Benen"
};

submitBtn.onclick = function(event){
    event.preventDefault();
      console.log(userName)
      navigator.geolocation.getCurrentPosition(async (pos) => {
        succes(pos);
        await getLocationCoords();
      }, error, options);
}

//geolocation constanten
const options ={
  maximumAge: 0,
  enableHighAccuracy: false,
  timeout: 15000, 
}

const succes = (pos) => {
  const coords = pos.coords;
  console.log(coords)
  getLijnHalteData(coords.latitude, coords.longitude)
  getLijnRouteData(coords.latitude, coords.longitude)
  currentLocation = `${coords.latitude}, ${coords.longitude}`
}

const error = (err) => {
  console.log(err);
}

async function getLijnHalteData(desLong, desLat) {
  const url = `https://api.delijn.be/DLZoekOpenData/v1/zoek/haltes/*?huidigePositie=${desLong},${desLat}&maxAantalHits=3`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Ocp-Apim-Subscription-Key": "e0e62df8f3514026b63deb400729c080", 
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error("Fout bij ophalen:", error.message);
  }
}

async function getLijnRouteData(desLong, desLat) {
  console.log("testPoint")
  const url = `https://api.delijn.be/DLZoekOpenData/v1/zoek/lijnrichtingen/*?huidigePositie=${desLong},${desLat}&maxAantalHits=3`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Ocp-Apim-Subscription-Key": "e0e62df8f3514026b63deb400729c080", 
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error("Fout bij ophalen:", error.message);
  }
}


async function getLijnRealTimeData() {
  const url = "https://api.delijn.be/gtfs/v3/realtime?json&tripId=3_31_20251011_0815_HEEN";

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Ocp-Apim-Subscription-Key": "348c080b6d154d0691258ebd5778eed4", 
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error("Fout bij ophalen:", error.message);
  }
}

async function getLocationCoords() {
  const destination = document.getElementById("inputDestination")
  const givenDestination = destination.value
  const url = `https://api.geoapify.com/v1/geocode/search?text=${givenDestination}&apiKey=fc7e84bdd71b4433a13395f78744f923`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    firstLocation(result)

  } catch (error) {
    console.error("Fout bij ophalen:", error.message);
  }
}

let tripData = {};

function firstLocation(locations){
  console.log(locations.features[0])
  let locationLa = locations.features[0].bbox[1]
  let locationLo = locations.features[0].bbox[0]
  let coordsDestination = `${locationLa}, ${locationLo}`
  tripData = {
    "userId": "65f0a8c2d1e4f7b6c8a9d0e3",
    "location_a": `${currentLocation}`,
    "location_b": `${coordsDestination}`,
    "vehicle": `${transport}`,
    "duration": Number(inputDuration.value),
    "distance": Number(inputDistance.value)
  };
  console.log(tripData)
  createTrip(tripData)
}

async function createTrip(trip) {
  const createTrip = JSON.stringify(trip)
  console.log("STRINGIFIED BODY:", createTrip);
  const url = `http://localhost:3000/api/createTrip`;
  console.log(trip)
  
  console.log(createTrip)
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: createTrip
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Trip succesvol aangemaakt:", result);

  } catch (error) {
    console.error("Fout bij aanmaken van trip:", error.message);
  }
}

async function getUser(username) {
  const url = `http://localhost:3000/api/getUser/${username}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json(); // <-- hier ging het mis
    console.log(result.user._id)
    let userId = result.user._id
    return userId

  } catch (error) {
    console.error("Fout bij ophalen gebruiker:", error.message);
  }
}