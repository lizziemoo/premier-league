// This file contains the JavaScript code that interacts with your Render backend proxy.
// It fetches live updates for matches and league standings, and updates the DOM.

async function fetchLiveMatches() {
    try {
        const response = await fetch('https://premier-league-live-ish.onrender.com/api/matches');
        const data = await response.json();
        displayLiveMatches(data.matches);
    } catch (error) {
        console.error('Error fetching live matches:', error);
    }
}

function displayLiveMatches(matches) {
    const scoresContainer = document.getElementById('scores-container');
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
        const response = await fetch('https://premier-league-live-ish.onrender.com/api/standings');
        const data = await response.json();
        displayLeagueTable(data.standings[0].table);
    } catch (error) {
        console.error('Error fetching league table:', error);
    }
}

function displayLeagueTable(teams) {
    const leagueTableContainer = document.getElementById('table-container');
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