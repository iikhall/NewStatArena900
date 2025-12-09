# StatArena - Critical Methods & Functions

## Overview
This document outlines the most important methods and functions that power the StatArena platform, organized by functionality area.

---

## 🔐 Authentication & Session Management

### Backend: `routes/auth.js`

#### `POST /api/auth/login`
**Purpose**: Authenticates users and generates JWT tokens  
**Location**: `backend/routes/auth.js`

**Complete Code**:
```javascript
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Step 1: Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Step 2: Find user in database
        const [users] = await pool.query(`
            SELECT * FROM users WHERE email = ? AND is_active = TRUE
        `, [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        const user = users[0];
        
        // Step 3: Validate password (currently bypassed for development)
        // const isPasswordValid = await bcrypt.compare(password, user.password);
        const isPasswordValid = true; // Temporarily bypass for testing
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Step 4: Update last login timestamp
        await pool.query(`
            UPDATE users SET last_login = NOW() WHERE user_id = ?
        `, [user.user_id]);
        
        // Step 5: Generate JWT token with 24-hour expiry
        const token = jwt.sign(
            { user_id: user.user_id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: '24h' }
        );
        
        // Step 6: Return success response
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});
```

**Explanation**:
1. **Input Validation**: Ensures both email and password are provided
2. **Database Query**: Uses parameterized query to prevent SQL injection; looks for active users only
3. **Password Check**: Currently disabled (returns true) but should use bcrypt.compare() in production
4. **Login Tracking**: Updates the last_login timestamp for analytics
5. **JWT Generation**: Creates signed token containing user_id, email, and role with 24-hour validity
6. **Response**: Returns token and sanitized user object (excludes password hash)

#### `POST /api/auth/register`
**Purpose**: Creates new user accounts  
**Location**: `backend/routes/auth.js`

**Complete Code**:
```javascript
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Step 1: Validate all required fields
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        // Step 2: Check if user already exists
        const [existingUsers] = await pool.query(`
            SELECT user_id FROM users WHERE email = ?
        `, [email]);
        
        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'User already exists' });
        }
        
        // Step 3: Hash password (currently bypassed for development)
        // const hashedPassword = await bcrypt.hash(password, 10);
        const hashedPassword = password; // For development
        
        // Step 4: Insert new user with default role='user'
        const [result] = await pool.query(`
            INSERT INTO users (name, email, password, role)
            VALUES (?, ?, ?, 'user')
        `, [name, email, hashedPassword]);
        
        // Step 5: Initialize user statistics entry
        await pool.query(`
            INSERT INTO user_statistics (user_id)
            VALUES (?)
        `, [result.insertId]);
        
        // Step 6: Return success with new user_id
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            user_id: result.insertId
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});
```

**Explanation**:
1. **Field Validation**: Ensures name, email, and password are all provided
2. **Duplicate Check**: Queries database to prevent duplicate email registrations (409 Conflict)
3. **Password Security**: Should use bcrypt with salt rounds=10; currently bypassed
4. **User Creation**: Inserts into users table with auto-generated user_id
5. **Stats Initialization**: Creates corresponding user_statistics row for tracking predictions
6. **Response**: Returns 201 Created with the new user_id for immediate login

### Frontend: `login/auth.js`

#### `handleSignIn(event)`
**Purpose**: Client-side login handler  
**Location**: `statarena/login/auth.js`

**Complete Code**:
```javascript
async function handleSignIn(event) {
    event.preventDefault();
    
    // Step 1: Get form values
    const email = document.getElementById('signinEmail').value;
    const password = document.getElementById('signinPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    try {
        // Step 2: Call backend login API
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        // Step 3: Check if login was successful
        if (response.ok && data.success) {
            // Step 4: Create session data object
            const sessionData = {
                token: data.token,
                user_id: data.user.user_id,
                name: data.user.name,
                email: data.user.email,
                role: data.user.role,
                loggedIn: true,
                loginTime: new Date().toISOString()
            };
            
            // Step 5: Store session based on "Remember Me" checkbox
            if (rememberMe) {
                localStorage.setItem('statarena_session', JSON.stringify(sessionData));
            } else {
                sessionStorage.setItem('statarena_session', JSON.stringify(sessionData));
            }
            
            // Step 6: Show success message
            alert('Login successful! Welcome back, ' + data.user.name + '!');
            
            // Step 7: Redirect to home page
            window.location.href = '../home/home.html';
        } else {
            // Handle login failure
            alert(data.error || 'Invalid email or password. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Cannot connect to server. Please make sure the backend is running on port 3000.');
    }
}
```

**Explanation**:
1. **Prevent Default**: Stops form from submitting traditionally (page reload)
2. **Form Data**: Extracts email, password, and remember-me preference from form inputs
3. **API Call**: POSTs credentials to backend authentication endpoint
4. **Session Object**: Constructs comprehensive session with token, user info, and timestamp
5. **Storage Strategy**: Uses localStorage for persistent login, sessionStorage for temporary
6. **User Feedback**: Shows welcome message with user's name
7. **Navigation**: Redirects to home page; browser will include session in subsequent requests

