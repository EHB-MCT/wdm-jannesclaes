require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 1. Importeer de route
const tripRoutes = require('./routes/tripRoutes'); // <--- DEZE HEB JE NODIG

const app = express();

app.use(express.json());
app.use(cors());

// 2. Koppel de route aan de url '/api/trips'
app.use('/api/trips', tripRoutes); // <--- DEZE HEB JE NODIG

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🔌 MongoDB Verbonden!'))
    .catch(err => console.log('❌ DB Fout:', err));

app.get('/', (req, res) => {
    res.send('API is running... WMD Project');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server draait op poort ${PORT}`);
});