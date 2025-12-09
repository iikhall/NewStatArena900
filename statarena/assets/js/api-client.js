// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// API Client for StatArena
class StatArenaAPI {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('statarena_token');
    }

    // Helper method for making requests
    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        if (data.token) {
            this.token = data.token;
            localStorage.setItem('statarena_token', data.token);
            localStorage.setItem('statarena_user', JSON.stringify(data.user));
        }
        return data;
    }

    async register(name, email, password) {
        return await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
    }

    logout() {
        this.token = null;
        localStorage.removeItem('statarena_token');
        localStorage.removeItem('statarena_user');
    }

    // Matches endpoints
    async getAllMatches() {
        return await this.request('/matches');
    }

    async getMatchById(id) {
        return await this.request(`/matches/${id}`);
    }

    async getMatchesByStatus(status) {
        return await this.request(`/matches?status=${status}`);
    }

    async getLiveMatches() {
        return await this.getMatchesByStatus('LIVE');
    }

    async getUpcomingMatches() {
        return await this.getMatchesByStatus('Upcoming');
    }

    async getFinishedMatches() {
        return await this.getMatchesByStatus('Finished');
    }

    // Clubs endpoints
    async getAllClubs() {
        return await this.request('/clubs');
    }

    async getClubById(id) {
        return await this.request(`/clubs/${id}`);
    }

    async getClubsByLeague(leagueId) {
        return await this.request(`/clubs?league_id=${leagueId}`);
    }

    async getLeagueStandings(leagueId) {
        return await this.request(`/clubs/standings/${leagueId}`);
    }

    // Players endpoints
    async getAllPlayers() {
        return await this.request('/players');
    }

    async getPlayerById(id) {
        return await this.request(`/players/${id}`);
    }

    async getPlayersByClub(clubId) {
        return await this.request(`/players?club_id=${clubId}`);
    }

    async getPlayersByPosition(position) {
        return await this.request(`/players?position=${position}`);
    }

    async getTopPlayers() {
        return await this.request('/players/top/featured');
    }

    // Leagues endpoints
    async getAllLeagues() {
        return await this.request('/leagues');
    }

    async getLeagueById(id) {
        return await this.request(`/leagues/${id}`);
    }

    // Predictions endpoints
    async getUserPredictions(userId) {
        return await this.request(`/predictions/user/${userId}`);
    }

    async getUserStats(userId) {
        return await this.request(`/predictions/stats/${userId}`);
    }

    async createPrediction(userId, matchId, homeScore, awayScore) {
        return await this.request('/predictions', {
            method: 'POST',
            body: JSON.stringify({
                user_id: userId,
                match_id: matchId,
                predicted_home_score: homeScore,
                predicted_away_score: awayScore
            })
        });
    }

    async getLeaderboard(limit = 10) {
        return await this.request(`/predictions/leaderboard/top?limit=${limit}`);
    }

    // User endpoints
    async getUserProfile(userId) {
        return await this.request(`/users/${userId}`);
    }

    // Health check
    async healthCheck() {
        return await this.request('/health');
    }
}

// Create global API instance
const api = new StatArenaAPI();

// Make it available globally
if (typeof window !== 'undefined') {
    window.api = api;
    window.StatArenaAPI = StatArenaAPI;
}
