// Admin Dashboard JavaScript

// Load users on page load
document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    updateStats();
    loadMatches();
    loadPredictions();
    loadTickets();
});

// Tab switching
function switchTab(tabName) {
    // Hide all sections
    document.getElementById('users-section').style.display = 'none';
    document.getElementById('matches-section').style.display = 'none';
    document.getElementById('predictions-section').style.display = 'none';
    document.getElementById('tickets-section').style.display = 'none';
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Show selected section
    document.getElementById(tabName + '-section').style.display = 'block';
    
    // Add active class to clicked tab
    event.target.closest('.tab-btn').classList.add('active');
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
        const response = await fetch('http://localhost:3000/api/clubs');
        const clubs = await response.json();
        
        const homeSelect = document.getElementById('homeTeam');
        const awaySelect = document.getElementById('awayTeam');
        
        const options = clubs.map(club => `<option value="${club.club_id}">${club.name}</option>`).join('');
        
        homeSelect.innerHTML = '<option value="">Select Home Team</option>' + options;
        awaySelect.innerHTML = '<option value="">Select Away Team</option>' + options;
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
        
        tbody.innerHTML = matches.map(match => `
            <tr>
                <td>${new Date(match.match_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                <td>${match.home_team}</td>
                <td>${match.away_team}</td>
                <td><span class="role-badge user">${match.league_name}</span></td>
                <td><span class="status-badge status-${match.status}">${match.status}</span></td>
                <td>
                    <button class="btn-delete" onclick="deleteMatch(${match.match_id})">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
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
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('statarena_users') || '[]');
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #64748b;">
                    No users registered yet
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = users.map((user, index) => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>
                <span class="role-badge ${user.role || (user.email === 'k@k.com' ? 'admin' : 'user')}">
                    ${user.role || (user.email === 'k@k.com' ? 'admin' : 'user')}
                </span>
            </td>
            <td>${formatDate(user.createdAt)}</td>
            <td>
                <button 
                    class="btn-delete" 
                    onclick="deleteUser(${index})"
                    ${user.email === 'k@k.com' ? 'disabled title="Cannot delete admin account"' : ''}
                >
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Delete user
function deleteUser(index) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('statarena_users') || '[]');
    const deletedUser = users[index];
    
    // Don't allow deleting admin account
    if (deletedUser.email === 'k@k.com') {
        alert('Cannot delete the administrator account!');
        return;
    }
    
    users.splice(index, 1);
    localStorage.setItem('statarena_users', JSON.stringify(users));
    
    // Clear session if deleted user is currently logged in
    const session = JSON.parse(localStorage.getItem('statarena_session') || 
                                sessionStorage.getItem('statarena_session') || '{}');
    if (session.email === deletedUser.email) {
        localStorage.removeItem('statarena_session');
        sessionStorage.removeItem('statarena_session');
    }
    
    loadUsers();
    updateStats();
    alert('User deleted successfully!');
}

// Update statistics
function updateStats() {
    const users = JSON.parse(localStorage.getItem('statarena_users') || '[]');
    const session = JSON.parse(localStorage.getItem('statarena_session') || 
                                sessionStorage.getItem('statarena_session') || '{}');
    
    // Total users
    document.getElementById('totalUsers').textContent = users.length;
    
    // Total admins
    const adminCount = users.filter(u => u.role === 'admin' || u.email === 'k@k.com').length;
    document.getElementById('totalAdmins').textContent = adminCount;
    
    // Active users (currently logged in)
    document.getElementById('activeUsers').textContent = session.loggedIn ? '1' : '0';
    
    // New users this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newUsers = users.filter(u => new Date(u.createdAt) > oneWeekAgo).length;
    document.getElementById('newUsers').textContent = newUsers;
    
    // Storage used
    const storageSize = new Blob([localStorage.getItem('statarena_users') || '']).size;
    document.getElementById('storageUsed').textContent = (storageSize / 1024).toFixed(2) + ' KB';
    
    // Last login time
    if (session.loginTime) {
        document.getElementById('lastLogin').textContent = formatDate(session.loginTime);
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
