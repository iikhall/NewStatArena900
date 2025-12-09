// Get club ID from URL
const urlParams = new URLSearchParams(window.location.search);
const clubId = urlParams.get('id') || '1';

// Static clubs data
const clubsDataDetails = {
    '1': {
        club_id: 1,
        name: 'Bayern Munich',
        league_id: 4,
        league_name: 'Bundesliga',
        logo_url: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg',
        stadium: 'Allianz Arena',
        stadium_capacity: 75000,
        founded_year: 1900,
        market_value: '€1.1B'
    },
    '2': {
        club_id: 2,
        name: 'Manchester City',
        league_id: 1,
        league_name: 'Premier League',
        logo_url: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
        stadium: 'Etihad Stadium',
        stadium_capacity: 53400,
        founded_year: 1880,
        market_value: '€1.2B'
    },
    '3': {
        club_id: 3,
        name: 'Real Madrid',
        league_id: 2,
        league_name: 'La Liga',
        logo_url: 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
        stadium: 'Santiago Bernabéu',
        stadium_capacity: 81044,
        founded_year: 1902,
        market_value: '€1.5B'
    }
};

// Static squad data for each club
const squadData = {
    '1': [ // Bayern Munich
        { jersey_number: 9, name: 'Harry Kane', position: 'Forward', age: 30, country: 'England', rating: 8.8, market_value: '€100M' },
        { jersey_number: 10, name: 'Leroy Sané', position: 'Forward', age: 28, country: 'Germany', rating: 8.3, market_value: '€70M' },
        { jersey_number: 42, name: 'Jamal Musiala', position: 'Midfielder', age: 20, country: 'Germany', rating: 8.5, market_value: '€110M' },
        { jersey_number: 6, name: 'Joshua Kimmich', position: 'Midfielder', age: 28, country: 'Germany', rating: 8.7, market_value: '€80M' },
        { jersey_number: 25, name: 'Thomas Müller', position: 'Forward', age: 34, country: 'Germany', rating: 8.2, market_value: '€8M' },
        { jersey_number: 1, name: 'Manuel Neuer', position: 'Goalkeeper', age: 37, country: 'Germany', rating: 8.4, market_value: '€4M' }
    ],
    '2': [ // Manchester City
        { jersey_number: 9, name: 'Erling Haaland', position: 'Forward', age: 23, country: 'Norway', rating: 9.2, market_value: '€180M' },
        { jersey_number: 17, name: 'Kevin De Bruyne', position: 'Midfielder', age: 32, country: 'Belgium', rating: 8.6, market_value: '€90M' },
        { jersey_number: 16, name: 'Rodri', position: 'Midfielder', age: 27, country: 'Spain', rating: 8.5, market_value: '€110M' },
        { jersey_number: 47, name: 'Phil Foden', position: 'Forward', age: 23, country: 'England', rating: 8.4, market_value: '€110M' },
        { jersey_number: 20, name: 'Bernardo Silva', position: 'Midfielder', age: 29, country: 'Portugal', rating: 8.6, market_value: '€80M' },
        { jersey_number: 1, name: 'Ederson', position: 'Goalkeeper', age: 30, country: 'Brazil', rating: 8.3, market_value: '€40M' }
    ],
    '3': [ // Real Madrid
        { jersey_number: 7, name: 'Vinícius Jr.', position: 'Forward', age: 23, country: 'Brazil', rating: 8.8, market_value: '€150M' },
        { jersey_number: 9, name: 'Karim Benzema', position: 'Forward', age: 36, country: 'France', rating: 8.5, market_value: '€20M' },
        { jersey_number: 10, name: 'Luka Modrić', position: 'Midfielder', age: 38, country: 'Croatia', rating: 8.4, market_value: '€5M' },
        { jersey_number: 8, name: 'Toni Kroos', position: 'Midfielder', age: 34, country: 'Germany', rating: 8.6, market_value: '€15M' },
        { jersey_number: 15, name: 'Federico Valverde', position: 'Midfielder', age: 25, country: 'Uruguay', rating: 8.5, market_value: '€120M' },
        { jersey_number: 1, name: 'Thibaut Courtois', position: 'Goalkeeper', age: 31, country: 'Belgium', rating: 8.7, market_value: '€50M' }
    ]
};

// Club color schemes
const clubColors = {
    // Bundesliga
    'Bayern Munich': { primary: '#DC143C', secondary: '#0057B8', accent: '#8B0000' },
    // Premier League
    'Manchester City': { primary: '#6CABDD', secondary: '#1C2C5B', accent: '#98C5E9' },
    'Arsenal': { primary: '#EF0107', secondary: '#023474', accent: '#9C824A' },
    'Manchester United': { primary: '#DA291C', secondary: '#FBE122', accent: '#000000' },
    'Liverpool': { primary: '#C8102E', secondary: '#00B2A9', accent: '#F6EB61' },
    'Newcastle United': { primary: '#241F20', secondary: '#FFFFFF', accent: '#1E90FF' },
    'Tottenham': { primary: '#132257', secondary: '#FFFFFF', accent: '#5C7A99' },
    'Brighton': { primary: '#0057B8', secondary: '#FFCD00', accent: '#005DAA' },
    'Leeds United': { primary: '#FFCD00', secondary: '#1D428A', accent: '#FFD700' },
    'Burnley': { primary: '#6C1D45', secondary: '#99D6EA', accent: '#8B0045' },
    'Crystal Palace': { primary: '#1B458F', secondary: '#C4122E', accent: '#A7A5A6' },
    'Brentford': { primary: '#D20000', secondary: '#FBB800', accent: '#000000' },
    // La Liga
    'Real Madrid': { primary: '#FDB913', secondary: '#00529F', accent: '#FFFFFF' },
    'Barcelona': { primary: '#A50044', secondary: '#004D98', accent: '#EDBB00' },
    // Serie A
    'AC Milan': { primary: '#FB090B', secondary: '#000000', accent: '#FFD700' },
    'Inter Milan': { primary: '#0068A8', secondary: '#000000', accent: '#0068A8' },
    // Ligue 1
    'Paris Saint-Germain': { primary: '#004170', secondary: '#DA291C', accent: '#FFFFFF' },
    'Olympique Marseille': { primary: '#2FAEE0', secondary: '#FFFFFF', accent: '#00A0DC' },
    'Lyon': { primary: '#DA000D', secondary: '#102A5E', accent: '#FFD700' },
    'Monaco': { primary: '#DA1A32', secondary: '#FFFFFF', accent: '#000000' },
    'Lille': { primary: '#DA1A32', secondary: '#FFFFFF', accent: '#00529F' }
};

