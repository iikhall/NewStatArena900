// Player Details Page - Static Data

// Get player ID from URL
const urlParams = new URLSearchParams(window.location.search);
const playerId = urlParams.get('id') || '1';

// Static player data
const playersData = {
    '1': {
        player_id: 1,
        name: 'Erling Haaland',
        club_id: 2,
        position: 'Forward',
        jersey_number: 9,
        country: 'Norway',
        age: 23,
        date_of_birth: '2000-07-21',
        place_of_birth: 'Leeds, England',
        height: '194 cm',
        foot: 'Left',
        market_value: '€180M',
        photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Erling_Haaland_2023_%28cropped%29.jpg/440px-Erling_Haaland_2023_%28cropped%29.jpg',
        goals: 28,
        assists: 5,
        matches_played: 30,
        minutes_played: 2700,
        yellow_cards: 2,
        red_cards: 0,
        pass_accuracy: 82,
        shots_on_target: 65,
        dribbles_completed: 45,
        tackles_won: 12,
        interceptions: 8,
        aerial_duels_won: 78,
        penalties_scored: 5,
        penalties_missed: 1,
        international_caps: 28,
        international_goals: 27
    },
    '2': {
        player_id: 2,
        name: 'Kylian Mbappé',
        club_id: 17,
        position: 'Forward',
        jersey_number: 7,
        country: 'France',
        age: 25,
        date_of_birth: '1998-12-20',
        place_of_birth: 'Paris, France',
        height: '178 cm',
        foot: 'Right',
        market_value: '€160M',
        photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/2019-07-17_SG_Dynamo_Dresden_vs._Paris_Saint-Germain_by_Sandro_Halank%E2%80%93129_%28cropped%29.jpg/440px-2019-07-17_SG_Dynamo_Dresden_vs._Paris_Saint-Germain_by_Sandro_Halank%E2%80%93129_%28cropped%29.jpg',
        goals: 25,
        assists: 8,
        matches_played: 28,
        minutes_played: 2520,
        yellow_cards: 3,
        red_cards: 0,
        pass_accuracy: 85,
        shots_on_target: 70,
        dribbles_completed: 92,
        tackles_won: 15,
        interceptions: 10,
        aerial_duels_won: 42,
        penalties_scored: 4,
        penalties_missed: 0,
        international_caps: 72,
        international_goals: 46
    },
    '3': {
        player_id: 3,
        name: 'Harry Kane',
        club_id: 1,
        position: 'Forward',
        jersey_number: 9,
        country: 'England',
        age: 30,
        date_of_birth: '1993-07-28',
        place_of_birth: 'London, England',
        height: '188 cm',
        foot: 'Right',
        market_value: '€100M',
        photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Harry_Kane_2024.jpg/440px-Harry_Kane_2024.jpg',
        goals: 22,
        assists: 12,
        matches_played: 29,
        minutes_played: 2610,
        yellow_cards: 1,
        red_cards: 0,
        pass_accuracy: 78,
        shots_on_target: 58,
        dribbles_completed: 38,
        tackles_won: 18,
        interceptions: 12,
        aerial_duels_won: 65,
        penalties_scored: 3,
        penalties_missed: 1,
        international_caps: 89,
        international_goals: 61
    },
    '4': {
        player_id: 4,
        name: 'Kevin De Bruyne',
        club_id: 2,
        position: 'Midfielder',
        jersey_number: 17,
        country: 'Belgium',
        age: 32,
        date_of_birth: '1991-06-28',
        place_of_birth: 'Drongen, Belgium',
        height: '181 cm',
        foot: 'Right',
        market_value: '€90M',
        photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Kevin_De_Bruyne_Manchester_City.jpg/440px-Kevin_De_Bruyne_Manchester_City.jpg',
        goals: 8,
        assists: 18,
        matches_played: 28,
        minutes_played: 2380,
        yellow_cards: 4,
        red_cards: 0,
        pass_accuracy: 91,
        shots_on_target: 42,
        dribbles_completed: 68,
        tackles_won: 32,
        interceptions: 28,
        aerial_duels_won: 35,
        penalties_scored: 2,
        penalties_missed: 0,
        international_caps: 99,
        international_goals: 26
    }
};

