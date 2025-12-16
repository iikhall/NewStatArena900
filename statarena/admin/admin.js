// Admin Dashboard JavaScript

// Check admin authentication
function checkAdminAuth() {
    const session = localStorage.getItem('statarena_session') || sessionStorage.getItem('statarena_session');
    
    if (!session) {
        alert('Please login to access the admin panel');
        window.location.href = '../login/login.html';
        return false;
    }
    
    const userData = JSON.parse(session);
    
    // Check if user is admin
    if (userData.role !== 'admin') {
        alert('Access Denied: You do not have administrator privileges');
        window.location.href = '../home/home.html';
        return false;
    }
    
    // Update welcome message with username
    const welcomeSpan = document.querySelector('.user-info span');
    if (welcomeSpan) {
        welcomeSpan.textContent = `Welcome, ${userData.username || 'Admin'}!`;
    }
    
    return true;
}

// Load users on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin page loaded');
    
    // Check admin authentication first
    if (!checkAdminAuth()) {
        console.log('Authentication failed - redirecting');
        return; // Stop execution if not authenticated
    }
    
    console.log('Authentication successful - loading data');
    loadUsers();
    updateStats();
    loadMatches();
    loadPredictions();
    loadTickets();
});

// Tab switching
function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Hide all sections
    const sections = ['users-section', 'matches-section', 'predictions-section', 'tickets-section'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'none';
        }
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(tabName + '-section');
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    // Add active class to clicked tab - use event if available, otherwise find by onclick
    const clickedBtn = event && event.target ? event.target.closest('.tab-btn') : 
                       document.querySelector(`.tab-btn[onclick*="'${tabName}'"]`);
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }
}

// Modal functions
function showAddMatchModal() {
    loadClubsForMatch();
    document.getElementById('addMatchModal').style.display = 'block';
}

