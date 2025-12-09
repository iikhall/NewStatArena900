# Predictions and Tickets Methods Documentation

This document outlines the key methods and workflows for the Predictions and Tickets functionalities in the StatArena application, including the source code for each method.

## 1. Predictions

The predictions feature allows users to predict match outcomes, earn points, and view their statistics and leaderboard rankings.

### Backend Methods (`backend/routes/predictions.js`)

These API endpoints handle data persistence and retrieval for predictions.

#### `GET /all`
**Description:** Fetches all predictions with user details. Intended for admin use.
```javascript
// GET all predictions (Admin only - auth check to be added later)
router.get('/all', async (req, res) => {
    try {
        const [predictions] = await pool.query(`
            SELECT 
                p.*,
                u.name AS user_name,
                u.email AS user_email
            FROM predictions p
            JOIN users u ON p.user_id = u.user_id
            ORDER BY p.created_at DESC
        `);
        
        res.json(predictions);
    } catch (error) {
        console.error('Error fetching all predictions:', error);
        res.status(500).json({ error: 'Failed to fetch predictions' });
    }
});
```

#### `GET /user/:userId`
**Description:** Retrieves all predictions made by a specific user, ordered by creation date.
```javascript
//GET user predictions
router.get("/user/:userId", async function(req, res) {
    try {
        const { userId } = req.params;
        
        const [predictions] = await pool.query(`
            SELECT 
                prediction_id,
                user_id,
                match_title,
                home_team,
                away_team,
                league_name,
                predicted_home_score,
                predicted_away_score,
                match_date,
                created_at,
                status,
                points_earned
            FROM predictions
            WHERE user_id = ?
            ORDER BY created_at DESC
        `, [userId]);
        
        res.json(predictions);
    } catch (error) {
        console.error('Error fetching predictions:', error);
        res.status(500).json({ error: 'Failed to fetch predictions' });
    }
});
```