// Static clubs data
const clubsData = {
    1: { club_id: 1, name: 'Bayern Munich', league_id: 4, logo_url: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg' },
    2: { club_id: 2, name: 'Manchester City', league_id: 1, logo_url: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg' },
    17: { club_id: 17, name: 'Paris Saint-Germain', league_id: 5, logo_url: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg' }
};

// Static leagues data
const leaguesData = {
    1: { league_id: 1, name: 'Premier League' },
    4: { league_id: 4, name: 'Bundesliga' },
    5: { league_id: 5, name: 'Ligue 1' }
};

// Load player data
function loadPlayerDetails() {
    try {
        // Get player data
        const player = playersData[playerId];

        if (!player) {
            console.error('Player not found');
            return;
        }

        // Get club data
        const club = clubsData[player.club_id];

        // Get league for breadcrumb
        const league = leaguesData[club?.league_id];

        // Update page title
        document.title = `StatArena - ${player.name}`;

        // Update breadcrumb
        document.getElementById('breadcrumb-league').textContent = league?.name || 'League';
        document.getElementById('breadcrumb-club').textContent = club?.name || 'Club';
        document.getElementById('breadcrumb-player').textContent = player.name;

        // Update player photo
        document.getElementById('playerPhoto').src = player.photo_url || player.image_url || 'https://via.placeholder.com/250x300?text=No+Photo';
        document.getElementById('playerPhoto').alt = player.name;

        // Update player name
        document.getElementById('playerName').textContent = player.name;

        // Calculate age from date_of_birth
        let age = player.age || '-';
        let dateOfBirth = player.date_of_birth || null;
        if (dateOfBirth) {
            const birthDate = new Date(dateOfBirth);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            dateOfBirth = birthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        }

        // Update player meta information
        document.getElementById('playerDOB').textContent = dateOfBirth ? `${dateOfBirth} (${age} years)` : '-';
        document.getElementById('playerPosition').textContent = player.position || '-';
        document.getElementById('playerPOB').textContent = player.place_of_birth || '-';
        document.getElementById('playerManager').textContent = 'Thomas Tuchel'; // Default manager, can be dynamic
        document.getElementById('playerHeight').textContent = player.height || '-';
        document.getElementById('playerFoot').textContent = player.foot || '-';
        document.getElementById('playerNationality').textContent = player.country || '-';
        document.getElementById('playerJersey').textContent = player.jersey_number ? `#${player.jersey_number}` : '-';

        // Update performance stats
        document.getElementById('statGoals').textContent = player.goals || 0;
        document.getElementById('statAssists').textContent = player.assists || 0;
        document.getElementById('statMatches').textContent = player.matches_played || 0;
        document.getElementById('statMinutes').textContent = (player.minutes_played || 0).toLocaleString();
        document.getElementById('statYellowCards').textContent = player.yellow_cards || 0;
        document.getElementById('statRedCards').textContent = player.red_cards || 0;

        // Update detailed statistics with bars
        updateStatBar('passAccuracyBar', 'passAccuracyValue', player.pass_accuracy || 0, 100, '%');
        updateStatBar('shotsBar', 'shotsValue', player.shots_on_target || 0, 100);
        updateStatBar('dribblesBar', 'dribblesValue', player.dribbles_completed || 0, 100);
        updateStatBar('tacklesBar', 'tacklesValue', player.tackles_won || 0, 100);
        updateStatBar('interceptionsBar', 'interceptionsValue', player.interceptions || 0, 100);
        updateStatBar('aerialsBar', 'aerialsValue', player.aerial_duels_won || 0, 100);
        
        // Penalties
        const penaltiesScored = player.penalties_scored || 0;
        const penaltiesMissed = player.penalties_missed || 0;
        const totalPenalties = penaltiesScored + penaltiesMissed;
        updateStatBar('penaltiesBar', 'penaltiesValue', penaltiesScored, Math.max(totalPenalties, 10), null, `${penaltiesScored}/${totalPenalties}`);

        // Update international stats
        document.getElementById('intMatches').textContent = player.international_caps || 0;
        document.getElementById('intGoals').textContent = player.international_goals || 0;

        // Update club info
        if (club) {
            document.getElementById('clubLogo').src = club.logo_url || 'https://via.placeholder.com/80?text=Club';
            document.getElementById('clubName').textContent = club.name;
            document.getElementById('clubLeague').textContent = league?.name || 'League';
        }

        // Load charts
        loadMarketValueChart(player);
        loadGoalsChart(player);

        // Load match history (mock data for now)
        loadMatchHistory();

    } catch (error) {
        console.error('Error loading player details:', error);
    }
}

// Helper function to update stat bars
function updateStatBar(barId, valueId, value, max, suffix = '', customText = null) {
    const percentage = Math.min((value / max) * 100, 100);
    const bar = document.getElementById(barId);
    const valueEl = document.getElementById(valueId);
    
    if (bar) {
        setTimeout(() => {
            bar.style.width = `${percentage}%`;
        }, 100);
    }
    
    if (valueEl) {
        valueEl.textContent = customText || `${value}${suffix}`;
    }
}

// Load market value chart
function loadMarketValueChart(player) {
    const ctx = document.getElementById('marketValueChart');
    if (!ctx) return;

    const marketValueStr = player.market_value || '€0M';
    const currentValue = parseFloat(marketValueStr.replace(/[€M]/g, ''));

    // Generate mock historical data (declining slightly over seasons)
    const labels = ['2020', '2021', '2022', '2023', '2024'];
    const data = [
        currentValue * 0.7,
        currentValue * 0.8,
        currentValue * 0.9,
        currentValue * 0.95,
        currentValue
    ];

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Market Value (€M)',
                data: data,
                borderColor: '#10529e',
                backgroundColor: 'rgba(16, 82, 158, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointBackgroundColor: '#10529e',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: '#e2e8f0'
                    },
                    ticks: {
                        callback: function(value) {
                            return '€' + value + 'M';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Load goals chart (doughnut)
function loadGoalsChart(player) {
    const ctx = document.getElementById('goalsChart');
    if (!ctx) return;

    const totalGoals = player.goals || 0;
    const leagueGoals = Math.floor(totalGoals * 0.6);
    const championsLeagueGoals = Math.floor(totalGoals * 0.25);
    const otherGoals = totalGoals - leagueGoals - championsLeagueGoals;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['League', 'Champions League', 'Other'],
            datasets: [{
                data: [leagueGoals, championsLeagueGoals, otherGoals],
                backgroundColor: ['#10529e', '#3b82f6', '#60a5fa'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            cutout: '70%'
        }
    });

    // Update goals breakdown
    const goalsBreakdown = document.getElementById('goalsBreakdown');
    if (goalsBreakdown) {
        goalsBreakdown.innerHTML = `
            <div class="goal-breakdown-item">
                <span>Bundesliga</span>
                <strong>${leagueGoals}</strong>
            </div>
            <div class="goal-breakdown-item">
                <span>Champions League</span>
                <strong>${championsLeagueGoals}</strong>
            </div>
            <div class="goal-breakdown-item">
                <span>Other Competitions</span>
                <strong>${otherGoals}</strong>
            </div>
        `;
    }
}

// Load match history (mock data)
function loadMatchHistory() {
    const matchHistory = document.getElementById('matchHistory');
    if (!matchHistory) return;

    const mockMatches = [
        { type: '(A) vs West Ham', result: 'L 3-0', class: 'loss' },
        { type: '(H) vs Everton', result: 'L 0-2', class: 'loss' },
        { type: '(A) vs Newcastle', result: 'W 2-3', class: 'win' },
        { type: '(H) vs Leicester', result: 'L 0-2', class: 'loss' },
        { type: '(A) vs Liverpool', result: 'L 3-1', class: 'loss' },
        { type: '(H) vs West Ham', result: 'W 2-1', class: 'win' }
    ];

    matchHistory.innerHTML = mockMatches.map(match => `
        <div class="match-item">
            <span class="match-type">${match.type}</span>
            <span class="match-result ${match.class}">${match.result}</span>
        </div>
    `).join('');
}

// Initialize page
loadPlayerDetails();
