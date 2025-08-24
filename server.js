require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.API_FOOTBALL_KEY || '9824f597f16e61fd4792cfe101c6e3d6';

// Allow CORS for local development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});


// Premier League league ID for API-Football is 39
const LEAGUE_ID = 39;
const SEASON = 2023; // Update to current season if needed

// Proxy endpoint for matches (fixtures)
app.get('/api/matches', async (req, res) => {
    try {
        const response = await fetch(`https://v3.football.api-sports.io/fixtures?league=${LEAGUE_ID}&season=${SEASON}`, {
            headers: { 'x-apisports-key': API_KEY }
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
        const response = await fetch(`https://v3.football.api-sports.io/standings?league=${LEAGUE_ID}&season=${SEASON}`, {
            headers: { 'x-apisports-key': API_KEY }
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