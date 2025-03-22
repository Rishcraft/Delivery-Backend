require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const allowedOrigins = [
    'https://rishcraft.github.io/Delivery-Website/', // Your frontend domain
    'https://delivery-backend-2ox1.onrender.com', // Backend domain
    'http://localhost:3000' // Optional for local testing
];

const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200, // For legacy browser support
};

app.use(cors(corsOptions));


// MySQL Setup
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// API Endpoints

app.post('/schedulePickup', async (req, res) => {
    const { name, pickupAddress, deliveryAddress, contactNumber, packageDetails } = req.body;
    try {
        console.log('Received schedulePickup request:', req.body); // Log the request body

        const [result] = await pool.query(
            'INSERT INTO pickup_requests (name, pickup_address, delivery_address, contact_number, package_details) VALUES (?, ?, ?, ?, ?)',
            [name, pickupAddress, deliveryAddress, contactNumber, packageDetails]
        );

        console.log('MySQL insertion successful:', result); // Log MySQL result

        res.json({ message: 'Pickup scheduled successfully!', insertId: result.insertId });
    } catch (error) {
        console.error('Error saving pickup request:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

app.get('/pickupRequests', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM pickup_requests ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error retrieving pickup requests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/pickupRequests', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM pickup_requests ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error retrieving pickup requests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
