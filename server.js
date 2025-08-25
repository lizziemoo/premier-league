require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.API_FOOTBALL_KEY;
const SEASON = 2025;
// Enable CORS for all routes
app.use(cors());

// Proxy endpoint for match stats
app.get('/api/matchstats', async (req, res) => {
    const fixture = req.query.fixture;
    if (!fixture) return res.status(400).json({ error: 'Missing fixture id' });
    try {
        const response = await fetch(`https://v3.football.api-sports.io/fixtures/statistics?fixture=${fixture}`, {
            headers: { 'x-apisports-key': API_KEY }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching match stats:', error);
        res.status(500).json({ error: 'Failed to fetch match stats' });
    }
});

// Proxy endpoint for lineups
app.get('/api/lineups', async (req, res) => {
    const fixture = req.query.fixture;
    if (!fixture) return res.status(400).json({ error: 'Missing fixture id' });
    try {
        const response = await fetch(`https://v3.football.api-sports.io/fixtures/lineups?fixture=${fixture}`, {
            headers: { 'x-apisports-key': API_KEY }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching lineups:', error);
        res.status(500).json({ error: 'Failed to fetch lineups' });
    }
});

// Allow CORS for local development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});



// League IDs for API-Football
const LEAGUE_IDS = {
    PL: 39, // Premier League
    CH: 40, // Championship
    L1: 41, // League One
    L2: 42  // League Two
};
const DEFAULT_LEAGUE = 39;
// const SEASON = 2025; // Use correct season for API-Football (2025/26)

// Proxy endpoint for matches (fixtures)
app.get('/api/matches', async (req, res) => {
    try {
        let leagueId = DEFAULT_LEAGUE;
        if (req.query.league) {
            // Accept league code (PL, CH, L1, L2, FAC) or numeric ID
            leagueId = LEAGUE_IDS[req.query.league] || req.query.league;
        }
        const response = await fetch(`https://v3.football.api-sports.io/fixtures?league=${leagueId}&season=${SEASON}`,
            { headers: { 'x-apisports-key': API_KEY } });
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
        let leagueId = DEFAULT_LEAGUE;
        if (req.query.league) {
            // Accept both league code (PL, CH, L1, L2) and numeric ID (39, 40, 41, 42)
            if (LEAGUE_IDS[req.query.league]) {
                leagueId = LEAGUE_IDS[req.query.league];
            } else if (!isNaN(req.query.league)) {
                leagueId = req.query.league;
            }
        }
        const apiUrl = `https://v3.football.api-sports.io/standings?league=${leagueId}&season=${SEASON}`;
        console.log('[STANDINGS] Requested league:', req.query.league, '| Resolved leagueId:', leagueId, '| API URL:', apiUrl);
        const response = await fetch(apiUrl, { headers: { 'x-apisports-key': API_KEY } });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching standings:', error);
        res.status(500).json({ error: 'Failed to fetch standings' });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});