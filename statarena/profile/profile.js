// Profile Page - User Profile Management

// API Base URL
const API_URL = 'http://localhost:3000/api';

// Get session data
function getSessionData() {
    const session = localStorage.getItem('statarena_session') || sessionStorage.getItem('statarena_session');
    if (session) {
        try {
            return JSON.parse(session);
        } catch (e) {
            return null;
        }
    }
    return null;
}

// Get user data from localStorage
function getUserData() {
    const users = localStorage.getItem('statarena_users');
    if (users) {
        return JSON.parse(users);
    }
    return [];
}

// Get favorite clubs
function getFavoriteClubs() {
    const sessionData = getSessionData();
    if (!sessionData || !sessionData.loggedIn) {
        return [];
    }
    
    const favorites = localStorage.getItem('statarena_favorites_' + sessionData.email);
    if (favorites) {
        try {
            const parsed = JSON.parse(favorites);
            // Return clubs with basic info (we only have names stored)
            return (parsed.clubs || []).map(clubName => ({
                id: clubName,
                name: clubName,
                logo: 'https://via.placeholder.com/50',
                league: 'League'
            }));
        } catch (e) {
            return [];
        }
    }
    return [];
}

// Get favorite players
function getFavoritePlayers() {
    const sessionData = getSessionData();
    if (!sessionData || !sessionData.loggedIn) {
        return [];
    }
    
    const favorites = localStorage.getItem('statarena_favorites_' + sessionData.email);
    if (favorites) {
        try {
            const parsed = JSON.parse(favorites);
            // Return players with basic info (we only have names stored)
            return (parsed.players || []).map(playerName => ({
                id: playerName,
                name: playerName,
                image: 'https://via.placeholder.com/50',
                position: 'Player',
                club: 'Club'
            }));
        } catch (e) {
            return [];
        }
    }
    return [];
}

// Get predictions from API
async function getUserPredictions() {
    const sessionData = getSessionData();
    if (!sessionData || !sessionData.userId) {
        return [];
    }
    
    try {
        const response = await fetch(`${API_URL}/predictions/user/${sessionData.userId}`);
        if (!response.ok) {
            console.error('Failed to fetch predictions');
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching predictions:', error);
        return [];
    }
}

// Initialize profile page
async function initializeProfile() {
    const sessionData = getSessionData();
    
    if (!sessionData || !sessionData.loggedIn) {
        alert('Please login to view your profile.');
        window.location.href = '../login/login.html';
        return;
    }
    
    // Load user information from API
    await loadUserInfoFromAPI(sessionData);
    
    // Load favorites and predictions
    loadFavoriteClubs();
    loadFavoritePlayers();
    loadMyTickets();
    loadMyResaleListings();
    
    // Update stats
    await updateStats();
}

// Load user information from API
async function loadUserInfoFromAPI(sessionData) {
    try {
        const response = await fetch(`${API_URL}/users/${sessionData.userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        
        // Update header
        document.getElementById('userName').textContent = userData.name || 'User';
        document.getElementById('userEmail').textContent = userData.email || 'N/A';
        
        // Update badge
        const badge = document.getElementById('userBadge');
        if (userData.role === 'admin') {
            badge.textContent = 'Administrator';
            badge.style.background = 'rgba(239, 68, 68, 0.2)';
        } else {
            badge.textContent = 'Member';
        }
        
        // Update account information
        document.getElementById('displayName').textContent = userData.name || 'User';
        document.getElementById('editName').value = userData.name || '';
        document.getElementById('displayEmail').textContent = userData.email || 'N/A';
        document.getElementById('editEmail').value = userData.email || '';
        
        // Set member since date
        const memberSince = userData.created_at ? new Date(userData.created_at).toLocaleDateString() : new Date().toLocaleDateString();
        document.getElementById('memberSince').textContent = memberSince;
        
        // Store user data for later use
        window.currentUserData = userData;
    } catch (error) {
        console.error('Error loading user info:', error);
        // Fallback to session data
        document.getElementById('userName').textContent = sessionData.name || 'User';
        document.getElementById('userEmail').textContent = sessionData.email || 'N/A';
    }
}

// Toggle edit mode
function toggleEditMode() {
    const infoGroups = document.querySelectorAll('.info-group');
    const editActions = document.getElementById('editActions');
    const isEditMode = editActions.style.display === 'flex';
    
    if (isEditMode) {
        cancelEdit();
    } else {
        // Enable edit mode
        infoGroups.forEach(group => {
            const input = group.querySelector('.edit-input');
            const display = group.querySelector('.display-value');
            
            if (input && !input.id.includes('Email')) { // Don't allow email editing
                input.style.display = 'block';
                input.disabled = false;
                if (display) display.style.display = 'none';
            }
        });
        
        editActions.style.display = 'flex';
    }
}

// Cancel edit
function cancelEdit() {
    const infoGroups = document.querySelectorAll('.info-group');
    const editActions = document.getElementById('editActions');
    
    infoGroups.forEach(group => {
        const input = group.querySelector('.edit-input');
        const display = group.querySelector('.display-value');
        
        if (input) {
            input.style.display = 'none';
            input.disabled = true;
            if (display) display.style.display = 'block';
        }
    });
    
    editActions.style.display = 'none';
    
    // Reset values
    const sessionData = getSessionData();
    document.getElementById('editName').value = sessionData.name || '';
}

// Save profile changes
async function saveProfileChanges() {
    const newName = document.getElementById('editName').value.trim();
    
    if (!newName) {
        alert('Name cannot be empty!');
        return;
    }
    
    const sessionData = getSessionData();
    
    try {
        const response = await fetch(`${API_URL}/users/${sessionData.userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: newName })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update profile');
        }
        
        const result = await response.json();
        
        // Update session
        sessionData.name = newName;
        if (localStorage.getItem('statarena_session')) {
            localStorage.setItem('statarena_session', JSON.stringify(sessionData));
        } else {
            sessionStorage.setItem('statarena_session', JSON.stringify(sessionData));
        }
        
        // Update display
        document.getElementById('userName').textContent = newName;
        document.getElementById('displayName').textContent = newName;
        
        cancelEdit();
        showSuccessMessage('Profile updated successfully!');
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
    }
}