#### `GET /stats/:userId`
**Description:** Calculates total predictions, total points, correct predictions, and accuracy percentage for a user.
```javascript
// GET user statistics (calculated from predictions)
router.get('/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Calculate stats from predictions table
        const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as total_predictions,
                SUM(points_earned) as total_points,
                SUM(CASE WHEN status = 'correct' THEN 1 ELSE 0 END) as correct_predictions,
                ROUND(
                    (SUM(CASE WHEN status = 'correct' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 
                    2
                ) as accuracy_percentage
            FROM predictions
            WHERE user_id = ?
        `, [userId]);
        
        if (stats.length === 0 || stats[0].total_predictions === 0) {
            return res.json({
                total_points: 0,
                total_predictions: 0,
                correct_predictions: 0,
                accuracy_percentage: 0,
                global_rank: null
            });
        }
        
        res.json({
            total_points: stats[0].total_points || 0,
            total_predictions: stats[0].total_predictions || 0,
            correct_predictions: stats[0].correct_predictions || 0,
            accuracy_percentage: stats[0].accuracy_percentage || 0,
            global_rank: null
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
});
```

#### `POST /`
**Description:** Validates input and inserts a new prediction record. Sets default points earned (currently hardcoded to 10).
```javascript
// POST new prediction
router.post('/', async (req, res) => {
    try {
        const { 
            user_id, 
            match_title,
            home_team,
            away_team,
            league_name,
            predicted_home_score, 
            predicted_away_score,
            match_date
        } = req.body;
        
        // Validate input
        if (!user_id || !match_title || !home_team || !away_team || 
            predicted_home_score === undefined || predicted_away_score === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Insert prediction
        const [result] = await pool.query(`
            INSERT INTO predictions 
            (user_id, match_title, home_team, away_team, league_name, 
             predicted_home_score, predicted_away_score, match_date, points_earned)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 10)
        `, [user_id, match_title, home_team, away_team, league_name || null, 
            predicted_home_score, predicted_away_score, match_date || null]);
        
        res.status(201).json({
            message: 'Prediction created successfully',
            prediction_id: result.insertId
        });
    } catch (error) {
        console.error('Error creating prediction:', error);
        res.status(500).json({ error: 'Failed to create prediction' });
    }
});
```

#### `GET /leaderboard/top`
**Description:** Aggregates user points and accuracy to return the top users (default limit: 10).
```javascript
// GET leaderboard
router.get('/leaderboard/top', async (req, res) => {
    try {
        const limit = req.query.limit || 10;
        
        const [leaderboard] = await pool.query(`
            SELECT 
                u.name,
                SUM(p.points_earned) as total_points,
                COUNT(p.prediction_id) as total_predictions,
                SUM(CASE WHEN p.status = 'correct' THEN 1 ELSE 0 END) as correct_predictions,
                ROUND(
                    (SUM(CASE WHEN p.status = 'correct' THEN 1 ELSE 0 END) / COUNT(p.prediction_id)) * 100, 
                    2
                ) as accuracy_percentage
            FROM users u
            LEFT JOIN predictions p ON u.user_id = p.user_id
            WHERE u.is_active = TRUE
            GROUP BY u.user_id, u.name
            HAVING total_predictions > 0
            ORDER BY total_points DESC, accuracy_percentage DESC
            LIMIT ?
        `, [parseInt(limit)]);
        
        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});
```

### Frontend Methods (`statarena/predictions/predictions.js`)

These JavaScript functions handle the user interface and interaction with the backend APIs.

#### `loadUserPredictions()`
**Description:** Fetches the current user's prediction history.
```javascript
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
```

#### `saveUserPrediction(predictionData)`
**Description:** Sends a new prediction to the server.
```javascript
// Save prediction to API
async function saveUserPrediction(predictionData) {
    const session = getCurrentSession();
    if (!session) {
        alert('Please login to make predictions');
        return false;
    }
    
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
        
        const response = await fetch('http://localhost:3000/api/predictions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.token}`
            },
            body: JSON.stringify(requestBody)
        });
        
        const result = await response.json();
        
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
```

#### `submitPrediction(card)`
**Description:** Handles the "Submit" button click on a prediction card. Extracts data, validates, and calls `saveUserPrediction`.
```javascript
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
```

#### `updateUserStats()`
**Description:** Refreshes the user's statistics display by calling the stats API.
```javascript
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
```

---

## 2. Tickets

The tickets feature involves a multi-step purchase flow and a resale marketplace.

### Backend Methods (`backend/routes/tickets.js`)

#### `GET /`
**Description:** Retrieves all available tickets with match and club details.
```javascript
// GET all tickets
router.get('/', async (req, res) => {
    try {
        const [tickets] = await pool.query(`
            SELECT 
                t.*,
                m.match_date,
                hc.name AS home_team,
                ac.name AS away_team,
                l.name AS league_name
            FROM tickets t
            JOIN matches m ON t.match_id = m.match_id
            JOIN clubs hc ON m.home_club_id = hc.club_id
            JOIN clubs ac ON m.away_club_id = ac.club_id
            LEFT JOIN leagues l ON m.league_id = l.league_id
            ORDER BY m.match_date ASC
        `);
        
        res.json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});
```

#### `POST /purchase`
**Description:** Records a new ticket purchase in the `user_tickets` table.
```javascript
// POST - Purchase ticket (create user_ticket)
router.post('/purchase', async (req, res) => {
    try {
        const { user_id, match_title, match_date, stadium, category, quantity, price, total } = req.body;
        
        if (!user_id || !match_title || !quantity || !price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const [result] = await pool.query(`
            INSERT INTO user_tickets (user_id, match_title, match_date, stadium, category, quantity, price, total, purchase_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [user_id, match_title, match_date, stadium, category, quantity, price, total]);
        
        res.status(201).json({ 
            success: true, 
            message: 'Ticket purchased successfully',
            user_ticket_id: result.insertId 
        });
    } catch (error) {
        console.error('Error purchasing ticket:', error);
        res.status(500).json({ error: 'Failed to purchase ticket' });
    }
});
```

#### `GET /user/:userId`
**Description:** Retrieves tickets owned by a user that are **not** currently listed for resale.
```javascript
// GET user tickets
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const [tickets] = await pool.query(`
            SELECT * FROM user_tickets 
            WHERE user_id = ? AND resale_listed = 0
            ORDER BY purchase_date DESC
        `, [userId]);
        
        res.json(tickets);
    } catch (error) {
        console.error('Error fetching user tickets:', error);
        res.status(500).json({ error: 'Failed to fetch user tickets' });
    }
});
```

#### `GET /resale`
**Description:** Fetches all tickets currently listed in the resale marketplace.
```javascript
// GET all resale tickets
router.get('/resale', async (req, res) => {
    try {
        const [tickets] = await pool.query(`
            SELECT 
                r.*,
                ut.match_title,
                ut.match_date,
                ut.stadium,
                ut.category,
                ut.quantity,
                ut.price as original_price,
                u.name as seller_name
            FROM resale_tickets r
            JOIN user_tickets ut ON r.user_ticket_id = ut.user_ticket_id
            JOIN users u ON r.seller_id = u.user_id
            WHERE r.status = 'available'
            ORDER BY r.listed_date DESC
        `);
        
        res.json(tickets);
    } catch (error) {
        console.error('Error fetching resale tickets:', error);
        res.status(500).json({ error: 'Failed to fetch resale tickets' });
    }
});
```

#### `POST /resale`
**Description:** Moves a user's ticket to the resale market. Uses a transaction to ensure data integrity.
```javascript
// POST - List ticket for resale
router.post('/resale', async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { user_ticket_id, resale_price, notes } = req.body;
        
        if (!user_ticket_id || !resale_price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        await connection.beginTransaction();
        
        // Get user_id from the ticket
        const [tickets] = await connection.query(
            'SELECT user_id FROM user_tickets WHERE user_ticket_id = ?',
            [user_ticket_id]
        );
        
        if (tickets.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        const seller_id = tickets[0].user_id;
        
        // Create resale listing
        const [result] = await connection.query(`
            INSERT INTO resale_tickets (user_ticket_id, seller_id, resale_price, notes, listed_date, status)
            VALUES (?, ?, ?, ?, NOW(), 'available')
        `, [user_ticket_id, seller_id, resale_price, notes || null]);
        
        // Update user_ticket to mark as listed
        await connection.query(
            'UPDATE user_tickets SET resale_listed = 1 WHERE user_ticket_id = ?',
            [user_ticket_id]
        );
        
        await connection.commit();
        
        res.status(201).json({ 
            success: true, 
            message: 'Ticket listed for resale successfully',
            resale_id: result.insertId 
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error listing ticket for resale:', error);
        res.status(500).json({ error: 'Failed to list ticket for resale' });
    } finally {
        connection.release();
    }
});
```

#### `POST /resale/:resaleId/purchase`
**Description:** Handles the transfer of a resale ticket to a new buyer.
```javascript
// POST - Purchase resale ticket
router.post('/resale/:resaleId/purchase', async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { resaleId } = req.params;
        const { buyer_id } = req.body;
        
        if (!buyer_id) {
            return res.status(400).json({ error: 'Buyer ID is required' });
        }
        
        await connection.beginTransaction();
        
        // Get resale ticket details
        const [resaleTickets] = await connection.query(`
            SELECT r.*, ut.* 
            FROM resale_tickets r
            JOIN user_tickets ut ON r.user_ticket_id = ut.user_ticket_id
            WHERE r.resale_id = ? AND r.status = 'available'
        `, [resaleId]);
        
        if (resaleTickets.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Resale ticket not found or already sold' });
        }
        
        const ticket = resaleTickets[0];
        
        // Create new ticket for buyer
        await connection.query(`
            INSERT INTO user_tickets (user_id, match_title, match_date, stadium, category, quantity, price, total, purchase_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [buyer_id, ticket.match_title, ticket.match_date, ticket.stadium, ticket.category, ticket.quantity, ticket.resale_price, ticket.resale_price]);
        
        // Update resale status to sold
        await connection.query(
            'UPDATE resale_tickets SET status = "sold", buyer_id = ?, sold_date = NOW() WHERE resale_id = ?',
            [buyer_id, resaleId]
        );
        
        await connection.commit();
        
        res.json({ 
            success: true, 
            message: 'Resale ticket purchased successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error purchasing resale ticket:', error);
        res.status(500).json({ error: 'Failed to purchase resale ticket' });
    } finally {
        connection.release();
    }
});
```

### Frontend Methods

#### Step 1: Selection (`statarena/tickets/tickets.js`)

**`setupMatchCardListeners()`**
Description: Adds click event listeners to match cards. Highlights the selected card and updates the "Selected Event" preview.
```javascript
// Setup click listeners for match cards
function setupMatchCardListeners() {
    const matchCards = document.querySelectorAll('.match-card');
    
    matchCards.forEach(card => {
        card.style.cursor = 'pointer';
        
        card.addEventListener('click', function() {
            // Remove selection from previous card
            if (selectedMatchCard) {
                selectedMatchCard.style.border = '';
                selectedMatchCard.style.boxShadow = '';
            }
            
            // Select this card
            selectedMatchCard = card;
            card.style.border = '3px solid #7c3aed';
            card.style.boxShadow = '0 8px 25px rgba(124, 58, 237, 0.3)';
            
            // Update the right side "Selected Event" section
            updateSelectedEventDisplay();
        });
        // ... hover effects omitted
    });
}
```

**`setupContinueButton()`**
Description: Validates that a match is selected, saves the match details to `localStorage`, and redirects to `step2.html`.
```javascript
// Setup continue button
function setupContinueButton() {
    const continueBtn = document.querySelector('.btn-continue');
    
    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            if (!selectedMatchCard) {
                alert('Please select a match first');
                return;
            }
            
            // Get match details from the selected card
            const matchTitle = selectedMatchCard.querySelector('.match-title').textContent;
            // ... extraction logic
            
            // Store match data in localStorage
            const matchData = {
                title: matchTitle,
                // ... other fields
            };
            
            localStorage.setItem('selectedMatch', JSON.stringify(matchData));
            
            // Navigate to step 2
            window.location.href = 'step2.html';
        });
    }
}
```

#### Step 2: Details (`statarena/tickets/step2.js`)

**`updateOrderSummary()`**
Description: Dynamically calculates the total price based on the selected category and quantity. Adds a service fee (8%).
```javascript
// Update order summary display
function updateOrderSummary() {
    const categorySelect = document.getElementById('categorySelect');
    const quantitySelect = document.getElementById('quantitySelect');
    const matchData = JSON.parse(localStorage.getItem('selectedMatch'));
    
    const categoryValue = categorySelect?.getAttribute('data-selected');
    const quantityValue = quantitySelect?.getAttribute('data-selected');
    
    if (categoryValue && quantityValue && matchData) {
        // ...
        const categoryPrices = {
            'cat1-first': 50,
            'cat1-second': 50,
            'cat2-first': 60,
            'cat2-second': 60,
            'cat3': 70,
            'cat4': 80,
            'cat5': 100
        };
        
        const pricePerTicket = categoryPrices[categoryValue] || 50;
        const subtotal = pricePerTicket * quantity; 
        const serviceFee = subtotal * 0.08;
        const total = subtotal + serviceFee;
        
        // Update summary display
        // ...
    }
}
```

#### Step 3: Checkout (`statarena/tickets/step3.js`)

**`handlePaymentCompletion()`**
Description: Validates user input, checks session, and sends a `POST` request to `/api/tickets/purchase`.
```javascript
// Handle payment completion
async function handlePaymentCompletion() {
    // Validate payment method selected
    const activePayment = document.querySelector('.payment-option.active');
    if (!activePayment) { alert('Please select a payment method'); return; }
    
    // ... Validation logic for name, email, phone ...
    
    // Get booking data
    const matchData = JSON.parse(localStorage.getItem('selectedMatch'));
    const ticketData = JSON.parse(localStorage.getItem('selectedTickets'));
    
    // Get user session
    const session = localStorage.getItem('statarena_session') || sessionStorage.getItem('statarena_session');
    const userData = session ? JSON.parse(session) : null;
    
    if (!userData || !userData.user_id) {
        alert('Please login to complete your purchase');
        window.location.href = '../login/login.html';
        return;
    }
    
    try {
        // Save to database
        const response = await fetch('http://localhost:3000/api/tickets/purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userData.token}`
            },
            body: JSON.stringify({
                user_id: userData.user_id,
                match_title: matchData.title,
                match_date: matchData.dateTime,
                stadium: matchData.stadium,
                category: ticketData.category,
                quantity: ticketData.quantity,
                price: ticketData.pricePerTicket,
                total: ticketData.total
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to save ticket purchase');
        }
        
        // Clear selection data
        localStorage.removeItem('selectedMatch');
        localStorage.removeItem('selectedTickets');
        
        // Show success message
        alert(`✅ Payment Successful! ...`);
        
        // Redirect to tickets page
        window.location.href = 'tickets.html';
        
    } catch (error) {
        console.error('Error saving ticket:', error);
        alert('❌ Failed to complete purchase. Please try again.');
    }
}
```

#### Resale Market (`statarena/resell/resell.js`)

**`loadMyTickets()`**
Description: Fetches the current user's tickets and renders them. Filters out tickets already listed for resale.
```javascript
// Load user's tickets available to resell
async function loadMyTickets() {
    const session = getCurrentSession();
    const container = document.getElementById('myTicketsContainer');
    
    try {
        const response = await fetch(`http://localhost:3000/api/tickets/user/${session.user_id}`, {
            headers: { 'Authorization': `Bearer ${session.token}` }
        });
        
        const tickets = await response.json();
        
        // Filter only tickets not yet listed for resale
        const availableTickets = tickets.filter(ticket => !ticket.resale_listed);
        
        // ... Rendering logic ...
        
    } catch (error) {
        console.error('Error loading tickets:', error);
    }
}
```

**`confirmResell()`**
Description: Sends a request to list a ticket for resale.
```javascript
// Confirm resell listing
async function confirmResell() {
    const session = getCurrentSession();
    const price = parseFloat(document.getElementById('resellPrice').value);
    const notes = document.getElementById('resellNotes').value.trim();
    
    if (!price || price <= 0) { alert('Please enter a valid resale price'); return; }
    
    try {
        const response = await fetch('http://localhost:3000/api/tickets/resale', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.token}`
            },
            body: JSON.stringify({
                user_ticket_id: currentTicketId,
                resale_price: price,
                notes: notes
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to list ticket');
        }
        
        alert('✅ Ticket successfully listed for resale!');
        document.getElementById('resellModal').style.display = 'none';
        
        // Reload both sections
        loadMyTickets();
        loadResaleTickets();
        
    } catch (error) {
        console.error('Error listing ticket:', error);
        alert('❌ Failed to list ticket: ' + error.message);
    }
}
```

**`buyResaleTicket(resaleId)`**
Description: Handles the purchase of a resale ticket.
```javascript
// Buy resale ticket
async function buyResaleTicket(resaleId) {
    const session = getCurrentSession();
    
    if (!confirm('Are you sure you want to purchase this ticket?')) { return; }
    
    try {
        const response = await fetch(`http://localhost:3000/api/tickets/resale/${resaleId}/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.token}`
            },
            body: JSON.stringify({
                buyer_id: session.user_id
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to purchase ticket');
        }
        
        alert('✅ Ticket purchased successfully!');
        
        // Reload both sections
        loadMyTickets();
        loadResaleTickets();
        
    } catch (error) {
        console.error('Error purchasing ticket:', error);
        alert('❌ Failed to purchase ticket: ' + error.message);
    }
}
```
