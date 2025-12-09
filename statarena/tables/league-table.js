// League Table Page - Static Data

// Get league ID from URL
const urlParams = new URLSearchParams(window.location.search);
const leagueId = urlParams.get('id') || '1';

// Static league standings data
const leagueStandings = {
    '1': [ // Premier League
        { name: 'Manchester City', logo_url: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg', played: 30, won: 23, drawn: 4, lost: 3, goals_for: 73, goals_against: 32, goal_difference: 41, points: 73, form: 'WWWWD' },
        { name: 'Arsenal', logo_url: 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg', played: 30, won: 21, drawn: 5, lost: 4, goals_for: 68, goals_against: 40, goal_difference: 28, points: 68, form: 'WWDWW' },
        { name: 'Liverpool', logo_url: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg', played: 29, won: 19, drawn: 6, lost: 4, goals_for: 65, goals_against: 40, goal_difference: 25, points: 63, form: 'WWLWD' },
        { name: 'Chelsea', logo_url: 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg', played: 30, won: 17, drawn: 7, lost: 6, goals_for: 58, goals_against: 40, goal_difference: 18, points: 58, form: 'WDWLW' },
        { name: 'Tottenham', logo_url: 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg', played: 30, won: 16, drawn: 6, lost: 8, goals_for: 54, goals_against: 39, goal_difference: 15, points: 54, form: 'LWWDW' },
        { name: 'Manchester United', logo_url: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg', played: 30, won: 15, drawn: 7, lost: 8, goals_for: 48, goals_against: 38, goal_difference: 10, points: 52, form: 'WDWWL' },
        { name: 'Newcastle United', logo_url: 'https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg', played: 30, won: 14, drawn: 8, lost: 8, goals_for: 45, goals_against: 40, goal_difference: 5, points: 50, form: 'DDWLW' },
        { name: 'Brighton', logo_url: 'https://upload.wikimedia.org/wikipedia/en/f/fd/Brighton_%26_Hove_Albion_logo.svg', played: 30, won: 13, drawn: 9, lost: 8, goals_for: 42, goals_against: 40, goal_difference: 2, points: 48, form: 'WDLWD' },
        { name: 'Crystal Palace', logo_url: 'https://upload.wikimedia.org/wikipedia/en/a/a2/Crystal_Palace_FC_logo_%282022%29.svg', played: 30, won: 12, drawn: 8, lost: 10, goals_for: 40, goals_against: 42, goal_difference: -2, points: 44, form: 'LWDLW' },
        { name: 'Brentford', logo_url: 'https://upload.wikimedia.org/wikipedia/en/2/2a/Brentford_FC_crest.svg', played: 30, won: 11, drawn: 9, lost: 10, goals_for: 38, goals_against: 40, goal_difference: -2, points: 42, form: 'DWDLL' }
    ],
    '2': [ // La Liga
        { name: 'Real Madrid', logo_url: 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg', played: 30, won: 24, drawn: 3, lost: 3, goals_for: 75, goals_against: 30, goal_difference: 45, points: 75, form: 'WWWWW' },
        { name: 'Barcelona', logo_url: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg', played: 30, won: 22, drawn: 5, lost: 3, goals_for: 70, goals_against: 32, goal_difference: 38, points: 71, form: 'WWDWW' },
        { name: 'Atlético Madrid', logo_url: 'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg', played: 30, won: 18, drawn: 7, lost: 5, goals_for: 58, goals_against: 38, goal_difference: 20, points: 61, form: 'WDWLW' },
        { name: 'Sevilla', logo_url: 'https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg', played: 30, won: 16, drawn: 8, lost: 6, goals_for: 52, goals_against: 40, goal_difference: 12, points: 56, form: 'DWWDW' },
        { name: 'Real Betis', logo_url: 'https://upload.wikimedia.org/wikipedia/en/1/13/Real_betis_logo.svg', played: 30, won: 15, drawn: 9, lost: 6, goals_for: 48, goals_against: 38, goal_difference: 10, points: 54, form: 'WDWWD' },
        { name: 'Villarreal', logo_url: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Villarreal_CF_logo-en.svg', played: 30, won: 14, drawn: 9, lost: 7, goals_for: 45, goals_against: 40, goal_difference: 5, points: 51, form: 'WWLDD' },
        { name: 'Real Sociedad', logo_url: 'https://upload.wikimedia.org/wikipedia/en/f/f1/Real_Sociedad_logo.svg', played: 30, won: 13, drawn: 10, lost: 7, goals_for: 42, goals_against: 38, goal_difference: 4, points: 49, form: 'DDWLW' },
        { name: 'Athletic Bilbao', logo_url: 'https://upload.wikimedia.org/wikipedia/en/9/98/Club_Athletic_Bilbao_logo.svg', played: 30, won: 12, drawn: 10, lost: 8, goals_for: 40, goals_against: 40, goal_difference: 0, points: 46, form: 'LWDWD' },
        { name: 'Valencia', logo_url: 'https://upload.wikimedia.org/wikipedia/en/c/ce/Valenciacf.svg', played: 30, won: 11, drawn: 9, lost: 10, goals_for: 38, goals_against: 42, goal_difference: -4, points: 42, form: 'DLLWW' },
        { name: 'Getafe', logo_url: 'https://upload.wikimedia.org/wikipedia/en/4/46/Getafe_logo.svg', played: 30, won: 10, drawn: 10, lost: 10, goals_for: 35, goals_against: 42, goal_difference: -7, points: 40, form: 'WDLDL' }
    ],
    '3': [ // Serie A
        { name: 'AC Milan', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg', played: 30, won: 23, drawn: 4, lost: 3, goals_for: 68, goals_against: 28, goal_difference: 40, points: 73, form: 'WWWWD' },
        { name: 'Inter Milan', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg', played: 30, won: 22, drawn: 5, lost: 3, goals_for: 70, goals_against: 32, goal_difference: 38, points: 71, form: 'WWWDW' },
        { name: 'Juventus', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Juventus_FC_-_pictogram_black_%28Italy%2C_2017%29.svg', played: 30, won: 20, drawn: 6, lost: 4, goals_for: 62, goals_against: 30, goal_difference: 32, points: 66, form: 'WDWWW' },
        { name: 'Napoli', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/SSC_Neapel.svg', played: 30, won: 18, drawn: 7, lost: 5, goals_for: 58, goals_against: 38, goal_difference: 20, points: 61, form: 'WWLDW' },
        { name: 'Roma', logo_url: 'https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg', played: 30, won: 16, drawn: 8, lost: 6, goals_for: 52, goals_against: 40, goal_difference: 12, points: 56, form: 'WDWDW' },
        { name: 'Lazio', logo_url: 'https://upload.wikimedia.org/wikipedia/en/c/ce/S.S._Lazio_badge.svg', played: 30, won: 15, drawn: 8, lost: 7, goals_for: 48, goals_against: 38, goal_difference: 10, points: 53, form: 'DWWLW' },
        { name: 'Atalanta', logo_url: 'https://upload.wikimedia.org/wikipedia/en/6/66/AtalantaBC.svg', played: 30, won: 14, drawn: 9, lost: 7, goals_for: 45, goals_against: 40, goal_difference: 5, points: 51, form: 'WDLWD' },
        { name: 'Fiorentina', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/ACF_Fiorentina.svg', played: 30, won: 13, drawn: 9, lost: 8, goals_for: 42, goals_against: 40, goal_difference: 2, points: 48, form: 'LWDWW' },
        { name: 'Torino', logo_url: 'https://upload.wikimedia.org/wikipedia/en/2/2e/Torino_FC_Logo.svg', played: 30, won: 12, drawn: 8, lost: 10, goals_for: 38, goals_against: 42, goal_difference: -4, points: 44, form: 'LLWDW' },
        { name: 'Bologna', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Bologna_FC_1909.svg', played: 30, won: 10, drawn: 10, lost: 10, goals_for: 35, goals_against: 42, goal_difference: -7, points: 40, form: 'DWDLL' }
    ],
    '4': [ // Bundesliga
        { name: 'Bayern Munich', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg', played: 30, won: 25, drawn: 3, lost: 2, goals_for: 85, goals_against: 22, goal_difference: 63, points: 78, form: 'WWWWW' },
        { name: 'Borussia Dortmund', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg', played: 30, won: 20, drawn: 6, lost: 4, goals_for: 68, goals_against: 35, goal_difference: 33, points: 66, form: 'WWDWW' },
        { name: 'RB Leipzig', logo_url: 'https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg', played: 30, won: 18, drawn: 7, lost: 5, goals_for: 62, goals_against: 38, goal_difference: 24, points: 61, form: 'WDWLW' },
        { name: 'Bayer Leverkusen', logo_url: 'https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg', played: 30, won: 17, drawn: 7, lost: 6, goals_for: 58, goals_against: 40, goal_difference: 18, points: 58, form: 'WWDLW' },
        { name: 'Union Berlin', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/4/44/1._FC_Union_Berlin_Logo.svg', played: 30, won: 15, drawn: 8, lost: 7, goals_for: 52, goals_against: 42, goal_difference: 10, points: 53, form: 'DWWDW' },
        { name: 'Eintracht Frankfurt', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Eintracht_Frankfurt_Logo.svg', played: 30, won: 14, drawn: 9, lost: 7, goals_for: 48, goals_against: 40, goal_difference: 8, points: 51, form: 'WDLWW' },
        { name: 'SC Freiburg', logo_url: 'https://upload.wikimedia.org/wikipedia/en/1/11/SC_Freiburg_logo.svg', played: 30, won: 13, drawn: 9, lost: 8, goals_for: 45, goals_against: 42, goal_difference: 3, points: 48, form: 'LWDWD' },
        { name: 'Wolfsburg', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Logo-VfL-Wolfsburg.svg', played: 30, won: 12, drawn: 9, lost: 9, goals_for: 42, goals_against: 42, goal_difference: 0, points: 45, form: 'WDLDW' },
        { name: 'Borussia Mönchengladbach', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/8/81/Borussia_M%C3%B6nchengladbach_logo.svg', played: 30, won: 11, drawn: 8, lost: 11, goals_for: 38, goals_against: 45, goal_difference: -7, points: 41, form: 'LLWDL' },
        { name: 'Hoffenheim', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/6/64/TSG_1899_Hoffenheim_logo.svg', played: 30, won: 10, drawn: 9, lost: 11, goals_for: 35, goals_against: 48, goal_difference: -13, points: 39, form: 'DWLLL' }
    ],
    '5': [ // Ligue 1
        { name: 'Paris Saint-Germain', logo_url: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg', played: 30, won: 24, drawn: 4, lost: 2, goals_for: 75, goals_against: 25, goal_difference: 50, points: 76, form: 'WWWWW' },
        { name: 'Olympique Marseille', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg', played: 30, won: 19, drawn: 7, lost: 4, goals_for: 62, goals_against: 32, goal_difference: 30, points: 64, form: 'WWDWW' },
        { name: 'Lyon', logo_url: 'https://upload.wikimedia.org/wikipedia/en/e/e2/Olympique_Lyonnais_logo.svg', played: 30, won: 18, drawn: 6, lost: 6, goals_for: 58, goals_against: 35, goal_difference: 23, points: 60, form: 'WDWLW' },
        { name: 'Monaco', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Logo_AS_Monaco_2013.svg', played: 30, won: 16, drawn: 8, lost: 6, goals_for: 52, goals_against: 38, goal_difference: 14, points: 56, form: 'DWWDW' },
        { name: 'Lille', logo_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6e/Lille_OSC_logo.svg/440px-Lille_OSC_logo.svg.png', played: 30, won: 15, drawn: 8, lost: 7, goals_for: 48, goals_against: 38, goal_difference: 10, points: 53, form: 'WDWWD' },
        { name: 'Nice', logo_url: 'https://upload.wikimedia.org/wikipedia/en/a/a5/OGC_Nice_logo.svg', played: 30, won: 14, drawn: 9, lost: 7, goals_for: 45, goals_against: 40, goal_difference: 5, points: 51, form: 'WWLDD' },
        { name: 'Lens', logo_url: 'https://upload.wikimedia.org/wikipedia/en/c/c2/RC_Lens_logo.svg', played: 30, won: 13, drawn: 9, lost: 8, goals_for: 42, goals_against: 40, goal_difference: 2, points: 48, form: 'DWDLW' },
        { name: 'Rennes', logo_url: 'https://upload.wikimedia.org/wikipedia/en/2/26/Stade_Rennais_FC.svg', played: 30, won: 12, drawn: 9, lost: 9, goals_for: 40, goals_against: 42, goal_difference: -2, points: 45, form: 'LWDWD' },
        { name: 'Strasbourg', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Racing_Club_de_Strasbourg_Alsace_%28logo%2C_2019%29.svg', played: 30, won: 11, drawn: 8, lost: 11, goals_for: 38, goals_against: 45, goal_difference: -7, points: 41, form: 'LLDWW' },
        { name: 'Montpellier', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Montpellier_HSC_%28logo%2C_2000%29.svg', played: 30, won: 10, drawn: 9, lost: 11, goals_for: 35, goals_against: 48, goal_difference: -13, points: 39, form: 'DWLLL' }
    ]
};

// Load league table with static data
function loadLeagueTable() {
    const standings = leagueStandings[leagueId] || leagueStandings['1'];
    
    // Update page title
    const leagueName = getLeagueName(leagueId);
    document.title = `StatArena - ${leagueName} Table`;
    
    // Render table rows
    renderTableRows(standings);
}

// Render table rows
function renderTableRows(standings) {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;

    tableBody.innerHTML = standings.map((team, index) => {
        const position = index + 1;
        const zoneClass = getZoneClass(position);
        const rankClass = `rank-${position}`;
        
        // Map database field names to display values
        const wins = team.won || team.wins || 0;
        const draws = team.drawn || team.draws || 0;
        const losses = team.lost || team.losses || 0;
        const goals_scored = team.goals_for || team.goals_scored || 0;
        const goals_against = team.goals_against || 0;
        const matches_played = team.played || (wins + draws + losses);
        
        const gdClass = team.goal_difference > 0 ? 'positive' : (team.goal_difference < 0 ? 'negative' : '');
        
        // Generate form badges (W/D/L pattern)
        const formHtml = generateFormBadges(team.form || 'WWDLL');

        return `
            <div class="table-row ${zoneClass}">
                <div class="table-cell rank-cell ${rankClass}">${position}</div>
                <div class="table-cell logo-cell">
                    <img src="${team.logo_url || 'https://via.placeholder.com/50'}" alt="${team.name}">
                </div>
                <div class="table-cell club-info-cell">
                    <div>
                        <div class="club-name">${team.name}</div>
                        <div class="club-city">${team.name.split(' ')[0]}</div>
                    </div>
                </div>
                <div class="table-cell stat-cell">${matches_played}</div>
                <div class="table-cell stat-cell wins">${wins}</div>
                <div class="table-cell stat-cell draws">${draws}</div>
                <div class="table-cell stat-cell losses">${losses}</div>
                <div class="table-cell stat-cell">${goals_scored}</div>
                <div class="table-cell stat-cell">${goals_against}</div>
                <div class="table-cell stat-cell gd ${gdClass}">${team.goal_difference > 0 ? '+' : ''}${team.goal_difference}</div>
                <div class="table-cell pts-cell">${team.points}</div>
                <div class="table-cell form-cell">
                    ${formHtml}
                </div>
            </div>
        `;
    }).join('');
}

// Get zone class based on position
function getZoneClass(position) {
    if (position <= 4) return 'ucl-zone';
    if (position === 5) return 'europa-zone';
    if (position <= 7) return 'midtable-zone';
    return 'relegation-zone';
}

// Generate form badges from string
function generateFormBadges(formString) {
    // Take last 5 results
    const results = formString.split('').slice(-5);
    
    return results.map(result => {
        let badgeClass = '';
        let badgeText = '';
        
        if (result === 'W') {
            badgeClass = 'win';
            badgeText = 'W';
        } else if (result === 'D') {
            badgeClass = 'draw';
            badgeText = 'D';
        } else if (result === 'L') {
            badgeClass = 'loss';
            badgeText = 'L';
        }
        
        return `<span class="form-badge ${badgeClass}">${badgeText}</span>`;
    }).join('');
}

// Get league name by ID
function getLeagueName(id) {
    const leagues = {
        1: 'Premier League',
        2: 'La Liga',
        3: 'Serie A',
        4: 'Bundesliga',
        5: 'Ligue 1'
    };
    return leagues[id] || 'League';
}

// Initialize page
loadLeagueTable();
