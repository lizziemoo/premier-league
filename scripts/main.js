// This file contains the JavaScript code that interacts with your Render backend proxy.
// It fetches live updates for matches and league standings, and updates the DOM.



async function fetchLiveMatches() {
    try {
        const response = await fetch('https://premier-league-live-ish.onrender.com/api/matches');
        const data = await response.json();
        const liveMatches = (data.matches || []).filter(m => m.status === 'LIVE' || m.status === 'IN_PLAY' || m.status === 'PAUSED');
        if (liveMatches.length > 0) {
            displayLiveMatches(liveMatches);
        } else {
            // No live matches, show recent results
            fetchRecentResults();
        }
        displayLastGoalOrFixtures(liveMatches);
    } catch (error) {
        console.error('Error fetching live matches:', error);
    }
}

function displayLiveMatches(matches) {
    const scoresContainer = document.getElementById('scores-container');
    scoresContainer.innerHTML = '';

    if (!matches || matches.length === 0) {
        scoresContainer.innerHTML = '<p>No live matches at the moment.</p>';
        return;
    }

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

async function fetchRecentResults() {
    // Fetch all matches and filter for recently finished ones
    try {
        const response = await fetch('https://premier-league-live-ish.onrender.com/api/matches');
        const data = await response.json();
        const finished = (data.matches || []).filter(m => m.status === 'FINISHED');
        // Sort by most recent
        finished.sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate));
        displayRecentResults(finished.slice(0, 5));
    } catch (error) {
        const scoresContainer = document.getElementById('scores-container');
        scoresContainer.innerHTML = '<p>Could not load recent results.</p>';
    }
}

function displayRecentResults(matches) {
    const scoresContainer = document.getElementById('scores-container');
    scoresContainer.innerHTML = '<h3>Recent Results</h3>';
    if (!matches || matches.length === 0) {
        scoresContainer.innerHTML += '<p>No recent results found.</p>';
        return;
    }
    matches.forEach(match => {
        const matchElement = document.createElement('div');
        matchElement.classList.add('match');
        const score = `${match.homeTeam.name} ${match.score.fullTime.home} - ${match.score.fullTime.away} ${match.awayTeam.name}`;
        matchElement.innerHTML = `
            <h4>${match.homeTeam.name} vs ${match.awayTeam.name}</h4>
            <p>${score}</p>
            <p>Date: ${match.utcDate ? new Date(match.utcDate).toLocaleString() : ''}</p>
        `;
        scoresContainer.appendChild(matchElement);
    });
}

async function fetchUpcomingFixtures() {
    try {
        const response = await fetch('https://premier-league-live-ish.onrender.com/api/fixtures');
        const data = await response.json();
        return data.fixtures || [];
    } catch (error) {
        console.error('Error fetching fixtures:', error);
        return [];
    }
}

async function displayLastGoalOrFixtures(matches) {
    const lastGoalContainer = document.getElementById('last-goal-container');
    const lastGoalTitle = document.getElementById('last-goal-title');
    lastGoalContainer.innerHTML = '';

    // If there are live matches, show last team to score
    if (matches && matches.length > 0) {
        let lastGoal = null;
        matches.forEach(match => {
            if (match.goals && match.goals.length > 0) {
                const last = match.goals[match.goals.length - 1];
                if (!lastGoal || new Date(last.minute) > new Date(lastGoal.minute)) {
                    lastGoal = last;
                }
            }
        });
        if (lastGoal) {
            lastGoalTitle.textContent = 'Last Team to Score';
            lastGoalContainer.innerHTML = `<p>${lastGoal.team && lastGoal.team.name ? lastGoal.team.name : 'Unknown Team'}</p>`;
        } else {
            lastGoalTitle.textContent = 'Last Team to Score';
            lastGoalContainer.innerHTML = '<p>No goals yet.</p>';
        }
    } else {
        // No live matches, show upcoming fixtures
        lastGoalTitle.textContent = 'Upcoming Fixtures';
        const fixtures = await fetchUpcomingFixtures();
        if (fixtures.length === 0) {
            lastGoalContainer.innerHTML = '<p>No upcoming fixtures found.</p>';
        } else {
            const ul = document.createElement('ul');
            fixtures.slice(0, 5).forEach(fix => {
                const li = document.createElement('li');
                li.textContent = `${fix.homeTeam.name} vs ${fix.awayTeam.name} - ${fix.utcDate ? new Date(fix.utcDate).toLocaleString() : ''}`;
                ul.appendChild(li);
            });
            lastGoalContainer.appendChild(ul);
        }
    }
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

    // Add table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Pos</th>
            <th>Team</th>
            <th>Pts</th>
        </tr>
    `;
    leagueTableContainer.appendChild(thead);

    const tbody = document.createElement('tbody');
    teams.forEach(team => {
        const teamElement = document.createElement('tr');
        teamElement.innerHTML = `
            <td>${team.position}</td>
            <td>${team.team.name}</td>
            <td>${team.points}</td>
        `;
        tbody.appendChild(teamElement);
    });
    leagueTableContainer.appendChild(tbody);
}


function updateData() {
    fetchLiveMatches();
    fetchLeagueTable();
}

// Initial fetch
updateData();
// Set interval for real-time updates
setInterval(updateData, 30000); // Update every 30 seconds