#### `handleSignUp(event)`
**Purpose**: Client-side registration handler  
**Key Logic**:
- Validates password match and strength
- Calls backend `/api/auth/register`
- Auto-logs in user after successful registration

### Shared: `assets/js/auth-check.js`

#### `getSessionData()`
**Purpose**: Retrieves current user session from storage  
**Location**: `statarena/assets/js/auth-check.js`

**Complete Code**:
```javascript
function getSessionData() {
    // Step 1: Try to get session from localStorage first (persistent)
    const session = localStorage.getItem('statarena_session') || 
                   sessionStorage.getItem('statarena_session'); // Then try sessionStorage (temporary)
    
    // Step 2: Parse JSON if session exists
    if (session) {
        try {
            return JSON.parse(session);
        } catch (e) {
            // Step 3: Handle corrupted session data
            return null;
        }
    }
    
    // Step 4: No session found
    return null;
}
```

**Explanation**:
1. **Storage Priority**: Checks localStorage first (remember me), then sessionStorage (session only)
2. **OR Operator**: Short-circuit evaluation; stops at first truthy value
3. **Safe Parsing**: Try-catch prevents crash from malformed JSON
4. **Null Return**: Consistent return type; caller can check truthiness
5. **Usage**: Every page calls this on load to determine auth status

---

#### `checkAdminAccess()`
**Purpose**: Enforces admin-only page access  
**Location**: `statarena/assets/js/auth-check.js`

**Complete Code**:
```javascript
function checkAdminAccess() {
    // Step 1: Check if current page is in admin directory
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('/admin/')) {
        // Step 2: Get user session data
        const sessionData = getSessionData();
        
        // Step 3: Validate admin access (triple check)
        if (!sessionData || !sessionData.loggedIn || sessionData.role !== 'admin' || sessionData.email !== 'k@k.com') {
            // Step 4: Block access and redirect
            alert('Access Denied! Only administrators can access this page.');
            window.location.href = '../home/home.html';
        }
    }
}
```

**Explanation**:
1. **Path Detection**: Checks URL pathname for '/admin/' substring
2. **Session Retrieval**: Calls getSessionData() to get user info
3. **Triple Verification**: Checks logged in AND role='admin' AND specific email
4. **Alert + Redirect**: Informs user before sending to home page
5. **Security Note**: Client-side only; backend must also validate
6. **Run Timing**: Called in DOMContentLoaded on every page load

---

#### `checkAuthAccess()`
**Purpose**: Protects pages requiring authentication  
**Location**: `statarena/assets/js/auth-check.js`

**Complete Code**:
```javascript
function checkAuthAccess() {
    // Step 1: Get current page path
    const currentPath = window.location.pathname;
    
    // Step 2: Define protected page patterns
    const protectedPages = ['/tickets/', '/predictions/', '/resell/'];
    
    // Step 3: Check if current page is protected
    const isProtected = protectedPages.some(page => currentPath.includes(page));
    
    if (isProtected) {
        // Step 4: Get session data
        const sessionData = getSessionData();
        
        // Step 5: Redirect if not logged in
        if (!sessionData || !sessionData.loggedIn) {
            alert('Please login to access this feature. Only registered users can book tickets, make predictions, and resell tickets.');
            window.location.href = '../login/login.html';
        }
    }
}
```

**Explanation**:
1. **Current Path**: Gets full pathname from browser window.location
2. **Protection List**: Array of directory patterns that require auth
3. **Pattern Matching**: Array.some() returns true if ANY pattern matches
4. **Conditional Check**: Only validates session for protected pages
5. **Session Validation**: Checks both existence and loggedIn flag
6. **User Feedback**: Explains why login is required before redirecting
7. **Auto-called**: DOMContentLoaded ensures runs before page interaction

---

## 🎯 Predictions System

### Backend: `routes/predictions.js`

#### `POST /api/predictions`
**Purpose**: Saves user predictions for matches  
**Location**: `backend/routes/predictions.js`

