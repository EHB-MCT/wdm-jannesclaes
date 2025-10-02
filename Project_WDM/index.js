console.log("Hello World")

const car = document.getElementById("carBtn")
const bike = document.getElementById("bikeBtn")
const train = document.getElementById("trainBtn")
const walk = document.getElementById("walkBtn")

car.onclick = function(){
    console.log("auto");
};

bike.onclick = function(){
    console.log("fiets");
};

train.onclick = function(){
    console.log("trein");
};

walk.onclick = function(){
    console.log("te voet");
};

