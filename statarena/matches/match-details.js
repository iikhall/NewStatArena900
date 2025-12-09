// Get match ID from URL
const urlParams = new URLSearchParams(window.location.search);
const matchId = urlParams.get('id') || 1; // Default to match 1 if no ID provided

async function loadMatchDetails() {
    const api = new StatArenaAPI();
    try {
        const match = await api.getMatchById(matchId);
        
        if (!match) {
            alert('Match not found');
            window.location.href = 'matches.html';
            return;
        }

        // Update match header
        updateMatchHeader(match);
        
        // Update statistics
        if (match.statistics) {
            updateStatistics(match.statistics);
        }
        
        // Update lineups
        if (match.lineups) {
            updateLineups(match.lineups);
        }
    } catch (error) {
        console.error('Error loading match details:', error);
        alert('Error loading match details');
    }
}

function updateMatchHeader(match) {
    // Update team logos and names
    const homeLogoImg = document.querySelector('.left-team img');
    const homeName = document.querySelector('.left-team h2');
    const awayLogoImg = document.querySelector('.right-team img');
    const awayName = document.querySelector('.right-team h2');
    
    if (homeLogoImg && match.home_logo) homeLogoImg.src = match.home_logo;
    if (homeName) homeName.textContent = match.home_team;
    if (awayLogoImg && match.away_logo) awayLogoImg.src = match.away_logo;
    if (awayName) awayName.textContent = match.away_team;
    
    // Update score
    const scoreDisplay = document.querySelector('.match-score');
    if (scoreDisplay) {
        if (match.status === 'Upcoming') {
            scoreDisplay.textContent = 'vs';
        } else {
            scoreDisplay.textContent = `${match.home_score} - ${match.away_score}`;
        }
    }
    
    // Update status badge
    const statusBadge = document.querySelector('.live-badge');
    const matchTime = document.querySelector('.match-time');
    if (statusBadge) {
        statusBadge.textContent = match.status;
        statusBadge.className = match.status === 'LIVE' ? 'live-badge' : 
                                match.status === 'Finished' ? 'finished-badge' : 'upcoming-badge';
    }
    if (matchTime) {
        matchTime.textContent = match.match_minute || (match.status === 'Finished' ? 'FT' : 'TBD');
    }
}

function updateStatistics(stats) {
    const statRows = [
        { key: 'possession', home: stats.possession_home, away: stats.possession_away, label: 'Ball possession' },
        { key: 'xg', home: stats.xg_home, away: stats.xg_away, label: 'Expected Goals (xG)' },
        { key: 'big_chances', home: stats.big_chances_home, away: stats.big_chances_away, label: 'Big chances' },
        { key: 'total_shots', home: stats.total_shots_home, away: stats.total_shots_away, label: 'Total shots' },
        { key: 'shots_on_target', home: stats.shots_on_target_home, away: stats.shots_on_target_away, label: 'Shots on target' },
        { key: 'corners', home: stats.corners_home, away: stats.corners_away, label: 'Corner kicks' },
        { key: 'free_kicks', home: stats.free_kicks_home, away: stats.free_kicks_away, label: 'Free kicks' },
        { key: 'passes', home: stats.passes_home, away: stats.passes_away, label: 'Passes' },
        { key: 'tackles', home: stats.tackles_home, away: stats.tackles_away, label: 'Tackles' }
    ];

    const statsContainer = document.querySelector('.stats-container');
    if (!statsContainer) return;

    statsContainer.innerHTML = statRows.map(stat => {
        const total = (stat.home || 0) + (stat.away || 0);
        const homePercent = total > 0 ? ((stat.home / total) * 100).toFixed(0) : 50;
        const awayPercent = 100 - homePercent;

        return `
            <div class="stat-row">
                <div class="stat-value left">${stat.home || 0}</div>
                <div class="stat-info">
                    <div class="stat-label">${stat.label}</div>
                    <div class="stat-bar-container">
                        <div class="stat-bar left" style="width: ${homePercent}%"></div>
                        <div class="stat-bar right" style="width: ${awayPercent}%"></div>
                    </div>
                </div>
                <div class="stat-value right">${stat.away || 0}</div>
            </div>
        `;
    }).join('');
}

function updateLineups(lineups) {
    const homePlayers = lineups.filter(p => p.is_home_team);
    const awayPlayers = lineups.filter(p => !p.is_home_team);
    
    // Group by position
    const homeByPosition = {
        GK: homePlayers.filter(p => p.position_role === 'GK'),
        DF: homePlayers.filter(p => p.position_role === 'DF'),
        MF: homePlayers.filter(p => p.position_role === 'MF'),
        FW: homePlayers.filter(p => p.position_role === 'FW')
    };
    
    const awayByPosition = {
        FW: awayPlayers.filter(p => p.position_role === 'FW'),
        MF: awayPlayers.filter(p => p.position_role === 'MF'),
        DF: awayPlayers.filter(p => p.position_role === 'DF'),
        GK: awayPlayers.filter(p => p.position_role === 'GK')
    };
    
    const pitch = document.querySelector('.pitch');
    if (!pitch) return;
    
    pitch.innerHTML = `
        ${renderLineupRow(homeByPosition.GK, 2)}
        ${renderLineupRow(homeByPosition.DF, 10)}
        ${renderLineupRow(homeByPosition.MF, 28)}
        ${renderLineupRow(homeByPosition.FW, 46)}
        ${renderLineupRow(awayByPosition.FW, 54)}
        ${renderLineupRow(awayByPosition.MF, 72)}
        ${renderLineupRow(awayByPosition.DF, 90)}
        ${renderLineupRow(awayByPosition.GK, 98)}
    `;
}

function renderLineupRow(players, topPercent) {
    if (!players || players.length === 0) return '';
    
    return `
        <div class="pitch-row" style="top: ${topPercent}%;">
            ${players.map(player => `
                <div class="player-circle">
                    <div class="player-number-circle">${player.jersey_number || '?'}</div>
                    <div class="player-name">${player.player_name || 'Unknown'}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active to clicked button
    event.target.classList.add('active');
}

// Load match details when page loads
loadMatchDetails();