**Complete Code**:
```javascript
router.post('/', async (req, res) => {
    try {
        const { user_id, match_id, predicted_home_score, predicted_away_score } = req.body;
        
        // Step 1: Validate required input fields
        if (!user_id || !match_id || predicted_home_score === undefined || predicted_away_score === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Step 2: Determine predicted winner based on scores
        let predicted_winner = 'draw';
        if (predicted_home_score > predicted_away_score) {
            predicted_winner = 'home';
        } else if (predicted_away_score > predicted_home_score) {
            predicted_winner = 'away';
        }
        
        // Step 3: Insert prediction into database with default 10 points
        const [result] = await pool.query(`
            INSERT INTO predictions 
            (user_id, match_id, predicted_home_score, predicted_away_score, predicted_winner, points_earned)
            VALUES (?, ?, ?, ?, ?, 10)
        `, [user_id, match_id, predicted_home_score, predicted_away_score, predicted_winner]);
        
        // Step 4: Update user statistics atomically
        await pool.query(`
            UPDATE user_statistics 
            SET total_predictions = total_predictions + 1,
                total_points = total_points + 10
            WHERE user_id = ?
        `, [user_id]);
        
        // Step 5: Return success with prediction_id
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

**Explanation**:
1. **Input Validation**: Checks all required fields are present; scores can be 0 but not undefined
2. **Winner Logic**: Compares scores to determine outcome (home/away/draw)
3. **Prediction Insert**: Stores prediction with automatic points award (10 points baseline)
4. **Stats Update**: Increments user's prediction count and points total in separate query
5. **Response**: Returns 201 Created with new prediction_id for reference
6. **Atomicity Note**: Should ideally wrap both queries in transaction for consistency

#### `GET /api/predictions/user/:userId`
**Purpose**: Retrieves user's prediction history  
**Location**: `backend/routes/predictions.js`

**Complete Code**:
```javascript
router.get("/user/:userId", async function(req, res) {
    try {
        const { userId } = req.params;
        
        // Complex join query to get full prediction context
        const [predictions] = await pool.query(`
            SELECT 
                p.*,
                m.home_score AS actual_home_score,
                m.away_score AS actual_away_score,
                m.status AS match_status,
                hc.name AS home_team,
                hc.logo_url AS home_logo,
                ac.name AS away_team,
                ac.logo_url AS away_logo,
                l.name AS league_name
            FROM predictions p
            JOIN matches m ON p.match_id = m.match_id
            JOIN clubs hc ON m.home_club_id = hc.club_id
            JOIN clubs ac ON m.away_club_id = ac.club_id
            LEFT JOIN leagues l ON m.league_id = l.league_id
            WHERE p.user_id = ?
            ORDER BY p.created_at DESC
        `, [userId]);
        
        res.json(predictions);
    } catch (error) {
        console.error('Error fetching predictions:', error);
        res.status(500).json({ error: 'Failed to fetch predictions' });
    }
});
```

**Explanation**:
1. **URL Parameter**: Extracts userId from route parameter (/api/predictions/user/123)
2. **Multi-Table Join**: Combines 5 tables to get complete prediction context
3. **Match Details**: Includes actual scores and match status for comparison
4. **Team Info**: Joins clubs table twice (home and away) with aliases hc/ac
5. **League Badge**: Left join (optional) for league information
6. **Sort Order**: DESC by created_at shows most recent predictions first
7. **Response**: Returns array of enriched prediction objects with all display data

#### `GET /api/predictions/stats/:userId`
**Purpose**: Fetches user statistics for leaderboard  
**Returns**: `total_points`, `total_predictions`, `correct_predictions`, `accuracy_percentage`, `global_rank`

#### `GET /api/predictions/leaderboard/top`
**Purpose**: Global leaderboard of top predictors  
**Key Logic**:
- Queries `user_statistics` joined with `users`
- Orders by total_points DESC, accuracy_percentage DESC
- Limits to top 10 (configurable)

### Frontend: `predictions/predictions.js`

#### `submitPrediction(card)`
**Purpose**: Handles prediction card submission from UI  
**Location**: `statarena/predictions/predictions.js`

**Complete Code**:
```javascript
async function submitPrediction(card) {
    // Step 1: Extract UI elements from the card
    const selectedWinner = card.querySelector('.win-btn.selected');
    const scoreInputs = card.querySelectorAll('.score-input');
    const teams = card.querySelectorAll('.team-name');
    
    // Step 2: Validate winner selection
    if (!selectedWinner) {
        alert('Please select a winner!');
        return;
    }
    
    // Step 3: Get predicted scores
    const homeScore = parseInt(scoreInputs[0].value || 0);
    const awayScore = parseInt(scoreInputs[1].value || 0);
    const matchId = card.dataset.matchId; // Match ID from data attribute
    
    // Step 4: Validate match ID exists
    if (!matchId) {
        alert('Match ID is missing. Please refresh the page.');
        console.error('Match ID not found in card:', card);
        return;
    }
    
    // Step 5: Create prediction object
    const predictionData = {
        match_id: matchId,
        homeScore: homeScore,
        awayScore: awayScore
    };
    
    // Step 6: Save prediction to database via API
    const success = await saveUserPrediction(predictionData);
    
    // Step 7: Update UI on success
    if (success) {
        // Refresh predictions history and stats
        await displayRecentPredictions();
        await updateUserStats();
        
        // Mark card as completed
        card.classList.remove('active');
        card.classList.add('completed');
        
        // Show success notification
        showSuccessMessage('Prediction saved successfully!');
    }
}
```

**Explanation**:
1. **DOM Extraction**: Gets winner button, score inputs, and team names from card
2. **Validation**: Ensures user selected a winner before submission
3. **Score Parsing**: Converts input values to integers; defaults to 0 if empty
4. **Data Attribute**: Reads matchId from HTML data-match-id attribute
5. **Prediction Object**: Constructs minimal payload for API call
6. **API Call**: Delegates to saveUserPrediction() which handles fetch
7. **UI Updates**: Refreshes history list, stats counters, and marks card complete

#### `saveUserPrediction(predictionData)`
**Purpose**: Submits prediction to backend API  
**Location**: `statarena/predictions/predictions.js`

**Complete Code**:
```javascript
async function saveUserPrediction(predictionData) {
    // Step 1: Get current user session
    const session = getCurrentSession();
    if (!session) {
        alert('Please login to make predictions');
        return false;
    }
    
    console.log('Saving prediction:', predictionData);
    console.log('Session:', session);
    
    try {
        // Step 2: Construct API request body
        const requestBody = {
            user_id: session.user_id,
            match_id: predictionData.match_id,
            predicted_home_score: predictionData.homeScore,
            predicted_away_score: predictionData.awayScore
        };
        
        console.log('Request body:', requestBody);
        
        // Step 3: POST to predictions API
        const response = await fetch('http://localhost:3000/api/predictions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.token}`
            },
            body: JSON.stringify(requestBody)
        });
        
        // Step 4: Parse response
        const result = await response.json();
        console.log('API Response:', result);
        
        // Step 5: Check success and show appropriate message
        if (response.ok && result.success) {
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


**Explanation**:
1. **Session Check**: Verifies user is logged in; redirects if not
2. **Request Construction**: Combines session user_id with prediction data
3. **Authorization Header**: Includes JWT token for authenticated request
4. **Fetch API**: POSTs JSON payload to backend predictions endpoint
5. **Response Handling**: Checks both HTTP status and success flag in JSON
6. **Error Feedback**: Shows specific error messages from API or connection errors
7. **Boolean Return**: Simple true/false for caller to handle UI updates

---

#### `displayRecentPredictions()`
**Purpose**: Renders recent predictions list  
**Location**: `statarena/predictions/predictions.js`

**Complete Code**:
```javascript
async function displayRecentPredictions() {
    // Step 1: Fetch predictions from API
    const predictions = await loadUserPredictions();
    const recentList = document.querySelector('.recent-predictions-list');
    
    if (!recentList) return;
    
    // Step 2: Clear existing content
    recentList.innerHTML = '';
    
    // Step 3: Handle empty state
    if (predictions.length === 0) {
        recentList.innerHTML = `
            <div class="empty-predictions">
                <i class="fa-regular fa-futbol" style="font-size: 48px; color: #cbd5e1; margin-bottom: 15px;"></i>
                <p style="color: #94a3b8; text-align: center;">No predictions yet. Start predicting matches to see your history here!</p>
            </div>
        `;
        return;
    }
    
    // Step 4: Display up to 4 recent predictions
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
```

**Explanation**:
1. **Data Fetch**: Calls loadUserPredictions() which queries API
2. **DOM Selection**: Gets container element for predictions list
3. **Content Reset**: Clears innerHTML to prevent duplicates
4. **Empty State**: Shows friendly message with icon when no predictions exist
5. **Limit Display**: Slices array to show only 4 most recent (performance)
6. **Dynamic HTML**: Constructs prediction cards with date, league, teams, scores
7. **Status Badge**: Color-coded badges for pending/correct/incorrect predictions

---

## 🎫 Tickets & Purchase System

### Backend: `routes/tickets.js`

#### `POST /api/tickets/purchase`
**Purpose**: Records ticket purchases  
**Location**: `backend/routes/tickets.js`

**Complete Code**:
```javascript
router.post('/purchase', async (req, res) => {
    try {
        const { user_id, match_title, match_date, stadium, category, quantity, price, total } = req.body;
        
        // Step 1: Validate required fields
        if (!user_id || !match_title || !quantity || !price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Step 2: Insert purchase into user_tickets table
        const [result] = await pool.query(`
            INSERT INTO user_tickets (user_id, match_title, match_date, stadium, category, quantity, price, total, purchase_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [user_id, match_title, match_date, stadium, category, quantity, price, total]);
        
        // Step 3: Return success with ticket ID
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

**Explanation**:
1. **Destructuring**: Extracts all ticket purchase details from request body
2. **Validation**: Ensures minimum required fields (user_id, match_title, quantity, price)
3. **Database Insert**: Stores purchase with NOW() timestamp for purchase_date
4. **Auto-ID**: MySQL generates user_ticket_id automatically (AUTO_INCREMENT)
5. **Response**: Returns 201 Created with the new ticket ID for confirmation
6. **No Transaction**: Simple single-table insert doesn't require transaction

#### `GET /api/tickets/user/:userId`
**Purpose**: Retrieves user's purchased tickets  
**Key Logic**:
- Queries `user_tickets` for specific user
- Filters out resale-listed tickets (resale_listed = 0)
- Orders by purchase_date DESC

#### `GET /api/tickets/resale`
**Purpose**: Fetches all available resale tickets  
**Key Logic**:
- Joins `resale_tickets` with `user_tickets` and `users`
- Filters by status = 'available'
- Includes seller info and ticket details

#### `POST /api/tickets/resale`
**Purpose**: Lists ticket for resale  
**Location**: `backend/routes/tickets.js`

**Complete Code**:
```javascript
router.post('/resale', async (req, res) => {
    // Step 1: Get database connection for transaction
    const connection = await pool.getConnection();
    
    try {
        const { user_ticket_id, resale_price, notes } = req.body;
        
        // Step 2: Validate required fields
        if (!user_ticket_id || !resale_price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Step 3: Start transaction for atomic operation
        await connection.beginTransaction();
        
        // Step 4: Get seller_id from the ticket ownership
        const [tickets] = await connection.query(
            'SELECT user_id FROM user_tickets WHERE user_ticket_id = ?',
            [user_ticket_id]
        );
        
        if (tickets.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        const seller_id = tickets[0].user_id;
        
        // Step 5: Create resale listing
        const [result] = await connection.query(`
            INSERT INTO resale_tickets (user_ticket_id, seller_id, resale_price, notes, listed_date, status)
            VALUES (?, ?, ?, ?, NOW(), 'available')
        `, [user_ticket_id, seller_id, resale_price, notes || null]);
        
        // Step 6: Mark original ticket as listed for resale
        await connection.query(
            'UPDATE user_tickets SET resale_listed = 1 WHERE user_ticket_id = ?',
            [user_ticket_id]
        );
        
        // Step 7: Commit transaction
        await connection.commit();
        
        // Step 8: Return success
        res.status(201).json({ 
            success: true, 
            message: 'Ticket listed for resale successfully',
            resale_id: result.insertId 
        });
    } catch (error) {
        // Step 9: Rollback on any error
        await connection.rollback();
        console.error('Error listing ticket for resale:', error);
        res.status(500).json({ error: 'Failed to list ticket for resale' });
    } finally {
        // Step 10: Always release connection back to pool
        connection.release();
    }
});
```

**Explanation**:
1. **Connection Management**: Gets dedicated connection for transaction isolation
2. **Input Validation**: Checks required fields; notes are optional
3. **Transaction Start**: BEGIN ensures all-or-nothing execution
4. **Ownership Lookup**: Queries user_tickets to get seller_id (verifies existence)
5. **Resale Creation**: Inserts new resale_tickets record with 'available' status
6. **Flag Update**: Marks original ticket as resale_listed=1 to hide from "My Tickets"
7. **Commit**: If all steps succeed, makes changes permanent
8. **Response**: Returns 201 with new resale_id for tracking
9. **Rollback**: Any error undoes all changes; maintains data consistency
10. **Cleanup**: Connection.release() returns connection to pool (critical for performance)

#### `POST /api/tickets/resale/:resaleId/purchase`
**Purpose**: Purchases resale ticket from marketplace  
**Location**: `backend/routes/tickets.js`

**Complete Code**:
```javascript
router.post('/resale/:resaleId/purchase', async (req, res) => {
    // Step 1: Get connection for transaction
    const connection = await pool.getConnection();
    
    try {
        const { resaleId } = req.params;
        const { buyer_id } = req.body;
        
        // Step 2: Validate buyer_id provided
        if (!buyer_id) {
            return res.status(400).json({ error: 'Buyer ID is required' });
        }
        
        // Step 3: Start transaction
        await connection.beginTransaction();
        
        // Step 4: Get resale ticket with all details (verify available)
        const [resaleTickets] = await connection.query(`
            SELECT r.*, ut.* 
            FROM resale_tickets r
            JOIN user_tickets ut ON r.user_ticket_id = ut.user_ticket_id
            WHERE r.resale_id = ? AND r.status = 'available'
        `, [resaleId]);
        
        // Step 5: Check if ticket exists and is available
        if (resaleTickets.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Resale ticket not found or already sold' });
        }
        
        const ticket = resaleTickets[0];
        
        // Step 6: Create new ticket for buyer with resale price
        await connection.query(`
            INSERT INTO user_tickets (user_id, match_title, match_date, stadium, category, quantity, price, total, purchase_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [buyer_id, ticket.match_title, ticket.match_date, ticket.stadium, ticket.category, ticket.quantity, ticket.resale_price, ticket.resale_price]);
        
        // Step 7: Update resale listing to 'sold'
        await connection.query(
            'UPDATE resale_tickets SET status = "sold", buyer_id = ?, sold_date = NOW() WHERE resale_id = ?',
            [buyer_id, resaleId]
        );
        
        // Step 8: Commit transaction
        await connection.commit();
        
        // Step 9: Return success
        res.json({ 
            success: true, 
            message: 'Resale ticket purchased successfully'
        });
    } catch (error) {
        // Step 10: Rollback on error
        await connection.rollback();
        console.error('Error purchasing resale ticket:', error);
        res.status(500).json({ error: 'Failed to purchase resale ticket' });
    } finally {
        // Step 11: Release connection
        connection.release();
    }
});
```

**Explanation**:
1. **Connection Acquisition**: Gets dedicated connection for transaction
2. **Route Parameter**: Extracts resaleId from URL path (/resale/123/purchase)
3. **Buyer Validation**: Ensures buyer_id in request body
4. **Transaction Start**: BEGIN for atomic multi-step operation
5. **Join Query**: Gets resale listing with original ticket details; filters by status='available'
6. **Availability Check**: Returns 404 if ticket doesn't exist or already sold
7. **Ownership Transfer**: Creates new user_tickets entry for buyer with resale_price
8. **Listing Closure**: Updates resale_tickets to 'sold' status, records buyer_id and timestamp
9. **Commit**: Makes both changes permanent
10. **Rollback**: Undoes everything if any step fails (preserves consistency)
11. **Cleanup**: Returns connection to pool (prevent leaks)

### Frontend: `tickets/step2.js`

#### `setupCustomSelects()`
**Purpose**: Initializes dropdown menus for category and quantity  
**Key Logic**:
- Clones elements to remove old listeners
- Handles dropdown open/close
- Updates order summary on selection

#### `updateOrderSummary()`
**Purpose**: Calculates and displays ticket pricing  
**Location**: `statarena/tickets/step2.js`

**Complete Code**:
```javascript
function updateOrderSummary() {
    // Step 1: Get dropdown selections
    const categorySelect = document.getElementById('categorySelect');
    const quantitySelect = document.getElementById('quantitySelect');
    const matchData = JSON.parse(localStorage.getItem('selectedMatch'));
    
    // Step 2: Extract selected values from data attributes
    const categoryValue = categorySelect?.getAttribute('data-selected');
    const quantityValue = quantitySelect?.getAttribute('data-selected');
    
    // Step 3: Check if both selections made
    if (categoryValue && quantityValue && matchData) {
        const categoryText = categorySelect.querySelector('.select-trigger span').textContent;
        const quantity = parseInt(quantityValue);
        
        // Step 4: Define pricing structure by category
        const categoryPrices = {
            'cat1-first': 50,
            'cat1-second': 50,
            'cat2-first': 60,
            'cat2-second': 60,
            'cat3': 70,
            'cat4': 80,
            'cat5': 100
        };
        
        // Step 5: Calculate prices
        const pricePerTicket = categoryPrices[categoryValue] || 50;
        const subtotal = pricePerTicket * quantity;
        const serviceFee = subtotal * 0.08; // 8% service fee
        const total = subtotal + serviceFee;
        
        // Step 6: Update summary display elements
        const summaryRows = document.querySelectorAll('.summary-row .summary-value');
        if (summaryRows.length >= 5) {
            summaryRows[0].textContent = categoryText;
            summaryRows[1].textContent = `${quantity} ticket${quantity > 1 ? 's' : ''}`;
            summaryRows[2].textContent = `${pricePerTicket}.00 SAR`;
            summaryRows[3].textContent = `${subtotal}.00 SAR`;
            summaryRows[4].textContent = `${serviceFee.toFixed(2)} SAR`;
            
            // Update total in separate element
            const totalElement = document.querySelector('.summary-row.total .summary-value');
            if (totalElement) {
                totalElement.textContent = `${total.toFixed(2)} SAR`;
            }
        }
        
        // Step 7: Show order summary section
        const orderSummary = document.querySelector('.order-summary');
        if (orderSummary) {
            orderSummary.style.display = 'block';
        }
    }
}
```

**Explanation**:
1. **Element Selection**: Gets both dropdown menus and stored match data
2. **Value Extraction**: Reads data-selected attributes set by dropdown click handlers
3. **Validation**: Only proceeds if both category and quantity selected
4. **Price Mapping**: Hardcoded category-to-price map (could come from API)
5. **Calculations**: 
   - Base: price × quantity
   - Fee: 8% of subtotal
   - Total: subtotal + fee
6. **DOM Updates**: Sets textContent for all summary fields
7. **Visibility**: Shows hidden summary section once calculations complete

### Frontend: `tickets/step3.js`

#### `completeBooking()`
**Purpose**: Finalizes ticket purchase  
**Key Logic**:
- Retrieves match and ticket data from localStorage
- Gets session user_id
- POSTs to `/api/tickets/purchase`
- Shows confirmation message on success

### Frontend: `resell/resell.js`

#### `loadMyTickets()`
**Purpose**: Displays user's tickets available for resale  
**Key Logic**:
- Fetches from `/api/tickets/user/:userId`
- Filters tickets not yet listed (resale_listed = 0)
- Renders ticket cards with "List for Resale" buttons

#### `confirmResell()`
**Purpose**: Lists ticket on resale marketplace  
**Key Logic**:
- Validates resale price
- POSTs to `/api/tickets/resale`
- Reloads both my-tickets and resale-tickets sections

#### `buyResaleTicket(resaleId)`
**Purpose**: Purchases from resale marketplace  
**Key Logic**:
- Confirms with user
- POSTs to `/api/tickets/resale/:resaleId/purchase` with buyer_id
- Refreshes marketplace display

---

## 👤 User Profile & Statistics

### Backend: `routes/users.js`

#### `GET /api/users/:id`
**Purpose**: Retrieves complete user profile with statistics  
**Key Logic**:
- Queries `users` table (excludes password)
- Left joins `user_statistics`
- Returns combined user + stats object

**Response Structure**:
```json
{
  "user_id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "created_at": "2025-12-01T...",
  "last_login": "2025-12-09T...",
  "statistics": {
    "total_points": 150,
    "total_predictions": 15,
    "correct_predictions": 8,
    "accuracy_percentage": 53.33,
    "global_rank": 5
  }
}
```

#### `PUT /api/users/:id`
**Purpose**: Updates user profile information  
**Key Logic**:
- Validates name is provided
- Updates `users` table with new name/email
- Sets updated_at timestamp
- Returns updated user object

### Frontend: `profile/profile.js`

#### `loadUserInfoFromAPI(sessionData)`
**Purpose**: Fetches and displays user profile data  
**Key Logic**:
- GETs from `/api/users/:userId`
- Updates profile header (name, email, badge)
- Populates account information section
- Stores userData globally for later use

#### `updateStats()`
**Purpose**: Aggregates and displays user statistics  
**Key Logic**:
- Fetches user data with statistics
- Counts predictions from API
- Counts favorites from localStorage
- Updates stat cards: total_points, total_predictions, total_favorites

#### `saveProfileChanges()`
**Purpose**: Saves edited profile information  
**Key Logic**:
- Validates name not empty
- PUTs to `/api/users/:userId` with new name
- Updates session storage
- Refreshes display and shows success message

---

## 🛡️ Admin Dashboard

### Backend Routes Used by Admin

#### `GET /api/predictions/all` (from `routes/predictions.js`)
**Purpose**: Fetches all predictions for admin review  
**Key Logic**:
- Joins predictions with users, matches, clubs, leagues
- Returns complete prediction records with user names and match details
- Orders by creation date DESC

#### `DELETE /api/predictions/:id`
**Purpose**: Removes prediction (admin moderation)  
**Key Logic**:
- Deletes from `predictions` table by prediction_id
- Returns success confirmation

#### `POST /api/tickets`, `PUT /api/tickets/:id`, `DELETE /api/tickets/:id`
**Purpose**: Full CRUD for ticket catalog management  
**Key Logic**:
- POST: Creates new ticket category for a match
- PUT: Updates pricing or availability
- DELETE: Removes ticket offering

### Frontend: `admin/admin.js`

#### `loadMatches()`
**Purpose**: Displays all matches in admin table  
**Key Logic**:
- Fetches from `/api/matches`
- Renders table rows with match details
- Provides delete buttons for each match

#### `addMatch(event)`
**Purpose**: Creates new match in system  
**Key Logic**:
- Validates home ≠ away team
- Constructs match object with club IDs, league, date, venue
- POSTs to `/api/matches`
- Refreshes matches table

#### `loadPredictions()`
**Purpose**: Displays all user predictions for moderation  
**Key Logic**:
- Fetches from `/api/predictions/all`
- Renders table showing: user, match, predicted score, status, points
- Limits display to 50 most recent
- Provides delete buttons

#### `addTicket(event)`
**Purpose**: Adds new ticket category to match  
**Key Logic**:
- Constructs ticket object with match_id, section, price, quantity
- POSTs to `/api/tickets`
- Refreshes tickets table

#### `updateStats()`
**Purpose**: Updates admin dashboard statistics  
**Key Logic**:
- Counts total users from localStorage
- Counts admins (role === 'admin' or email === 'k@k.com')
- Calculates active users (currently 1 if logged in)
- Calculates new users this week
- Shows storage used and last login time

---

## 🌐 Shared Utilities

### `assets/js/api.js`

#### `getAuthHeaders()`
**Purpose**: Constructs HTTP headers with JWT token  
**Returns**: Headers object with Authorization: Bearer token  
**Usage**: Every authenticated API call

#### `getCurrentUser()`
**Purpose**: Gets current user from session storage  
**Returns**: User object or null  
**Usage**: Throughout frontend to access user data

#### `API.savePrediction()`, `API.getUserProfile()`, etc.
**Purpose**: Centralized API client methods  
**Benefits**: 
- Consistent error handling
- Automatic token injection
- Single source of truth for endpoints

### `assets/js/auth-check.js`

#### `checkAuthAccess()`
**Purpose**: Protects pages requiring authentication  
**Key Logic**:
- Checks if current path includes `/tickets/`, `/predictions/`, `/resell/`
- Validates session exists and user is logged in
- Redirects to login if unauthorized

### `assets/js/favorites.js`

#### `toggleFavoritePlayer(playerName)`, `toggleFavoriteClub(clubName)`
**Purpose**: Adds/removes favorites  
**Key Logic**:
- Checks user is logged in
- Retrieves favorites from localStorage (per-user)
- Toggles item in array
- Saves updated favorites
- Shows confirmation message

---

## 🔄 Data Synchronization Patterns

### Session-to-API Flow
1. User logs in → JWT stored in localStorage/sessionStorage
2. Every API call includes JWT via `getAuthHeaders()`
3. Backend validates JWT in middleware
4. Returns user-specific data

### Prediction Submission Flow
1. Frontend: User selects winner + scores
2. Frontend: `submitPrediction()` validates and calls API
3. Backend: `POST /api/predictions` inserts record
4. Backend: Updates `user_statistics` atomically
5. Frontend: Refreshes predictions history and stats display

### Ticket Purchase & Resale Flow
1. **Purchase**: Step1 (select match) → Step2 (select tickets) → Step3 (complete)
2. **Storage**: Match/ticket data passed via localStorage between steps
3. **Persist**: Final step POSTs to `/api/tickets/purchase`
4. **Resale List**: User calls `POST /api/tickets/resale` (transaction)
5. **Resale Buy**: Buyer calls `POST /api/tickets/resale/:id/purchase` (transaction)
6. **Result**: Ownership transferred, original listing closed

---

## 📊 Database Critical Operations

### Joins (Most Complex)

#### Predictions with Match Details
```sql
SELECT p.*, u.name AS user_name, hc.name AS home_team, 
       ac.name AS away_team, l.name AS league_name