// Sample achievements data
const achievementsData = {
    'Bayern Munich': { league: 32, champions: 6, cup: 20, superCup: 10 },
    'Real Madrid': { league: 35, champions: 14, cup: 20, superCup: 12 },
    'Barcelona': { league: 27, champions: 5, cup: 31, superCup: 14 },
    'Manchester City': { league: 9, champions: 1, cup: 7, superCup: 2 },
    'Liverpool': { league: 19, champions: 6, cup: 8, superCup: 4 },
    'default': { league: 0, champions: 0, cup: 0, superCup: 0 }
};

function loadClubDetails() {
    if (!clubId) {
        alert('No club selected');
        window.location.href = 'clubs.html';
        return;
    }

    try {
        // Get club details
        const club = clubsDataDetails[clubId];
        
        if (!club) {
            alert('Club not found');
            window.location.href = 'clubs.html';
            return;
        }

        // Apply club colors
        applyClubTheme(club.name);

        // Update club info
        document.getElementById('clubLogo').src = club.logo_url || '';
        document.getElementById('clubName').textContent = club.name;
        document.getElementById('clubStadium').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${club.stadium}`;
        document.getElementById('clubCapacity').innerHTML = `<i class="fa-solid fa-users"></i> Capacity: ${club.stadium_capacity?.toLocaleString() || '75,000'}`;
        document.getElementById('clubValue').innerHTML = `<i class="fa-solid fa-euro-sign"></i> Market Value: ${club.market_value}`;
        document.getElementById('clubFounded').textContent = club.founded_year || '1900';
        document.getElementById('clubLeague').textContent = club.league_name || 'League';

        // Update ticket section
        document.getElementById('ticketDescription').textContent = 
            `Don't miss the electric atmosphere of ${club.stadium}. Secure your seats today and witness world-class football excellence.`;

        // Display squad
        const players = squadData[clubId] || [];
        displaySquad(players);

        // Display achievements
        displayAchievements(club.name);

    } catch (error) {
        console.error('Error loading club details:', error);
        alert('Error loading club details');
    }
}

function applyClubTheme(clubName) {
    const colors = clubColors[clubName] || { primary: '#4285f4', secondary: '#1a73e8', accent: '#0d47a1' };
    
    // Apply CSS variables
    document.documentElement.style.setProperty('--club-primary', colors.primary);
    document.documentElement.style.setProperty('--club-secondary', colors.secondary);
    document.documentElement.style.setProperty('--club-accent', colors.accent);

    // Update navbar
    const navbar = document.getElementById('navbar');
    if (navbar) {
        navbar.style.background = `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`;
    }
}

function displaySquad(players) {
    const tbody = document.getElementById('squadTableBody');
    
    if (!players || players.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No squad data available</td></tr>';
        return;
    }

    tbody.innerHTML = players.map(player => `
        <tr>
            <td><span class="player-number">${player.jersey_number || '?'}</span></td>
            <td><strong>${player.name}</strong></td>
            <td>${player.position || 'N/A'}</td>
            <td>${player.age || '-'}</td>
            <td>${player.country || 'Unknown'}</td>
            <td>${player.rating ? `<span class="rating-badge">${player.rating}</span>` : '-'}</td>
            <td>${player.market_value || '-'}</td>
        </tr>
    `).join('');
}

function displayAchievements(clubName) {
    const achievements = achievementsData[clubName] || achievementsData.default;
    const grid = document.getElementById('achievementsGrid');

    grid.innerHTML = `
        <div class="achievement-card">
            <i class="fa-solid fa-trophy"></i>
            <div class="achievement-number">${achievements.league}</div>
            <div class="achievement-label">League Titles</div>
        </div>
        <div class="achievement-card">
            <i class="fa-solid fa-star"></i>
            <div class="achievement-number">${achievements.champions}</div>
            <div class="achievement-label">Champions League</div>
        </div>
        <div class="achievement-card">
            <i class="fa-solid fa-trophy"></i>
            <div class="achievement-number">${achievements.cup}</div>
            <div class="achievement-label">Domestic Cups</div>
        </div>
        <div class="achievement-card">
            <i class="fa-solid fa-medal"></i>
            <div class="achievement-number">${achievements.superCup}</div>
            <div class="achievement-label">Super Cups</div>
        </div>
    `;
}

// Load club details when page loads
loadClubDetails();
