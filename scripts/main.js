// League IDs for API-Football
const LEAGUE_IDS = {
    PL: 39, // Premier League
    CH: 40, // Championship
    L1: 41, // League One
    L2: 42  // League Two
};
let currentLeague = 'PL';

async function fetchLiveMatches() {
    try {
        const response = await fetch(`https://premier-league-live-ish.onrender.com/api/matches?league=${LEAGUE_IDS[currentLeague]}`);
        const data = await response.json();
        // API-Football: data.response is an array of fixtures
        const fixtures = data.response || [];
        const liveMatches = fixtures.filter(m => ["1H","2H","LIVE","ET","P","IN_PLAY"].includes(m.fixture.status.short));
        if (liveMatches.length > 0) {
            displayLiveMatches(liveMatches);
        } else {
            fetchRecentResults(fixtures);
        }
    } catch (error) {
        console.error('Error fetching live matches:', error);
    }
}

async function fetchLeagueTable() {
    document.getElementById('league-table').style.display = '';
    try {
        const response = await fetch(`https://premier-league-live-ish.onrender.com/api/standings?league=${LEAGUE_IDS[currentLeague]}`);
        const data = await response.json();
        // API-Football: data.response[0].league.standings[0] is the array of teams
        const standings = (data.response && data.response[0] && data.response[0].league && data.response[0].league.standings && data.response[0].league.standings[0]) || [];
        displayLeagueTable(standings);
    } catch (error) {
        console.error('Error fetching league table:', error);
    }
}
    const scoresContainer = document.getElementById('scores-container');


function displayLiveMatches(matches) {
    const scoresContainer = document.getElementById('scores-container');
    scoresContainer.innerHTML = '';
    heading.textContent = 'Current Scores';
    scoresContainer.appendChild(heading);

    matches.forEach(match => {
        const matchElement = document.createElement('div');
        matchElement.classList.add('match');
        matchElement.style.cursor = 'pointer';
        matchElement.setAttribute('data-fixid', match.fixture.id);

        const score = `${match.teams.home.name} ${match.goals.home} - ${match.goals.away} ${match.teams.away.name}`;
        matchElement.innerHTML = `
            <h4>${match.teams.home.name} vs ${match.teams.away.name}</h4>
            <p>${score}</p>
            <p>Status: ${match.fixture.status.long}</p>
        `;
        matchElement.addEventListener('click', () => openMatchModal(match.fixture.id));
        scoresContainer.appendChild(matchElement);
    });
}


function fetchRecentResults(fixtures) {
    // Use already-fetched fixtures to find recently finished ones
    const finished = (fixtures || []).filter(m => m.fixture.status.short === 'FT');
    // Sort by most recent
    finished.sort((a, b) => new Date(b.fixture.date) - new Date(a.fixture.date));
    if (finished.length === 0) {
        displayRecentResults([]);
        return;
    }
    // Group by match day (YYYY-MM-DD)
    const grouped = {};
    finished.forEach(m => {
        const date = m.fixture.date.slice(0, 10);
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(m);
    });
    // Show all matches from the most recent date with finished matches
    const dates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
    const mostRecent = dates[0];
    displayRecentResults(grouped[mostRecent]);
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
        matchElement.style.cursor = 'pointer';
        matchElement.setAttribute('data-fixid', match.fixture.id);
        const score = `${match.teams.home.name} ${match.goals.home} - ${match.goals.away} ${match.teams.away.name}`;
        matchElement.innerHTML = `
            <h4>${match.teams.home.name} vs ${match.teams.away.name}</h4>
            <p>${score}</p>
            <p>Date: ${match.fixture.date ? new Date(match.fixture.date).toLocaleString() : ''}</p>
        `;
        matchElement.addEventListener('click', () => openMatchModal(match.fixture.id));
        scoresContainer.appendChild(matchElement);
    });
}
// Modal logic for match details
function openMatchModal(fixtureId) {
    const modal = document.getElementById('match-modal');
    const modalBody = document.getElementById('modal-body');
    modal.style.display = 'block';
    modalBody.innerHTML = '<p>Loading match details...</p>';
    fetchMatchDetails(fixtureId);
}

