require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;

// Allow CORS for local development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

// Proxy endpoint for matches
app.get('/api/matches', async (req, res) => {
    try {
        const response = await fetch('https://api.football-data.org/v2/competitions/PL/matches', {
            headers: { 'X-Auth-Token': API_KEY }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
});

// Proxy endpoint for standings
app.get('/api/standings', async (req, res) => {
    try {
        const response = await fetch('https://api.football-data.org/v2/competitions/PL/standings', {
            headers: { 'X-Auth-Token': API_KEY }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching standings:', error);
        res.status(500).json({ error: 'Failed to fetch standings' });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
    console.log('API KEY:', API_KEY); // Debug: print API key
});