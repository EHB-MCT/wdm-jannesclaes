const express = require ("express");
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const Trip = require('./models/Trip')

const app = express();

const DB_URI = 'mongodb+srv://JannesClaes:Legolego.1407@cluster0.enmiw.mongodb.net/next_trip_db';


app.use(cors());    

app.use(express.json());

mongoose.connect(DB_URI)
    .then(() => console.log('Verbonden met MongoDB!'))
    .catch(err => console.error('Fout bij verbinding met MongoDB:', err));



app.get("/", (req, res) => {
    res.send({message: "hello"})
})

app.post('/api/createUser', async (req, res) => {
    try {
        const { username, email } = req.body; 

        if (!username || !email) {
            return res.status(400).json({ message: "Username en email zijn verplicht." });
        }

        const newUser = new User({
            username: username,
            email: email
        });

        const savedUser = await newUser.save();

        res.status(201).json({ 
            message: "Gebruiker succesvol aangemaakt", 
            user: savedUser 
        });

    } catch (error) {
        if (error.code === 11000) { 
            return res.status(400).json({ message: "Gebruikersnaam of e-mailadres is al in gebruik." });
        }
        res.status(500).json({ 
            message: 'Er is een interne serverfout opgetreden', 
            error: error.message 
        });
    }
});

app.post('/api/createTrip', async (req, res) => {
    console.log("REQ BODY BACKEND:", req.body);
    try {
        const loggedInUserId = '68f4bb94fcad753e0336415c'; 

        const newTrip = new Trip({
            userId: loggedInUserId, 
            location_a: req.body.location_a,
            location_b: req.body.location_b,
            vehicle: req.body.vehicle,
            duration: req.body.duration,
            distance: req.body.distance
        });

        const savedTrip = await newTrip.save();

        res.status(201).json(savedTrip);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});



app.listen(3000, (err)=>{
    if(!err){
        console.log("running on port: " + 3000)
    }
    else{
        console.error(err)
    }
})