document.getElementById('modal-close').onclick = function() {
    document.getElementById('match-modal').style.display = 'none';
};
window.onclick = function(event) {
    const modal = document.getElementById('match-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

async function fetchMatchDetails(fixtureId) {
    const modalBody = document.getElementById('modal-body');
    try {
        // Fetch stats
        const statsRes = await fetch(`https://premier-league-live-ish.onrender.com/api/matchstats?fixture=${fixtureId}`);
        const statsData = await statsRes.json();
        // Fetch lineups
        const lineupRes = await fetch(`https://premier-league-live-ish.onrender.com/api/lineups?fixture=${fixtureId}`);
        const lineupData = await lineupRes.json();
        // Render details
        modalBody.innerHTML = renderMatchDetails(statsData, lineupData);
    } catch (e) {
        modalBody.innerHTML = '<p>Unable to load match details.</p>';
    }
}

function renderMatchDetails(statsData, lineupData) {
    let html = '';
    // Stats
    if (statsData && statsData.response && statsData.response.length > 0) {
        html += '<h3>Team Stats</h3>';
        html += '<div style="display:flex;gap:24px;">';
        statsData.response.forEach(teamStats => {
            html += `<div><strong>${teamStats.team.name}</strong><ul style="padding-left:16px;">`;
            teamStats.statistics.forEach(stat => {
                html += `<li>${stat.type}: ${stat.value}</li>`;
            });
            html += '</ul></div>';
        });
        html += '</div>';
    }
    // Lineups
    if (lineupData && lineupData.response && lineupData.response.length > 0) {
        html += '<h3>Lineups</h3>';
        lineupData.response.forEach(team => {
            html += `<div><strong>${team.team.name}</strong><ul style="padding-left:16px;">`;
            team.startXI.forEach(player => {
                html += `<li>${player.player.name} (${player.player.pos})</li>`;
            });
            html += '</ul></div>';
        });
    }
    if (!html) html = '<p>No stats or lineups available for this match.</p>';
    return html;
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
        // Helper to group fixtures by day (YYYY-MM-DD)
        function groupByDay(fixturesArr) {
            const groups = {};
            fixturesArr.forEach(fix => {
                const dateObj = new Date(fix.date || fix.fixture.date);
                const dayKey = dateObj.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
                if (!groups[dayKey]) groups[dayKey] = [];
                groups[dayKey].push(fix);
            });
            return groups;
        }
        let grouped;
        let isStatic = false;
        if (fixtures.length === 0) {
            // Show static 2023 season fixtures if API returns none
            isStatic = true;
            const staticFixtures = [
                { home: 'Burnley', away: 'Manchester City', date: '2023-08-11T20:00:00Z' },
                { home: 'Arsenal', away: 'Nottingham Forest', date: '2023-08-12T12:30:00Z' },
                { home: 'Bournemouth', away: 'West Ham', date: '2023-08-12T15:00:00Z' },
                { home: 'Brighton', away: 'Luton', date: '2023-08-12T15:00:00Z' },
                { home: 'Everton', away: 'Fulham', date: '2023-08-12T15:00:00Z' }
            ];
            grouped = groupByDay(staticFixtures);
        } else {
            grouped = groupByDay(fixtures.slice(0, 10));
        }
        // Render grouped fixtures
        let first = true;
        Object.keys(grouped).forEach(day => {
            const heading = document.createElement('div');
            heading.className = 'pl-fixture-day';
            heading.textContent = day;
            lastGoalContainer.appendChild(heading);
            grouped[day].forEach((fix, idx) => {
                const div = document.createElement('div');
                div.className = 'pl-fixture-row';
                let home, away, date;
                if (isStatic) {
                    home = fix.home;
                    away = fix.away;
                    date = new Date(fix.date);
                } else {
                    home = fix.teams.home.name;
                    away = fix.teams.away.name;
                    date = new Date(fix.fixture.date);
                }
                div.textContent = `${home} vs ${away} - ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                // Add extra margin above the first fixture after heading
                if (first && idx === 0) {
                    div.style.marginTop = '18px';
                    first = false;
                }
                lastGoalContainer.appendChild(div);
            });
        });
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
            <th>MP</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th>G</th>
            <th>+/-</th>
            <th>P</th>
        </tr>
    `;
    leagueTableContainer.appendChild(thead);

    const tbody = document.createElement('tbody');
    teams.forEach(team => {
        const teamElement = document.createElement('tr');
        // Team logo
        const logo = team.team.logo ? `<img src="${team.team.logo}" alt="${team.team.name} logo" class="pl-team-logo">` : '';
        teamElement.innerHTML = `
            <td>${team.rank}</td>
            <td class="pl-team-cell">${logo}<span class="pl-team-name">${team.team.name}</span></td>
            <td>${team.all.played}</td>
            <td>${team.all.win}</td>
            <td>${team.all.draw}</td>
            <td>${team.all.lose}</td>
            <td>${team.all.goals.for}:${team.all.goals.against}</td>
            <td>${team.goalsDiff}</td>
            <td>${team.points}</td>
        `;
        tbody.appendChild(teamElement);
    });
    leagueTableContainer.appendChild(tbody);
}


function updateData() {
    fetchLiveMatches();
    fetchLeagueTable();
    // Always hide league table if FA Cup is selected
    if (currentLeague === 'FAC') {
        document.getElementById('league-table').style.display = 'none';
    } else {
        document.getElementById('league-table').style.display = '';
    }
}

// Initial fetch
updateData();
// Set interval for real-time updates
setInterval(updateData, 30000); // Update every 30 seconds