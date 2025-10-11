console.log("Hello World")

const car = document.getElementById("carBtn")
const bike = document.getElementById("bikeBtn")
const train = document.getElementById("nmbsBtn")
const bus = document.getElementById("deLijnBtn")
const walk = document.getElementById("walkBtn")

const submitBtn = document.getElementById("submitBtn")

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

submitBtn.onclick =function(){
    console.log(`je reis met de ${transport} van ${inputDuration.value} kilometer duurde ${inputDistance.value} minuten.`)
}


async function getLijnHalteData() {
  const url = "https://api.delijn.be/DLZoekOpenData/v1/zoek/haltes/*?huidigePositie=51.0299814,4.9740799&maxAantalHits=3";

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

async function getLijnRouteData() {
  const url = "https://api.delijn.be/DLZoekOpenData/v1/zoek/lijnrichtingen/*?huidigePositie=51.0299814,4.9740799&maxAantalHits=3";

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

getLijnHalteData()
getLijnRouteData()
