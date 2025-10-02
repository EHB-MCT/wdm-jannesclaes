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