function showAddTicketModal() {
    loadMatchesForTickets();
    document.getElementById('addTicketModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Load clubs for match form
async function loadClubsForMatch() {
    try {
        const response = await fetch('http://localhost:3000/api/matches/data/clubs');
        const clubs = await response.json();
        
        const homeSelect = document.getElementById('homeTeam');
        const awaySelect = document.getElementById('awayTeam');
        const editHomeSelect = document.getElementById('editHomeTeam');
        const editAwaySelect = document.getElementById('editAwayTeam');
        
        const options = clubs.map(club => `<option value="${club.club_id}">${club.name}</option>`).join('');
        
        homeSelect.innerHTML = '<option value="">Select Home Team</option>' + options;
        awaySelect.innerHTML = '<option value="">Select Away Team</option>' + options;
        
        if (editHomeSelect) {
            editHomeSelect.innerHTML = '<option value="">Select Home Team</option>' + options;
        }
        if (editAwaySelect) {
            editAwaySelect.innerHTML = '<option value="">Select Away Team</option>' + options;
        }
    } catch (error) {
        console.error('Error loading clubs:', error);
    }
}

// Add Match
async function addMatch(event) {
    event.preventDefault();
    
    const matchData = {
        home_club_id: parseInt(document.getElementById('homeTeam').value),
        away_club_id: parseInt(document.getElementById('awayTeam').value),
        league_id: parseInt(document.getElementById('league').value),
        match_date: document.getElementById('matchDateTime').value,
        venue: document.getElementById('stadium').value,
        status: document.getElementById('matchStatus').value
    };
    
    // Validate
    if (!matchData.home_club_id || !matchData.away_club_id || !matchData.league_id || !matchData.match_date) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (matchData.home_club_id === matchData.away_club_id) {
        alert('Home and away teams must be different');
        return;
    }
    
    try {
        const session = JSON.parse(localStorage.getItem('statarena_session') || sessionStorage.getItem('statarena_session'));
        
        console.log('Sending match data:', matchData);
        
        const response = await fetch('http://localhost:3000/api/matches', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.token}`
            },
            body: JSON.stringify(matchData)
        });
        
        const result = await response.json();
        console.log('API Response:', result);
        
        if (response.ok) {
            alert('Match added successfully!');
            closeModal('addMatchModal');
            document.getElementById('addMatchForm').reset();
            loadMatches();
        } else {
            alert(result.error || result.message || 'Failed to add match');
        }
    } catch (error) {
        console.error('Error adding match:', error);
        alert('Cannot connect to server: ' + error.message);
    }
}

// Load Matches
async function loadMatches() {
    try {
        const response = await fetch('http://localhost:3000/api/matches');
        const matches = await response.json();
        
        const tbody = document.getElementById('matchesTableBody');
        
        if (!matches || matches.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: #64748b;">
                        No matches found
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = matches.map(match => {
            // Format score display
            let scoreDisplay = '';
            if (match.home_score !== null && match.away_score !== null) {
                scoreDisplay = ` (${match.home_score} - ${match.away_score})`;
            }
            
            return `
            <tr>
                <td>${new Date(match.match_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                <td>${match.home_team}${match.home_score !== null ? ` <strong style="color: #10b981;">${match.home_score}</strong>` : ''}</td>
                <td>${match.away_team}${match.away_score !== null ? ` <strong style="color: #10b981;">${match.away_score}</strong>` : ''}</td>
                <td><span class="role-badge user">${match.league_name}</span></td>
                <td><span class="status-badge status-${match.status}">${match.status}</span></td>
                <td>
                    <button class="btn-edit" onclick="showEditMatchModal(${match.match_id})" style="margin-right: 8px;" title="Edit match details${match.status === 'Finished' ? ' and scores' : ''}">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="deleteMatch(${match.match_id})">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading matches:', error);
    }
}

// Delete Match
async function deleteMatch(matchId) {
    if (!confirm('Are you sure you want to delete this match?')) return;
    
    try {
        const session = JSON.parse(localStorage.getItem('statarena_session') || sessionStorage.getItem('statarena_session'));
        const response = await fetch(`http://localhost:3000/api/matches/${matchId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session.token}`
            }
        });
        
        if (response.ok) {
            alert('Match deleted successfully!');
            loadMatches();
        } else {
            alert('Failed to delete match');
        }
    } catch (error) {
        console.error('Error deleting match:', error);
        alert('Cannot connect to server');
    }
}

// Show edit match modal
async function showEditMatchModal(matchId) {
    try {
        // Load clubs first
        await loadClubsForMatch();
        
        // Fetch match details
        const response = await fetch(`http://localhost:3000/api/matches/${matchId}`);
        const match = await response.json();
        
        // Populate form fields
        document.getElementById('editMatchId').value = match.match_id;
        document.getElementById('editHomeTeam').value = match.home_club_id;
        document.getElementById('editAwayTeam').value = match.away_club_id;
        document.getElementById('editLeague').value = match.league_id;
        document.getElementById('editStadium').value = match.venue || '';
        document.getElementById('editMatchStatus').value = match.status;
        document.getElementById('editHomeScore').value = match.home_score || '';
        document.getElementById('editAwayScore').value = match.away_score || '';
        
        // Format datetime-local value
        if (match.match_date) {
            const date = new Date(match.match_date);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            document.getElementById('editMatchDateTime').value = `${year}-${month}-${day}T${hours}:${minutes}`;
        }
        
        // Show modal
        document.getElementById('editMatchModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading match details:', error);
        alert('Failed to load match details');
    }
}

// Update match
async function updateMatch(event) {
    event.preventDefault();
    
    const matchId = document.getElementById('editMatchId').value;
    const matchData = {
        home_club_id: parseInt(document.getElementById('editHomeTeam').value),
        away_club_id: parseInt(document.getElementById('editAwayTeam').value),
        league_id: parseInt(document.getElementById('editLeague').value),
        match_date: document.getElementById('editMatchDateTime').value,
        venue: document.getElementById('editStadium').value,
        status: document.getElementById('editMatchStatus').value,
        home_score: document.getElementById('editHomeScore').value ? parseInt(document.getElementById('editHomeScore').value) : null,
        away_score: document.getElementById('editAwayScore').value ? parseInt(document.getElementById('editAwayScore').value) : null
    };
    
    // Validate
    if (!matchData.home_club_id || !matchData.away_club_id || !matchData.league_id || !matchData.match_date) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (matchData.home_club_id === matchData.away_club_id) {
        alert('Home and away teams must be different');
        return;
    }
    
    try {
        const session = JSON.parse(localStorage.getItem('statarena_session') || sessionStorage.getItem('statarena_session'));
        
        const response = await fetch(`http://localhost:3000/api/matches/${matchId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.token}`
            },
            body: JSON.stringify(matchData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Match updated successfully!');
            closeModal('editMatchModal');
            loadMatches();
        } else {
            alert(result.error || result.message || 'Failed to update match');
        }
    } catch (error) {
        console.error('Error updating match:', error);
        alert('Cannot connect to server: ' + error.message);
    }
}

// Load Predictions
async function loadPredictions() {
    try {
        const session = JSON.parse(localStorage.getItem('statarena_session') || sessionStorage.getItem('statarena_session'));
        const response = await fetch('http://localhost:3000/api/predictions/all', {
            headers: {
                'Authorization': `Bearer ${session.token}`
            }
        });
        
        const predictions = await response.json();
        const tbody = document.getElementById('predictionsTableBody');
        
        if (!predictions || predictions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: #64748b;">
                        No predictions found
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = predictions.slice(0, 50).map(pred => `
            <tr>
                <td>${pred.user_name || 'Unknown'}</td>
                <td>${pred.home_team} vs ${pred.away_team}</td>
                <td>${pred.predicted_home_score} - ${pred.predicted_away_score}</td>
                <td><span class="status-badge status-${pred.status}">${pred.status}</span></td>
                <td>${pred.points || 0}</td>
                <td>${new Date(pred.created_at).toLocaleDateString('en-US')}</td>
                <td>
                    <button class="btn-delete" onclick="deletePrediction(${pred.prediction_id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading predictions:', error);
    }
}

// Delete Prediction
async function deletePrediction(predictionId) {
    if (!confirm('Delete this prediction?')) return;
    
    try {
        const session = JSON.parse(localStorage.getItem('statarena_session') || sessionStorage.getItem('statarena_session'));
        const response = await fetch(`http://localhost:3000/api/predictions/${predictionId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session.token}`
            }
        });
        
        if (response.ok) {
            alert('Prediction deleted!');
            loadPredictions();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Load matches for ticket dropdown
async function loadMatchesForTickets() {
    try {
        const response = await fetch('http://localhost:3000/api/matches');
        const matches = await response.json();
        
        const select = document.getElementById('ticketMatch');
        select.innerHTML = '<option value="">Select a match</option>' + 
            matches.map(match => `
                <option value="${match.match_id}">
                    ${match.home_team} vs ${match.away_team} - ${new Date(match.match_date).toLocaleDateString()}
                </option>
            `).join('');
    } catch (error) {
        console.error('Error loading matches:', error);
    }
}

// Add Ticket
async function addTicket(event) {
    event.preventDefault();
    
    const ticketData = {
        match_id: parseInt(document.getElementById('ticketMatch').value),
        section: document.getElementById('ticketSection').value,
        price: parseFloat(document.getElementById('ticketPrice').value),
        available_quantity: parseInt(document.getElementById('ticketQuantity').value),
        total_quantity: parseInt(document.getElementById('ticketQuantity').value),
        seat_info: document.getElementById('seatInfo').value
    };
    
    try {
        const session = JSON.parse(localStorage.getItem('statarena_session') || sessionStorage.getItem('statarena_session'));
        const response = await fetch('http://localhost:3000/api/tickets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.token}`
            },
            body: JSON.stringify(ticketData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Tickets added successfully!');
            closeModal('addTicketModal');
            document.getElementById('addTicketForm').reset();
            loadTickets();
        } else {
            alert(result.error || 'Failed to add tickets');
        }
    } catch (error) {
        console.error('Error adding tickets:', error);
        alert('Cannot connect to server');
    }
}

// Load Tickets
async function loadTickets() {
    try {
        const response = await fetch('http://localhost:3000/api/tickets');
        const tickets = await response.json();
        
        const tbody = document.getElementById('ticketsTableBody');
        
        if (!tickets || tickets.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: #64748b;">
                        No tickets found
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = tickets.map(ticket => `
            <tr>
                <td>${ticket.home_team} vs ${ticket.away_team}</td>
                <td><span class="role-badge ${ticket.section.toLowerCase()}">${ticket.section}</span></td>
                <td>$${ticket.price}</td>
                <td>${ticket.available_quantity}</td>
                <td>${ticket.total_quantity}</td>
                <td>
                    <button class="btn-delete" onclick="deleteTicket(${ticket.ticket_id})">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading tickets:', error);
    }
}

// Delete Ticket
async function deleteTicket(ticketId) {
    if (!confirm('Delete this ticket?')) return;
    
    try {
        const session = JSON.parse(localStorage.getItem('statarena_session') || sessionStorage.getItem('statarena_session'));
        const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session.token}`
            }
        });
        
        if (response.ok) {
            alert('Ticket deleted!');
            loadTickets();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


// Load and display all users
async function loadUsers() {
    try {
        const response = await fetch('http://localhost:3000/api/users');
        const users = await response.json();
        
        const tbody = document.getElementById('usersTableBody');
        
        if (!users || users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: #64748b;">
                        No users registered yet
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <span class="role-badge ${user.role}">
                        ${user.role.toUpperCase()}
                    </span>
                </td>
                <td>${new Date(user.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                <td>
                    <button 
                        class="btn-delete" 
                        onclick="deleteUser(${user.user_id}, '${user.email}')"
                        ${user.role === 'admin' ? 'disabled title="Cannot delete admin account"' : ''}
                    >
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Delete user
async function deleteUser(userId, userEmail) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }
    
    // Don't allow deleting admin account
    if (userEmail === 'k@k.com') {
        alert('Cannot delete the administrator account!');
        return;
    }
    
    try {
        const session = JSON.parse(localStorage.getItem('statarena_session') || sessionStorage.getItem('statarena_session'));
        
        const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session.token}`
            }
        });
        
        if (response.ok) {
            alert('User deleted successfully!');
            loadUsers();
            updateStats(); // Refresh stats after deleting user
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to delete user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Cannot connect to server');
    }
}

// Update statistics
async function updateStats() {
    try {
        console.log('Fetching admin statistics...');
        const response = await fetch('http://localhost:3000/api/users/stats');
        
        if (!response.ok) {
            console.error('Failed to fetch stats:', response.status);
            return;
        }
        
        const stats = await response.json();
        console.log('Admin stats loaded:', stats);
        
        // Update the dashboard stats
        document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
        document.getElementById('totalAdmins').textContent = stats.totalAdmins || 0;
        document.getElementById('activeUsers').textContent = stats.activeSessions || 0;
        document.getElementById('newUsers').textContent = stats.newUsers || 0;
        
        // Update last login time from session
        const session = JSON.parse(localStorage.getItem('statarena_session') || 
                                    sessionStorage.getItem('statarena_session') || '{}');
        if (session.loginTime) {
            document.getElementById('lastLogin').textContent = formatDate(session.loginTime);
        }
        
        // Calculate approximate storage used (this is just for display)
        const storageSize = new Blob([JSON.stringify(stats)]).size;
        document.getElementById('storageUsed').textContent = (storageSize / 1024).toFixed(2) + ' KB';
    } catch (error) {
        console.error('Error updating stats:', error);
        // Set default values on error
        document.getElementById('totalUsers').textContent = '0';
        document.getElementById('totalAdmins').textContent = '0';
        document.getElementById('activeUsers').textContent = '0';
        document.getElementById('newUsers').textContent = '0';
    }
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('en-US', options);
}

// Clear all data
function clearAllData() {
    const confirmation = prompt(
        'WARNING: This will delete ALL user data permanently!\n\n' +
        'Type "DELETE ALL" to confirm:'
    );
    
    if (confirmation === 'DELETE ALL') {
        // Clear everything except admin account
        const adminUser = {
            name: 'Administrator',
            email: 'k@k.com',
            password: '123456',
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('statarena_users', JSON.stringify([adminUser]));
        localStorage.removeItem('statarena_session');
        sessionStorage.removeItem('statarena_session');
        
        alert('All user data has been cleared! Please login again.');
        window.location.href = '../login/login.html';
    } else {
        alert('Action cancelled. Data was not deleted.');
    }
}
