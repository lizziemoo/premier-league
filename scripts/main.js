// This file contains the JavaScript code that interacts with your Render backend proxy.
// It fetches live updates for matches and league standings, and updates the DOM.




async function fetchLiveMatches() {
    try {
        const response = await fetch('https://premier-league-live-ish.onrender.com/api/matches');
        const data = await response.json();
        // API-Football: data.response is an array of fixtures
        const fixtures = data.response || [];
        const liveMatches = fixtures.filter(m => m.fixture.status.short === '1H' || m.fixture.status.short === '2H' || m.fixture.status.short === 'LIVE' || m.fixture.status.short === 'ET' || m.fixture.status.short === 'P' || m.fixture.status.short === 'IN_PLAY');
        if (liveMatches.length > 0) {
            displayLiveMatches(liveMatches);
        } else {
            // No live matches, show recent results
            fetchRecentResults(fixtures);
        }
        displayLastGoalOrFixtures(liveMatches, fixtures);
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

        const score = `${match.teams.home.name} ${match.goals.home} - ${match.goals.away} ${match.teams.away.name}`;
        matchElement.innerHTML = `
            <h3>${match.teams.home.name} vs ${match.teams.away.name}</h3>
            <p>${score}</p>
            <p>Status: ${match.fixture.status.long}</p>
        `;
        scoresContainer.appendChild(matchElement);
    });
}


function fetchRecentResults(fixtures) {
    // Use already-fetched fixtures to find recently finished ones
    const finished = (fixtures || []).filter(m => m.fixture.status.short === 'FT');
    // Sort by most recent
    finished.sort((a, b) => new Date(b.fixture.date) - new Date(a.fixture.date));
    displayRecentResults(finished.slice(0, 5));
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
        const score = `${match.teams.home.name} ${match.goals.home} - ${match.goals.away} ${match.teams.away.name}`;
        matchElement.innerHTML = `
            <h4>${match.teams.home.name} vs ${match.teams.away.name}</h4>
            <p>${score}</p>
            <p>Date: ${match.fixture.date ? new Date(match.fixture.date).toLocaleString() : ''}</p>
        `;
        scoresContainer.appendChild(matchElement);
    });
}


function getUpcomingFixtures(fixtures) {
    // Find fixtures with status 'NS' (Not Started)
    const upcoming = (fixtures || []).filter(m => m.fixture.status.short === 'NS');
    // Sort by soonest
    upcoming.sort((a, b) => new Date(a.fixture.date) - new Date(b.fixture.date));
    return upcoming;
}

function displayLastGoalOrFixtures(liveMatches, allFixtures) {
    const lastGoalContainer = document.getElementById('last-goal-container');
    const lastGoalTitle = document.getElementById('last-goal-title');
    lastGoalContainer.innerHTML = '';

    // If there are live matches, show last team to score (not available in API-Football free tier, so just show live match info)
    if (liveMatches && liveMatches.length > 0) {
        lastGoalTitle.textContent = 'Last Team to Score';
        lastGoalContainer.innerHTML = '<p>Live matches in progress.</p>';
    } else {
        // No live matches, show upcoming fixtures
        lastGoalTitle.textContent = 'Upcoming Fixtures';
        const fixtures = getUpcomingFixtures(allFixtures);
        if (fixtures.length === 0) {
            lastGoalContainer.innerHTML = '<p>No upcoming fixtures found.</p>';
        } else {
            const ul = document.createElement('ul');
            fixtures.slice(0, 5).forEach(fix => {
                const li = document.createElement('li');
                li.textContent = `${fix.teams.home.name} vs ${fix.teams.away.name} - ${fix.fixture.date ? new Date(fix.fixture.date).toLocaleString() : ''}`;
                ul.appendChild(li);
            });
            lastGoalContainer.appendChild(ul);
        }
    }
    // Add Manchester United games since last win box
    displayMUGamesSinceWin(allFixtures);
}

function displayMUGamesSinceWin(allFixtures) {
    const box = document.getElementById('mu-games-since-win');
    if (!box) return;
    // Find all finished fixtures for Manchester United
    const finished = (allFixtures || []).filter(m => m.fixture.status.short === 'FT' &&
        (m.teams.home.name === 'Manchester United' || m.teams.away.name === 'Manchester United'));
    // Find the most recent win
    let gamesSinceWin = 0;
    let foundWin = false;
    for (let i = 0; i < finished.length; i++) {
        const match = finished[i];
        const isHome = match.teams.home.name === 'Manchester United';
        const isAway = match.teams.away.name === 'Manchester United';
        let muGoals = isHome ? match.goals.home : match.goals.away;
        let oppGoals = isHome ? match.goals.away : match.goals.home;
        if (muGoals > oppGoals) {
            foundWin = true;
            break;
        }
        gamesSinceWin++;
    }
    if (finished.length === 0) {
        box.textContent = 'No finished matches for Manchester United.';
    } else if (!foundWin) {
        box.textContent = 'Manchester United have not won any matches this season.';
    } else if (gamesSinceWin === 0) {
        box.textContent = 'Manchester United won their last match!';
    } else {
        box.textContent = `${gamesSinceWin} game${gamesSinceWin === 1 ? '' : 's'} since Manchester United last won a match.`;
    }
}



async function fetchLeagueTable() {
    try {
        const response = await fetch('https://premier-league-live-ish.onrender.com/api/standings');
        const data = await response.json();
        // API-Football: data.response[0].league.standings[0] is the array of teams
        const standings = (data.response && data.response[0] && data.response[0].league && data.response[0].league.standings && data.response[0].league.standings[0]) || [];
        displayLeagueTable(standings);
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
    teams.forEach((team, idx) => {
        const teamElement = document.createElement('tr');
        // Add special classes for 5th and 18th place borders
        if (team.rank === 4) {
            teamElement.classList.add('champions-league-border');
        }
        if (team.rank === 18) {
            teamElement.classList.add('relegation-border');
        }
        teamElement.innerHTML = `
            <td>${team.rank}</td>
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