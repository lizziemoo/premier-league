// This file contains the JavaScript code that interacts with the football-data.org API. 
// It fetches live updates for matches, scores, goal scorers, and league standings. 
// It also handles real-time updates and DOM manipulation to display the latest information.

const apiKey = 'YOUR_API_KEY'; // Replace with your actual API key
const baseUrl = 'https://api.football-data.org/v2/';

async function fetchLiveMatches() {
    try {
        const response = await fetch(`${baseUrl}matches`, {
            headers: {
                'X-Auth-Token': apiKey
            }
        });
        const data = await response.json();
        displayLiveMatches(data.matches);
    } catch (error) {
        console.error('Error fetching live matches:', error);
    }
}

function displayLiveMatches(matches) {
    const scoresContainer = document.getElementById('scores');
    scoresContainer.innerHTML = '';

    matches.forEach(match => {
        const matchElement = document.createElement('div');
        matchElement.classList.add('match');

        const score = `${match.homeTeam.name} ${match.score.fullTime.home} - ${match.score.fullTime.away} ${match.awayTeam.name}`;
        matchElement.innerHTML = `
            <h3>${match.homeTeam.name} vs ${match.awayTeam.name}</h3>
            <p>${score}</p>
            <p>Goals: ${match.score.fullTime.home > 0 ? match.homeTeam.name + ' ' + match.score.fullTime.home : ''} ${match.score.fullTime.away > 0 ? match.awayTeam.name + ' ' + match.score.fullTime.away : ''}</p>
            <p>Status: ${match.status}</p>
        `;
        scoresContainer.appendChild(matchElement);
    });
}

async function fetchLeagueTable() {
    try {
        const response = await fetch(`${baseUrl}competitions/PL/standings`, {
            headers: {
                'X-Auth-Token': apiKey
            }
        });
        const data = await response.json();
        displayLeagueTable(data.standings[0].table);
    } catch (error) {
        console.error('Error fetching league table:', error);
    }
}

function displayLeagueTable(teams) {
    const leagueTableContainer = document.getElementById('league-table');
    leagueTableContainer.innerHTML = '';

    teams.forEach(team => {
        const teamElement = document.createElement('tr');
        teamElement.innerHTML = `
            <td>${team.position}</td>
            <td>${team.team.name}</td>
            <td>${team.points}</td>
        `;
        leagueTableContainer.appendChild(teamElement);
    });
}

function updateData() {
    fetchLiveMatches();
    fetchLeagueTable();
}

// Initial fetch
updateData();
// Set interval for real-time updates
setInterval(updateData, 30000); // Update every 30 seconds