// Favorites Management System
// Handles adding/removing favorite players and clubs

function getFavorites() {
    const sessionData = getSessionData();
    
    if (!sessionData || !sessionData.loggedIn) {
        return { players: [], clubs: [] };
    }
    
    const favorites = localStorage.getItem('statarena_favorites_' + sessionData.email);
    
    if (favorites) {
        try {
            return JSON.parse(favorites);
        } catch (e) {
            return { players: [], clubs: [] };
        }
    }
    
    return { players: [], clubs: [] };
}

function saveFavorites(favorites) {
    const sessionData = getSessionData();
    
    if (!sessionData || !sessionData.loggedIn) {
        alert('Please login to save favorites!');
        return false;
    }
    
    localStorage.setItem('statarena_favorites_' + sessionData.email, JSON.stringify(favorites));
    return true;
}

function toggleFavoritePlayer(playerName) {
    const sessionData = getSessionData();
    
    if (!sessionData || !sessionData.loggedIn) {
        alert('Please login to add players to favorites!');
        window.location.href = '../login/login.html';
        return;
    }
    
    const favorites = getFavorites();
    const index = favorites.players.indexOf(playerName);
    
    if (index > -1) {
        // Remove from favorites
        favorites.players.splice(index, 1);
        alert(playerName + ' removed from favorites!');
    } else {
        // Add to favorites
        favorites.players.push(playerName);
        alert(playerName + ' added to favorites!');
    }
    
    saveFavorites(favorites);
    return index === -1; // Return true if added, false if removed
}

function toggleFavoriteClub(clubName) {
    const sessionData = getSessionData();
    
    if (!sessionData || !sessionData.loggedIn) {
        alert('Please login to add clubs to favorites!');
        window.location.href = '../login/login.html';
        return;
    }
    
    const favorites = getFavorites();
    const index = favorites.clubs.indexOf(clubName);
    
    if (index > -1) {
        // Remove from favorites
        favorites.clubs.splice(index, 1);
        alert(clubName + ' removed from favorites!');
    } else {
        // Add to favorites
        favorites.clubs.push(clubName);
        alert(clubName + ' added to favorites!');
    }
    
    saveFavorites(favorites);
    return index === -1; // Return true if added, false if removed
}

function isPlayerFavorite(playerName) {
    const favorites = getFavorites();
    return favorites.players.includes(playerName);
}

function isClubFavorite(clubName) {
    const favorites = getFavorites();
    return favorites.clubs.includes(clubName);
}

function updateFavoriteIcons() {
    // Update all favorite icons on the page based on current favorites
    const favorites = getFavorites();
    
    // Update player favorite icons
    document.querySelectorAll('[data-player-name]').forEach(element => {
        const playerName = element.getAttribute('data-player-name');
        const icon = element.querySelector('.favorite-icon');
        
        if (icon) {
            if (favorites.players.includes(playerName)) {
                icon.classList.remove('fa-regular');
                icon.classList.add('fa-solid');
                icon.style.color = '#ef4444';
            } else {
                icon.classList.remove('fa-solid');
                icon.classList.add('fa-regular');
                icon.style.color = '';
            }
        }
    });
    
    // Update club favorite icons
    document.querySelectorAll('[data-club-name]').forEach(element => {
        const clubName = element.getAttribute('data-club-name');
        const icon = element.querySelector('.favorite-icon');
        
        if (icon) {
            if (favorites.clubs.includes(clubName)) {
                icon.classList.remove('fa-regular');
                icon.classList.add('fa-solid');
                icon.style.color = '#ef4444';
            } else {
                icon.classList.remove('fa-solid');
                icon.classList.add('fa-regular');
                icon.style.color = '';
            }
        }
    });
}

// Helper function to get session data (if not already defined)
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

// Update favorite icons on page load
document.addEventListener('DOMContentLoaded', function() {
    updateFavoriteIcons();
});
