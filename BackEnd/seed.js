require('dotenv').config();
const mongoose = require('mongoose');

// Let op de puntjes: we verwijzen naar de map models
const User = require('./models/User');
const Trip = require('./models/Trip');

const DAYS_TO_SIMULATE = 90; 

// Verbinden
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wmd_project';
mongoose.connect(MONGO_URI)
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
        const bcrypt = require('bcryptjs');
        const adminHashedPassword = await bcrypt.hash('admin1234', 12);
        const admin = await User.create({ 
            username: "admin", 
            password: adminHashedPassword,
            isAdmin: true 
        });
        console.log('👑 Admin gebruiker aangemaakt: admin / admin1234');

        const sophieHashedPassword = await bcrypt.hash('sophie123', 12);
        const jonasHashedPassword = await bcrypt.hash('jonas123', 12);
        
        const sophie = await User.create({ 
            username: "Sophie_CEO", 
            password: sophieHashedPassword,
            email: "sophie@company.com" 
        });
        const jonas = await User.create({ 
            username: "Jonas_Student", 
            password: jonasHashedPassword,
            email: "jonas@student.com" 
        });

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