const express = require ("express");
const app = express();

app.get("/", (req, res) => {
    res.send({message: "hello"})
})

app.listen(3000, (err)=>{
    if(!err){
        console.log("running on port: " + 3000)
    }
    else{
        console.error(err)
    }
})