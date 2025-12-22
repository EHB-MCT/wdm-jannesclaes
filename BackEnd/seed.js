require('dotenv').config();
const mongoose = require('mongoose');

// Let op de puntjes: we verwijzen naar de map models
const User = require('./models/User');
const Trip = require('./models/Trip');

const DAYS_TO_SIMULATE = 90; 

// Verbinden
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('🔌 Verbonden voor seeding...');
        seedData();
    })
    .catch(err => console.log(err));

async function seedData() {
    try {
        await User.deleteMany({});
        await Trip.deleteMany({});
        console.log('🧹 Oude data verwijderd.');

        // De Users
        const sophie = await User.create({ username: "Sophie_CEO", email: "sophie@company.com" });
        const jonas = await User.create({ username: "Jonas_Student", email: "jonas@student.com" });

        const trips = [];
        
        // De Loop (90 dagen terug)
        for (let i = DAYS_TO_SIMULATE; i >= 0; i--) {
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() - i);
            const isWeekend = (currentDate.getDay() === 0 || currentDate.getDay() === 6);

            // SOPHIE (Rijk, Auto)
            if (!isWeekend) {
                trips.push({
                    userId: sophie._id,
                    location_a: "Brasschaat",
                    location_b: "Antwerpen Zuid",
                    vehicle: "Auto",
                    distance: 15,
                    duration: 25 + Math.random() * 10,
                    createdAt: currentDate
                });
            }

            // JONAS (Student, OV)
            if (!isWeekend) {
                trips.push({
                    userId: jonas._id,
                    location_a: "Borgerhout",
                    location_b: "Noord",
                    vehicle: "Openbaar Vervoer",
                    distance: 8,
                    duration: 45 + Math.random() * 20, // Veel trager
                    createdAt: currentDate
                });
            }
        }

        await Trip.insertMany(trips);
        console.log(`✅ Succes! ${trips.length} ritten aangemaakt.`);
        process.exit();
    } catch (error) {
        console.error("❌ Fout:", error);
        process.exit(1);
    }
}