FROM predictions p
JOIN users u ON p.user_id = u.user_id
JOIN matches m ON p.match_id = m.match_id
JOIN clubs hc ON m.home_club_id = hc.club_id
JOIN clubs ac ON m.away_club_id = ac.club_id
LEFT JOIN leagues l ON m.league_id = l.league_id
```

#### Resale Tickets with Details
```sql
SELECT r.*, ut.*, u.username as seller_name
FROM resale_tickets r
JOIN user_tickets ut ON r.user_ticket_id = ut.user_ticket_id
JOIN users u ON r.seller_id = u.user_id
WHERE r.status = 'available'
```

### Transactions (Atomic Operations)

#### Resale Listing Transaction
```sql
BEGIN;
  SELECT user_id FROM user_tickets WHERE user_ticket_id = ?;
  INSERT INTO resale_tickets (...);
  UPDATE user_tickets SET resale_listed = 1 WHERE user_ticket_id = ?;
COMMIT;
```

#### Resale Purchase Transaction
```sql
BEGIN;
  SELECT * FROM resale_tickets WHERE resale_id = ? AND status = 'available';
  INSERT INTO user_tickets (buyer details);
  UPDATE resale_tickets SET status = 'sold', buyer_id = ?, sold_date = NOW();
COMMIT;
```

---

## 🚨 Critical Error Handling

### Authentication Failures
- **Login**: Returns 401 with error message
- **Session Expired**: JWT verification fails → 403 response
- **Frontend**: Catches and redirects to login page

### API Connection Failures
- **Pattern**: Try-catch blocks with user-friendly alerts
- **Message**: "Cannot connect to server. Please make sure the backend is running on port 3000."

### Transaction Rollbacks
- **Resale Operations**: Any failure rolls back entire transaction
- **Ensures**: Database consistency (no orphaned records)

---

## 🎯 Performance Considerations

### Database Indexes
- `idx_predictions_user` on `predictions(user_id)` - Fast user history lookup
- `idx_predictions_match` on `predictions(match_id)` - Fast match predictions
- `idx_user_tickets_user` on `user_tickets(user_id)` - Fast ticket queries
- `idx_resale_status` on `resale_tickets(status)` - Fast marketplace filtering

### Caching Strategies
- **Session Data**: Stored in localStorage/sessionStorage (no repeated API calls)
- **Favorites**: Cached per-user in localStorage
- **Static Data**: League tables, clubs rendered from hardcoded arrays

### API Query Optimization
- **Leaderboard**: LIMIT clause to return only top N
- **Predictions**: ORDER BY created_at DESC for most recent first
- **Tickets**: Filter resale_listed = 0 to exclude sold items

---

## 🔑 Key Takeaways

### Most Critical Methods (Priority Order)
1. **Authentication**: `POST /api/auth/login`, `getSessionData()` - Foundation of all user features
2. **Predictions**: `POST /api/predictions`, `submitPrediction()` - Core engagement feature
3. **Tickets**: `POST /api/tickets/purchase`, `completeBooking()` - Revenue-generating flow
4. **Resale**: Transaction methods - Complex but critical for marketplace
5. **Profile**: `GET /api/users/:id`, `updateStats()` - User retention and engagement

### Security Critical Points
- JWT validation in `middleware/auth.js`
- Admin role checks in `auth-check.js`
- Password hashing (currently disabled - **must re-enable**)
- SQL injection prevention via parameterized queries

### Business Logic Critical Points
- Points calculation in predictions
- Service fee calculation in ticket pricing
- Transaction integrity in resale operations
- Session management across storage types

---

**Last Updated**: December 9, 2025  
**Version**: 1.0  
**Maintained By**: Development Team
