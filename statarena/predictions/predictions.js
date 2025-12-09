// Predictions Page - Handle user predictions and display history

// Get current user session
function getCurrentSession() {
    const session = localStorage.getItem('statarena_session') || sessionStorage.getItem('statarena_session');
    return session ? JSON.parse(session) : null;
}

// Load predictions from API
async function loadUserPredictions() {
    const session = getCurrentSession();
    if (!session) return [];
    
    try {
        const response = await fetch(`http://localhost:3000/api/predictions/user/${session.user_id}`, {
            headers: {
                'Authorization': `Bearer ${session.token}`
            }
        });
        
        if (response.ok) {
            return await response.json();
        }
        return [];
    } catch (error) {
        console.error('Error loading predictions:', error);
        return [];
    }
}

// Save prediction to API
async function saveUserPrediction(predictionData) {
    const session = getCurrentSession();
    if (!session) {
        alert('Please login to make predictions');
        return false;
    }
    
    console.log('Saving prediction:', predictionData);
    console.log('Session:', session);
    
    try {
        const requestBody = {
            user_id: session.user_id,
            match_title: predictionData.match_title,
            home_team: predictionData.home_team,
            away_team: predictionData.away_team,
            league_name: predictionData.league_name,
            predicted_home_score: predictionData.homeScore,
            predicted_away_score: predictionData.awayScore,
            match_date: predictionData.match_date
        };
        
        console.log('Request body:', requestBody);
        
        const response = await fetch('http://localhost:3000/api/predictions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.token}`
            },
            body: JSON.stringify(requestBody)
        });
        
        const result = await response.json();
        console.log('API Response:', result);
        
        if (response.ok) {
            return true;
        } else {
            alert(result.error || result.message || 'Failed to save prediction');
            return false;
        }
    } catch (error) {
        console.error('Error saving prediction:', error);
        alert('Cannot connect to server. Please check if the backend is running.');
        return false;
    }
}

// Initialize the page
async function initializePage() {
    setupPredictionCards();
    await displayRecentPredictions();
    await updateUserStats();
}

// Setup prediction card interactions
function setupPredictionCards() {
    const predictionCards = document.querySelectorAll('.prediction-card.active');
    
    predictionCards.forEach(card => {
        const winButtons = card.querySelectorAll('.win-btn');
        const submitButton = card.querySelector('.btn-submit-prediction');
        const scoreInputs = card.querySelectorAll('.score-input');
        const incrementBtns = card.querySelectorAll('.increment-btn');
        
        // Handle winner selection
        winButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                winButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });
        
        // Handle score increment buttons
        incrementBtns.forEach((btn, index) => {
            btn.addEventListener('click', function() {
                const input = scoreInputs[index];
                const currentValue = parseInt(input.value || 0);
                input.value = currentValue + 1;
            });
        });
        
        // Handle submit prediction
        if (submitButton) {
            submitButton.addEventListener('click', function() {
                submitPrediction(card);
            });
        }
    });
}

// Submit a prediction
async function submitPrediction(card) {
    const selectedWinner = card.querySelector('.win-btn.selected');
    const scoreInputs = card.querySelectorAll('.score-input');
    const teams = card.querySelectorAll('.team-name');
    const leagueBadge = card.querySelector('.league-badge');
    const matchTime = card.querySelector('.match-time');
    
    // Validation
    if (!selectedWinner) {
        alert('Please select a winner!');
        return;
    }
    
    const homeScore = parseInt(scoreInputs[0].value || 0);
    const awayScore = parseInt(scoreInputs[1].value || 0);
    
    // Extract team names
    const homeTeam = teams[0]?.textContent.trim();
    const awayTeam = teams[1]?.textContent.trim();
    const leagueName = leagueBadge?.textContent.trim();
    const matchDate = matchTime?.textContent.trim().replace(/.*\s/, ''); // Extract date from "🕐 12/9/2025"
    
    if (!homeTeam || !awayTeam) {
        alert('Team information is missing. Please refresh the page.');
        console.error('Team names not found in card:', card);
        return;
    }
    
    // Create prediction object
    const predictionData = {
        match_title: `${homeTeam} vs ${awayTeam}`,
        home_team: homeTeam,
        away_team: awayTeam,
        league_name: leagueName || 'Unknown League',
        match_date: matchDate || null,
        homeScore: homeScore,
        awayScore: awayScore
    };
    
    // Save prediction to database
    const success = await saveUserPrediction(predictionData);
    
    if (success) {
        // Update UI
        await displayRecentPredictions();
        await updateUserStats();
        
        // Convert card to completed state
        card.classList.remove('active');
        card.classList.add('completed');
        
        // Show success message
        showSuccessMessage('Prediction saved successfully!');
    }
}

// Display recent predictions
async function displayRecentPredictions() {
    const predictions = await loadUserPredictions();
    const recentList = document.querySelector('.recent-predictions-list');
    
    if (!recentList) return;
    
    // Clear existing content
    recentList.innerHTML = '';
    
    if (predictions.length === 0) {
        recentList.innerHTML = `
            <div class="empty-predictions">
                <i class="fa-regular fa-futbol" style="font-size: 48px; color: #cbd5e1; margin-bottom: 15px;"></i>
                <p style="color: #94a3b8; text-align: center;">No predictions yet. Start predicting matches to see your history here!</p>
            </div>
        `;
        return;
    }
    
    // Display up to 4 recent predictions
    predictions.slice(0, 4).forEach(pred => {
        const predictionItem = document.createElement('div');
        predictionItem.className = 'recent-prediction-item';
        predictionItem.innerHTML = `
            <div class="prediction-date">${new Date(pred.created_at).toLocaleDateString('en-US')}</div>
            <span class="recent-league-badge">${pred.league_name || 'League'}</span>
            <div class="prediction-match">
                <span class="team-name-recent">${pred.home_team}</span>
                <span class="score-recent">${pred.predicted_home_score} - ${pred.predicted_away_score}</span>
                <span class="team-name-recent">${pred.away_team}</span>
            </div>
            <span class="status-badge status-${pred.status || 'pending'}">${pred.status || 'pending'}</span>
        `;
        recentList.appendChild(predictionItem);
    });
}

// Update user stats
async function updateUserStats() {
    const session = getCurrentSession();
    if (!session) return;
    
    try {
        const response = await fetch(`http://localhost:3000/api/predictions/stats/${session.user_id}`, {
            headers: {
                'Authorization': `Bearer ${session.token}`
            }
        });
        
        if (response.ok) {
            const stats = await response.json();
            
            // Update stats cards
            const statCards = document.querySelectorAll('.stat-card h2');
            if (statCards.length >= 1) {
                statCards[0].textContent = stats.total_points || 0;
            }
            if (statCards.length >= 2) {
                statCards[1].textContent = stats.total_predictions || 0;
            }
            if (statCards.length >= 3) {
                statCards[2].textContent = stats.correct_predictions || 0;
            }
        }
    } catch (error) {
        console.error('Error loading user stats:', error);
    }
}

// Show success message
function showSuccessMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>
        <span>${message}</span>
    `;
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
    
    .win-btn.selected {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        transform: scale(1.05);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    
    .empty-predictions {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        text-align: center;
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);
