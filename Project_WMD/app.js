console.log("Hello World")

const car = document.getElementById("carBtn")
const bike = document.getElementById("bikeBtn")
const train = document.getElementById("trainBtn")
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
        "Ocp-Apim-Subscription-Key": "e0e62df8f3514026b63deb400729c080", // <-- zet je echte key hier
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

async function getLijnRitData() {
  const url = "https://api.delijn.be/DLZoekOpenData/v1/zoek/lijnrichtingen/Diest?huidigePositie=51.0299814,4.9740799&maxAantalHits=3";

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
    const heenRitten = result.lijnrichtingen.filter(
      (rit) => rit.richting === "HEEN"
    );

    console.log("HEEN ritten:", heenRitten);

    // Als je bv. enkel de bestemmingen wil tonen:
    heenRitten.forEach((rit) => {
      console.log(heenRitten);
    });
    console.log(result);
  } catch (error) {
    console.error("Fout bij ophalen:", error.message);
  }
}

getLijnHalteData()

getLijnRitData()
