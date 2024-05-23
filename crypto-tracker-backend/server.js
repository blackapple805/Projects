const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./crypto-tracker-14a52-firebase-adminsdk-3byc5-95524ec5b0.json');

dotenv.config();

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL
});

const db = admin.firestore();

const app = express();
const port = process.env.PORT || 3000;

// Use CORS middleware
app.use(cors());

app.get('/', (req, res) => {
    res.send('Crypto Tracker Backend');
});

app.get('/crypto', async (req, res) => {
    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd`);
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error fetching crypto data');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
