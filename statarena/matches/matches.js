// Load only upcoming matches (live and finished are hardcoded)
async function loadMatches() {
    try {
        console.log('Loading matches from API...');
        const response = await fetch('http://localhost:3000/api/matches');
        const matches = await response.json();
        
        console.log('Total matches received:', matches.length);
        console.log('All matches:', matches);
        
        if (!matches || matches.length === 0) {
            console.log('No matches found');
            return;
        }
        
        // Filter matches by status
        const upcomingMatches = matches.filter(m => m.status === 'Upcoming');
        const finishedMatches = matches.filter(m => m.status === 'Finished');
        const liveMatches = matches.filter(m => m.status === 'LIVE');
        
        console.log('Upcoming matches found:', upcomingMatches.length);
        console.log('Finished matches found:', finishedMatches.length);
        console.log('Live matches found:', liveMatches.length);
        
        displayUpcomingMatches(upcomingMatches);
        displayFinishedMatches(finishedMatches);
        displayLiveMatches(liveMatches);
        
    } catch (error) {
        console.error('Error loading matches:', error);
    }
}

// Display live matches
function displayLiveMatches(matches) {
    const container = document.getElementById('live-matches-container');
    
    if (!matches || matches.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #64748b;">No live matches at the moment</p>';
        return;
    }
    
    container.innerHTML = matches.map(match => {
        // Use logo from database or fallback to default
        const homeLogo = match.home_logo || 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg';
        const awayLogo = match.away_logo || 'https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg';
        
        return `
        <div class="match-row">
            <span class="status-badge live-badge">LIVE</span>
            <div class="team-section">
                <span class="team-name">${match.home_team}</span>
                <img src="${homeLogo}" alt="${match.home_team}" class="team-logo-small" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg'">
            </div>
            <div class="score-display">${match.home_score !== null ? match.home_score : 0}-${match.away_score !== null ? match.away_score : 0}</div>
            <div class="team-section">
                <img src="${awayLogo}" alt="${match.away_team}" class="team-logo-small" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg'">
                <span class="team-name">${match.away_team}</span>
            </div>
            <span class="status-badge live-badge">LIVE</span>
            <a href="match-details.html?id=${match.match_id}" class="btn-view-details">View Details</a>
        </div>
        `;
    }).join('');
}

// Display upcoming matches
function displayUpcomingMatches(matches) {
    const container = document.getElementById('upcoming-matches-container');
    
    if (!matches || matches.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #64748b;">No upcoming matches</p>';
        return;
    }
    
    container.innerHTML = matches.map(match => {
        const matchDate = new Date(match.match_date);
        const timeStr = matchDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        
        // Use logo from database or fallback to default
        const homeLogo = match.home_logo || 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg';
        const awayLogo = match.away_logo || 'https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg';
        
        return `
            <div class="match-row">
                <span class="status-badge upcoming-badge">${timeStr}</span>
                <div class="team-section">
                    <span class="team-name">${match.home_team}</span>
                    <img src="${homeLogo}" alt="${match.home_team}" class="team-logo-small">
                </div>
                <div class="time-display">${timeStr}</div>
                <div class="team-section">
                    <img src="${awayLogo}" alt="${match.away_team}" class="team-logo-small">
                    <span class="team-name">${match.away_team}</span>
                </div>
                <span class="status-badge upcoming-badge">Upcoming</span>
                <button class="btn-predict">
                    <i class="fa-solid fa-chart-line"></i> Predict Score
                </button>
                <a href="match-details.html?id=${match.match_id}" class="btn-view-details">View Details</a>
            </div>
        `;
    }).join('');
}

// Display finished matches
function displayFinishedMatches(matches) {
    const container = document.getElementById('finished-matches-container');
    
    if (!matches || matches.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #64748b;">No finished matches</p>';
        return;
    }
    
    container.innerHTML = matches.map(match => {
        // Use logo from database or fallback to default
        const homeLogo = match.home_logo || 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg';
        const awayLogo = match.away_logo || 'https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg';
        
        return `
        <div class="match-row">
            <span class="status-badge ft-badge">FT</span>
            <div class="team-section">
                <span class="team-name">${match.home_team}</span>
                <img src="${homeLogo}" alt="${match.home_team}" class="team-logo-small" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg'">
            </div>
            <div class="score-display">${match.home_score !== null ? match.home_score : 0}-${match.away_score !== null ? match.away_score : 0}</div>
            <div class="team-section">
                <img src="${awayLogo}" alt="${match.away_team}" class="team-logo-small" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg'">
                <span class="team-name">${match.away_team}</span>
            </div>
            <span class="status-badge finished-badge">FINISHED</span>
            <a href="match-details.html?id=${match.match_id}" class="btn-view-details">View Details</a>
        </div>
        `;
    }).join('');
}

// Load matches when page loads
document.addEventListener('DOMContentLoaded', loadMatches);
