// This file contains the JavaScript code that interacts with your Render backend proxy.
// It fetches live updates for matches and league standings, and updates the DOM.





// League IDs for API-Football
const LEAGUE_IDS = {
    PL: 39, // Premier League
    CH: 40, // Championship
    L1: 41, // League One
    L2: 42, // League Two
    FAC: 45 // FA Cup
};
let currentLeague = 'PL';

async function fetchLiveMatches() {
    // For FA Cup, show info instead of matches
    if (currentLeague === 'FAC') {
        displayFACupInfo();
        return;
    }
    try {
        const response = await fetch(`https://premier-league-live-ish.onrender.com/api/matches?league=${LEAGUE_IDS[currentLeague]}`);
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

async function fetchLeagueTable() {
    if (currentLeague === 'FAC') {
        displayFACupInfo();
        // Hide league table container for FA Cup
        document.getElementById('league-table').style.display = 'none';
        return;
    } else {
        document.getElementById('league-table').style.display = '';
    }
    try {
        console.log('Fetching league table for league:', currentLeague, 'ID:', LEAGUE_IDS[currentLeague]);
        const response = await fetch(`https://premier-league-live-ish.onrender.com/api/standings?league=${LEAGUE_IDS[currentLeague]}`);
        const data = await response.json();
        console.log('Received standings data:', data);
        // API-Football: data.response[0].league.standings[0] is the array of teams
        const standings = (data.response && data.response[0] && data.response[0].league && data.response[0].league.standings && data.response[0].league.standings[0]) || [];
        displayLeagueTable(standings);
    } catch (error) {
        console.error('Error fetching league table:', error);
    }
}

async function displayFACupInfo() {
    // Replace main content with FA Cup info
    const scoresContainer = document.getElementById('scores-container');
    const lastGoalContainer = document.getElementById('last-goal-container');
    const lastGoalTitle = document.getElementById('last-goal-title');
    const leagueTableContainer = document.getElementById('table-container');

    // Left: Real FA Cup Results (recent finished matches)
    scoresContainer.innerHTML = '<h3>Current Scores</h3><div id="facup-results">Loading results...</div>';
    fetchFACupResults();

    // Right: Real FA Cup Fixtures (upcoming matches)
    lastGoalTitle.textContent = 'FA Cup Fixtures';
    lastGoalContainer.innerHTML = '<div id="facup-fixtures">Loading fixtures...</div>';
    fetchFACupFixtures();

    // Middle: News
    leagueTableContainer.innerHTML = '<h3>FA Cup News</h3><div id="facup-news">Loading latest FA Cup news...</div>';
    fetchFACupNews();
}

async function fetchFACupResults() {
    const resultsContainer = document.getElementById('facup-results');
    try {
        const response = await fetch(`https://premier-league-live-ish.onrender.com/api/matches?league=FAC`);
        const data = await response.json();
        // Find recently finished matches (status FT)
        const finished = (data.response || []).filter(fix => fix.fixture.status.short === 'FT');
        if (finished.length === 0) {
            resultsContainer.textContent = 'No recent results found.';
            return;
        }
        resultsContainer.innerHTML = '<ul class="facup-results-list">' +
            finished.slice(0, 10).map(fix =>
                `<li>${fix.teams.home.name} ${fix.goals.home} - ${fix.goals.away} ${fix.teams.away.name} <span class="facup-result-date">(${new Date(fix.fixture.date).toLocaleDateString()})</span></li>`
            ).join('') + '</ul>';
    } catch (e) {
        resultsContainer.textContent = 'Unable to load results.';
    }
}

async function fetchFACupFixtures() {
    const fixturesContainer = document.getElementById('facup-fixtures');
    try {
        const response = await fetch(`https://premier-league-live-ish.onrender.com/api/matches?league=FAC`);
        const data = await response.json();
        const fixtures = (data.response || []).filter(fix => fix.fixture.status.short === 'NS');
        if (fixtures.length === 0) {
            fixturesContainer.textContent = 'No upcoming fixtures found.';
            return;
        }
        fixturesContainer.innerHTML = '<ul class="facup-fixture-list">' +
            fixtures.slice(0, 10).map(fix =>
                `<li>${fix.teams.home.name} vs ${fix.teams.away.name} - ${new Date(fix.fixture.date).toLocaleString()}</li>`
            ).join('') + '</ul>';
    } catch (e) {
        fixturesContainer.textContent = 'Unable to load fixtures.';
    }
}

async function fetchFACupNews() {
    const newsContainer = document.getElementById('facup-news');
    try {
        // Use NewsAPI for demonstration (replace with your own API key if needed)
        const apiKey = 'demo'; // Replace with your NewsAPI key
        const url = `https://newsapi.org/v2/everything?q=fa%20cup&language=en&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.articles && data.articles.length > 0) {
            newsContainer.innerHTML = '<ul class="facup-news-list">' +
                data.articles.map(article =>
                    `<li><a href="${article.url}" target="_blank">${article.title}</a><br><span class="facup-news-source">${article.source.name} - ${new Date(article.publishedAt).toLocaleDateString()}</span></li>`
                ).join('') + '</ul>';
        } else {
            newsContainer.textContent = 'No recent FA Cup news found.';
        }
    } catch (e) {
        newsContainer.textContent = 'Unable to load news.';
    }
}

// Tab switching logic
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.pl-tab');
    const leagueLogos = {
        PL: { src: 'assets/premier-league.png', alt: 'Premier League' },
        CH: { src: 'assets/championship.png', alt: 'Championship' },
        L1: { src: 'assets/league-one.png', alt: 'League One' },
        L2: { src: 'assets/league-two.png', alt: 'League Two' }
    };
    const leagueTitles = {
    PL: 'Premier League 25/26',
    CH: 'Championship 25/26',
    L1: 'League One 25/26',
    L2: 'League Two 25/26'
    };
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('pl-tab-active')) return;
            document.querySelector('.pl-tab-active').classList.remove('pl-tab-active');
            tab.classList.add('pl-tab-active');
            currentLeague = tab.getAttribute('data-league');
            // Update header logo and title
            const logo = document.getElementById('main-league-logo');
            const title = document.getElementById('main-league-title');
            logo.src = leagueLogos[currentLeague].src;
            logo.alt = leagueLogos[currentLeague].alt;
            // Clear the heading and set only the correct league name
            title.textContent = '';
            title.textContent = leagueTitles[currentLeague];
            document.getElementById('league-table').style.display = '';
            document.getElementById('scores-container').innerHTML = '';
            document.getElementById('last-goal-title').textContent = '';
            document.getElementById('last-goal-container').innerHTML = '';
            updateData();
        });
    });
});

function displayLiveMatches(matches) {
    const scoresContainer = document.getElementById('scores-container');
    scoresContainer.innerHTML = '';

    if (!matches || matches.length === 0) {
        scoresContainer.innerHTML = '<p>No live matches at the moment.</p>';
        return;
    }

    // Only show heading if there are live matches
    const heading = document.createElement('h3');
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
    // Get the date from the first match (all matches are from the same day)
    const matchDate = matches[0].fixture.date ? new Date(matches[0].fixture.date) : null;
    if (matchDate) {
        const dateDiv = document.createElement('div');
        dateDiv.style.fontWeight = 'bold';
        dateDiv.style.fontSize = '1.1em';
        dateDiv.style.marginBottom = '8px';
        dateDiv.textContent = matchDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        scoresContainer.appendChild(dateDiv);
    }
    // Create a flex container for compact cards
    const resultsFlex = document.createElement('div');
    resultsFlex.style.display = 'flex';
    resultsFlex.style.flexWrap = 'wrap';
    resultsFlex.style.gap = '12px';
    resultsFlex.style.justifyContent = 'flex-start';
    matches.forEach(match => {
        const matchElement = document.createElement('div');
        matchElement.classList.add('match', 'compact-result');
        matchElement.style.cursor = 'pointer';
        matchElement.setAttribute('data-fixid', match.fixture.id);
        matchElement.style.flex = '0 1 220px';
        matchElement.style.fontSize = '0.95em';
        matchElement.style.padding = '8px 10px';
        matchElement.style.margin = '0';
        matchElement.style.minWidth = '0';
        const score = `${match.teams.home.name} ${match.goals.home} - ${match.goals.away} ${match.teams.away.name}`;
        matchElement.innerHTML = `
            <strong>${match.teams.home.name}</strong> <span style="color:#aaa;">vs</span> <strong>${match.teams.away.name}</strong><br>
            <span style="font-size:1.1em;">${score}</span>
        `;
        matchElement.addEventListener('click', () => openMatchModal(match.fixture.id));
        resultsFlex.appendChild(matchElement);
    });
    scoresContainer.appendChild(resultsFlex);
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