// Load favorite clubs
function loadFavoriteClubs() {
    const favoriteClubs = getFavoriteClubs();
    const container = document.getElementById('favoriteClubsList');
    
    if (favoriteClubs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-shield-halved"></i>
                <p>No favorite clubs yet. Visit the Clubs page to add favorites!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = favoriteClubs.map(club => `
        <div class="favorite-item">
            <img src="${club.logo || 'https://via.placeholder.com/50'}" alt="${club.name}" class="favorite-logo">
            <div class="favorite-info">
                <p class="favorite-name">${club.name}</p>
                <p class="favorite-detail">${club.league || 'Club'}</p>
            </div>
            <button class="favorite-remove" onclick="removeFavoriteClub('${club.id}')">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// Load favorite players
function loadFavoritePlayers() {
    const favoritePlayers = getFavoritePlayers();
    const container = document.getElementById('favoritePlayersList');
    
    if (favoritePlayers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-users"></i>
                <p>No favorite players yet. Visit the Players page to add favorites!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = favoritePlayers.map(player => `
        <div class="favorite-item">
            <img src="${player.image || 'https://via.placeholder.com/50'}" alt="${player.name}" class="favorite-logo">
            <div class="favorite-info">
                <p class="favorite-name">${player.name}</p>
                <p class="favorite-detail">${player.position || 'Player'} • ${player.club || 'Unknown Club'}</p>
            </div>
            <button class="favorite-remove" onclick="removeFavoritePlayer('${player.id}')">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// Update stats
async function updateStats() {
    const sessionData = getSessionData();
    if (!sessionData || !sessionData.userId) return;
    
    try {
        // Get user data which includes statistics
        const response = await fetch(`${API_URL}/users/${sessionData.userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user stats');
        }
        
        const userData = await response.json();
        const stats = userData.statistics || {};
        
        // Get predictions count
        const predictions = await getUserPredictions();
        const totalPredictions = predictions.length;
        
        // Get favorites count
        const favoriteClubs = getFavoriteClubs();
        const favoritePlayers = getFavoritePlayers();
        const totalFavorites = favoriteClubs.length + favoritePlayers.length;
        
        // Update display
        document.getElementById('totalPoints').textContent = stats.total_points || 0;
        document.getElementById('totalPredictions').textContent = totalPredictions;
        document.getElementById('totalFavorites').textContent = totalFavorites;
    } catch (error) {
        console.error('Error updating stats:', error);
        // Fallback to showing 0s
        document.getElementById('totalPoints').textContent = '0';
        document.getElementById('totalPredictions').textContent = '0';
        document.getElementById('totalFavorites').textContent = '0';
    }
}

// Remove favorite club
function removeFavoriteClub(clubId) {
    if (confirm('Remove this club from favorites?')) {
        const sessionData = getSessionData();
        const favorites = localStorage.getItem('statarena_favorites_' + sessionData.email);
        
        if (favorites) {
            const parsed = JSON.parse(favorites);
            parsed.clubs = (parsed.clubs || []).filter(club => club !== clubId);
            localStorage.setItem('statarena_favorites_' + sessionData.email, JSON.stringify(parsed));
        }
        
        loadFavoriteClubs();
        updateStats();
        showSuccessMessage('Club removed from favorites!');
    }
}

// Remove favorite player
function removeFavoritePlayer(playerId) {
    if (confirm('Remove this player from favorites?')) {
        const sessionData = getSessionData();
        const favorites = localStorage.getItem('statarena_favorites_' + sessionData.email);
        
        if (favorites) {
            const parsed = JSON.parse(favorites);
            parsed.players = (parsed.players || []).filter(player => player !== playerId);
            localStorage.setItem('statarena_favorites_' + sessionData.email, JSON.stringify(parsed));
        }
        
        loadFavoritePlayers();
        updateStats();
        showSuccessMessage('Player removed from favorites!');
    }
}

// Show success message
function showSuccessMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        font-weight: 600;
    `;
    messageDiv.innerHTML = `
        <i class="fa-solid fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Load user's purchased tickets
function loadMyTickets() {
    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    const container = document.getElementById('myTicketsList');
    
    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-ticket"></i>
                <p>No tickets purchased yet. Visit the Tickets page to book!</p>
            </div>
        `;
        return;
    }
    
    // Show most recent 5 bookings
    const recentBookings = bookings.slice(-5).reverse();
    
    container.innerHTML = recentBookings.map(booking => `
        <div class="ticket-item">
            <div class="ticket-header">
                <div class="ticket-icon">
                    <i class="fa-solid fa-ticket"></i>
                </div>
                <div class="ticket-info">
                    <h4>${booking.match}</h4>
                    <p class="ticket-stadium"><i class="fa-solid fa-location-dot"></i> ${booking.stadium}</p>
                    <p class="ticket-date"><i class="fa-regular fa-clock"></i> ${booking.dateTime}</p>
                </div>
            </div>
            <div class="ticket-details">
                <div class="ticket-detail-row">
                    <span class="label">Booking ID:</span>
                    <span class="value">${booking.id}</span>
                </div>
                <div class="ticket-detail-row">
                    <span class="label">Category:</span>
                    <span class="value">${booking.category}</span>
                </div>
                <div class="ticket-detail-row">
                    <span class="label">Quantity:</span>
                    <span class="value">${booking.quantity} ticket${booking.quantity > 1 ? 's' : ''}</span>
                </div>
                <div class="ticket-detail-row">
                    <span class="label">Total:</span>
                    <span class="value ticket-price">${booking.total} SAR</span>
                </div>
                <div class="ticket-detail-row">
                    <span class="label">Status:</span>
                    <span class="value ticket-status-confirmed">${booking.status}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Load user's resale listings
function loadMyResaleListings() {
    const sessionData = getSessionData();
    if (!sessionData || !sessionData.loggedIn) {
        return;
    }

    const resaleListings = JSON.parse(localStorage.getItem('resaleListings') || '[]');
    
    // Filter to only show user's own listings
    const myListings = resaleListings.filter(listing => listing.sellerEmail === sessionData.email);
    
    const container = document.getElementById('myResaleListings');
    
    if (myListings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-tags"></i>
                <p>No tickets listed for resale. Visit the Resell page to list your tickets!</p>
            </div>
        `;
        return;
    }
    
    // Show most recent 5 listings
    const recentListings = myListings.slice(-5).reverse();
    
    container.innerHTML = recentListings.map(listing => `
        <div class="ticket-item resale-listing">
            <div class="ticket-header">
                <div class="ticket-icon resale-icon">
                    <i class="fa-solid fa-tags"></i>
                </div>
                <div class="ticket-info">
                    <h4>${listing.match}</h4>
                    <p class="ticket-stadium"><i class="fa-solid fa-location-dot"></i> ${listing.stadium}</p>
                    <p class="ticket-date"><i class="fa-regular fa-clock"></i> ${listing.dateTime}</p>
                </div>
                <span class="listing-badge">For Sale</span>
            </div>
            <div class="ticket-details">
                <div class="ticket-detail-row">
                    <span class="label">Listing ID:</span>
                    <span class="value">${listing.id}</span>
                </div>
                <div class="ticket-detail-row">
                    <span class="label">Category:</span>
                    <span class="value">${listing.category}</span>
                </div>
                <div class="ticket-detail-row">
                    <span class="label">Quantity:</span>
                    <span class="value">${listing.quantity} ticket${listing.quantity > 1 ? 's' : ''}</span>
                </div>
                <div class="ticket-detail-row">
                    <span class="label">Original Price:</span>
                    <span class="value">${listing.originalPrice} SAR</span>
                </div>
                <div class="ticket-detail-row">
                    <span class="label">Resale Price:</span>
                    <span class="value resale-price-highlight">${listing.resalePrice} SAR</span>
                </div>
                <div class="ticket-detail-row">
                    <span class="label">Status:</span>
                    <span class="value ticket-status-available">${listing.status}</span>
                </div>
                ${listing.notes ? `
                <div class="ticket-detail-row">
                    <span class="label">Notes:</span>
                    <span class="value">${listing.notes}</span>
                </div>
                ` : ''}
                <div class="ticket-actions">
                    <button class="btn-cancel-listing" onclick="cancelResaleListing('${listing.id}')">
                        <i class="fa-solid fa-times"></i> Cancel Listing
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Cancel resale listing
function cancelResaleListing(listingId) {
    if (!confirm('Are you sure you want to cancel this listing?')) {
        return;
    }
    
    const resaleListings = JSON.parse(localStorage.getItem('resaleListings') || '[]');
    const updatedListings = resaleListings.filter(l => l.id !== listingId);
    localStorage.setItem('resaleListings', JSON.stringify(updatedListings));
    
    showSuccessMessage('Listing cancelled successfully!');
    
    // Reload both sections
    loadMyTickets();
    loadMyResaleListings();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeProfile);
