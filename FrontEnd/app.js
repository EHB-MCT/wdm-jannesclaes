console.log("Hello World")

const car = document.getElementById("carBtn")
const bike = document.getElementById("bikeBtn")
const train = document.getElementById("nmbsBtn")
const bus = document.getElementById("deLijnBtn")
const walk = document.getElementById("walkBtn")

const submitBtn = document.getElementById("submitBtn")

let coords 
let transport = ""

car.onclick = function(){
    //console.log("auto");
    transport = "auto"
};

bike.onclick = function(){
    //console.log("fiets");
    transport = "fiets"
};

train.onclick = function(){
    //console.log("trein");
    transport = "trein"
};

bus.onclick = function(){
    //console.log("trein");
    transport = "bus"

};

walk.onclick = function(){
    //console.log("te voet");
    transport = "benen"
};

submitBtn.onclick = function(event){
    event.preventDefault()
    navigator.geolocation.getCurrentPosition(succes, error, options)
    getLocationCoords()
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
  //currentLocation = `${coords.latitude}, ${coords.longitude}`
}

const error = (err) => {
  console.log(err);
}

//haltes in de buurt van huidige locatie zoeken
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

function firstLocation(locations){
  console.log(locations.features[0])
  let locationLa = locations.features[0].bbox[1]
  let locationLo = locations.features[0].bbox[0]
  let coordsDestination = `${locationLa}, ${locationLo}`
  logTransportInfo(currentLocation, coordsDestination)
}

function logTransportInfo(startPoint, destination){
  console.log(`je reisje met de ${transport} van ${inputDuration.value} kilometer duurde ${inputDistance.value} minuten. Je vertrekt van ${startPoint} en gaat naar ${destination}.`)
}