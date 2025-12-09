// StatArena API Helper
// Centralized API communication for the frontend

const API_URL = 'http://localhost:3000/api';

// Helper function to get authentication headers
function getAuthHeaders() {
    const session = localStorage.getItem('statarena_session') || sessionStorage.getItem('statarena_session');
    if (!session) return { 'Content-Type': 'application/json' };
    
    const sessionData = JSON.parse(session);
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.token}`
    };
}

// Helper function to get current user
function getCurrentUser() {
    const session = localStorage.getItem('statarena_session') || sessionStorage.getItem('statarena_session');
    return session ? JSON.parse(session) : null;
}

// Helper function to handle API errors
function handleAPIError(error, context = 'API call') {
    console.error(`${context} error:`, error);
    if (error.message && error.message.includes('fetch')) {
        alert('Cannot connect to server. Please make sure the backend is running on port 3000.');
    }
    throw error;
}

// API Methods
const API = {
    // ==================== AUTHENTICATION ====================
    
    login: async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            return await response.json();
        } catch (error) {
            handleAPIError(error, 'Login');
        }
    },

    register: async (name, email, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            return await response.json();
        } catch (error) {
            handleAPIError(error, 'Registration');
        }
    },

    // ==================== MATCHES ====================
    
    getMatches: async () => {
        try {
            const response = await fetch(`${API_URL}/matches`);
            return await response.json();
        } catch (error) {
            handleAPIError(error, 'Get matches');
        }
    },

    getMatchById: async (matchId) => {
        try {
            const response = await fetch(`${API_URL}/matches/${matchId}`);
            return await response.json();
        } catch (error) {
            handleAPIError(error, 'Get match details');
        }
    },

    // ==================== PREDICTIONS ====================
    
    getUserPredictions: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/predictions/user/${userId}`, {
                headers: getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            handleAPIError(error, 'Get predictions');
        }
    },

    getUserStats: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/predictions/stats/${userId}`, {
                headers: getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            handleAPIError(error, 'Get user stats');
        }
    },

    savePrediction: async (userId, matchId, homeScore, awayScore) => {
        try {
            const response = await fetch(`${API_URL}/predictions`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    user_id: userId,
                    match_id: matchId,
                    predicted_home_score: homeScore,
                    predicted_away_score: awayScore
                })
            });
            return await response.json();
        } catch (error) {
            handleAPIError(error, 'Save prediction');
        }
    },

    // ==================== CLUBS ====================
    
    getClubs: async () => {
        try {
            const response = await fetch(`${API_URL}/clubs`);
            return await response.json();
        } catch (error) {
            handleAPIError(error, 'Get clubs');
        }
    },

    getClubById: async (clubId) => {
        try {
            const response = await fetch(`${API_URL}/clubs/${clubId}`);
            return await response.json();
        } catch (error) {
            handleAPIError(error, 'Get club details');
        }
    },

    getClubMatches: async (clubId) => {
        try {
            const response = await fetch(`${API_URL}/clubs/${clubId}/matches`);
            return await response.json();
        } catch (error) {
            handleAPIError(error, 'Get club matches');
        }
    },

    getClubPlayers: async (clubId) => {
        try {
            const response = await fetch(`${API_URL}/clubs/${clubId}/players`);
            return await response.json();
        } catch (error) {
            handleAPIError(error, 'Get club players');
        }
    },

    // ==================== PLAYERS ====================
    
    getPlayers: async () => {
        try {
            const response = await fetch(`${API_URL}/players`);
            return await response.json();
        } catch (error) {
            handleAPIError(error, 'Get players');
        }
    },

    getPlayerById: async (playerId) => {
        try {
            const response = await fetch(`${API_URL}/players/${playerId}`);
            return await response.json();
        } catch (error) {
            handleAPIError(error, 'Get player details');
        }
    },

    // ==================== LEAGUES ====================
    
    getLeagues: async () => {
        try {
            const response = await fetch(`${API_URL}/leagues`);
            return await response.json();
        } catch (error) {
            handleAPIError(error, 'Get leagues');
        }
    },

    getLeagueStandings: async (leagueId) => {
        try {
            const response = await fetch(`${API_URL}/leagues/${leagueId}/standings`);
            return await response.json();
        } catch (error) {
            handleAPIError(error, 'Get league standings');
        }
    },

    getLeagueMatches: async (leagueId) => {
        try {
            const response = await fetch(`${API_URL}/leagues/${leagueId}/matches`);
            return await response.json();
        } catch (error) {
            handleAPIError(error, 'Get league matches');
        }
    },

    // ==================== USERS ====================
    
    getUserProfile: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/users/${userId}`, {
                headers: getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            handleAPIError(error, 'Get user profile');
        }
    },

    updateUserProfile: async (userId, updateData) => {
        try {
            const response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updateData)
            });
            return await response.json();
        } catch (error) {
            handleAPIError(error, 'Update user profile');
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API, getCurrentUser, getAuthHeaders };
}
