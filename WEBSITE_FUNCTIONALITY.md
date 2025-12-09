# StatArena - Website Functionality Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [User Features](#user-features)
4. [Admin Features](#admin-features)
5. [API Endpoints](#api-endpoints)
6. [Database Structure](#database-structure)
7. [Authentication System](#authentication-system)
8. [Current Status](#current-status)

---

## 🎯 Overview

**StatArena** is a comprehensive football (soccer) statistics and ticketing platform that allows users to:
- View match statistics and scores
- Make match predictions and earn points
- Purchase tickets for upcoming matches
- Resell tickets through a marketplace
- View league standings and club/player information
- Access an admin dashboard for content management

### Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js (v22.19.0) with Express.js
- **Database**: MySQL (statarena database)
- **Authentication**: JWT (JSON Web Tokens)
- **API Architecture**: RESTful API

---

## 🏗️ System Architecture

### Backend Server
- **Location**: `backend/server.js`
- **Port**: 3000
- **Base URL**: `http://localhost:3000`

### Directory Structure
```
statarena/               # Frontend files
├── home/               # Landing page
├── login/              # Authentication
├── matches/            # Match listings and details
├── clubs/              # Club information
├── players/            # Player statistics
├── tables/             # League standings
├── predictions/        # Match predictions
├── tickets/            # Ticket booking system
├── resell/             # Ticket resale marketplace
├── admin/              # Admin dashboard
└── assets/             # Shared CSS, JS, images

backend/                # Backend API
├── routes/             # API route handlers
├── config/             # Database configuration
└── middleware/         # Authentication middleware

database/               # Database scripts
└── statarena_database.sql
```

---

## 👥 User Features

### 1. **Authentication System**
- **Login**: Email/password authentication
- **JWT Tokens**: 24-hour session tokens
- **User Roles**: Regular users and administrators
- **Auto-redirect**: Unauthenticated users redirected to login

**Pages**: `login/login.html`, `login/auth.js`

**API Endpoints**:
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - New user registration

---

### 2. **Home Dashboard**
**Location**: `statarena/home/home.html`

**Features**:
- Welcome banner with user name
- Quick access buttons to book tickets and make predictions
- Stats banner showing:
  - Total user points
  - Predictions made
  - Success rate percentage
  - Global rank position
- Featured matches carousel
- Recent activity feed
- Navigation to all platform sections

---

### 3. **Matches**
**Location**: `statarena/matches/matches.html`

**Features**:
- **Live Match Tracking**: Real-time scores and match minutes
- **Match Status**: Upcoming, Live, Finished
- **Detailed Match View**: Click any match for full statistics
- **League Filtering**: Filter by competition (Premier League, La Liga, etc.)
- **Match Information**:
  - Team logos and names
  - Current scores
  - Match venue
  - Match date/time
  - League badge

**API Integration**:
- `GET /api/matches` - Fetch all matches
- `GET /api/matches/:id` - Get match details
- Joins with clubs, leagues tables for complete data

---

### 4. **Predictions System**
**Location**: `statarena/predictions/predictions.html`

**Features**:
- **Match Prediction Cards**: Select winner (Home, Draw, Away)
- **Score Prediction**: Enter predicted scores for both teams
- **Points System**: Earn points for correct predictions
- **User Statistics**:
  - Total points earned
  - Predictions submitted
  - Accuracy percentage
  - Global leaderboard rank
- **Recent Predictions History**: View past predictions with results
- **Community Leaderboard**: Top 10 users by points

**How Predictions Work**:
1. User selects a match outcome (Home win / Draw / Away win)
2. User enters predicted scores
3. Prediction saved to database via API
4. When match finishes, points awarded based on accuracy
5. Stats updated in real-time

**API Integration**:
- `GET /api/predictions/user/:userId` - User's predictions
- `POST /api/predictions` - Submit new prediction
- Tracks: match_id, user_id, predicted_winner, home_score, away_score, points

---

### 5. **Ticket Booking System**
**Location**: `statarena/tickets/` (3-step process)

**Step 1 - Select Match** (`tickets.html`):
- Browse upcoming matches
- Filter by league
- View match details (teams, date, venue)
- Click to proceed to ticket selection

**Step 2 - Choose Tickets** (`step2.html`):
- Select ticket category (VIP, Premium, Standard)
- View pricing per category
- Choose quantity
- See availability status
- Calculate total price

**Step 3 - Checkout** (`step3.html`):
- Review order summary
- Enter payment details
- Complete purchase
- Receive confirmation

**API Integration**:
- `GET /api/matches` - Load available matches
- `GET /api/tickets/match/:matchId` - Get ticket options
- `POST /api/tickets/purchase` - Process purchase
- Stores in user_tickets table with purchase_date, quantity, total_price

---

### 6. **Resale Marketplace**
**Location**: `statarena/resell/resell.html`

**Features**:
- **List Tickets for Resale**: Users can sell unwanted tickets
- **Browse Available Tickets**: View all tickets listed for resale
- **Purchase Resold Tickets**: Buy from other users
- **My Listings Management**: Remove or edit your listings
- **Pricing Control**: Set your own resale price

**How It Works**:
1. User purchases ticket through normal flow
2. User can list ticket for resale with custom price
3. Other users browse resale marketplace
4. Purchase transfers ticket ownership
5. Original ticket deleted from seller, new ticket created for buyer

**Database Tables**:
- `user_tickets` - Tracks ticket ownership
- Future: Simplified resale status tracking

---

### 7. **League Tables & Standings**
**Location**: `statarena/tables/tables.html`

**Features**:
- **League Selection**: Tabs for different competitions
  - Premier League
  - La Liga
  - Ligue 1
  - Bundesliga
  - Serie A
- **Full Standings Table**:
  - Position (#)
  - Club name and logo
  - Matches played
  - Wins, Draws, Losses
  - Goals For / Goals Against
  - Goal Difference
  - Total Points
- **Visual Indicators**: 
  - Champions League spots (green)
  - Europa League spots (blue)
  - Relegation zone (red)

**API Integration**:
- `GET /api/leagues/:id/standings` - Fetch league table
- Real-time data from `league_standings` table

---

### 8. **Clubs Directory**
**Location**: `statarena/clubs/clubs.html`

**Features**:
- Grid view of all clubs
- Club logos and names
- Search/filter functionality
- Click for detailed club information
- Stadium details
- Squad overview

**API Integration**:
- `GET /api/clubs` - All clubs
- `GET /api/clubs/:id` - Specific club details

---

### 9. **Players Database**
**Location**: `statarena/players/players.html`

**Features**:
- Player cards with photos
- Player statistics:
  - Name, position, nationality
  - Age, height, shirt number
  - Club affiliation
  - Goals, assists, appearances
- Filter by position, club, league
- Search by name

**API Integration**:
- `GET /api/players` - All players
- `GET /api/players/club/:clubId` - Players by club
- `GET /api/players/:id` - Individual player stats

---

## 🛡️ Admin Features

### Admin Dashboard
**Location**: `statarena/admin/admin.html`

**Access Control**: 
- Only accessible to users with `role = 'admin'`
- Admin badge displayed in UI
- JWT token validates admin status

### Admin Statistics Overview
- Total users count
- Total administrators
- Active users
- System health metrics

### Admin Management Tabs

#### 1. **Users Management**
- View all registered users
- User details: name, email, role, registration date
- Edit user information
- Delete user accounts
- Promote/demote admin privileges
- View user activity logs

#### 2. **Matches Management**
**Create New Match**:
- Select home club (dropdown from database)
- Select away club (dropdown from database)
- Choose league
- Set match date and time
- Set venue
- Initial status: "Scheduled"

**Edit Matches**:
- Update match scores
- Change match status (Scheduled → Live → Finished)
- Update match minute
- Modify venue or date

**Delete Matches**:
- Remove matches from system
- Cascades to related predictions and tickets

**API Endpoints**:
- `POST /api/matches` - Create match
- `PUT /api/matches/:id` - Update scores/status
- `DELETE /api/matches/:id` - Remove match

#### 3. **Predictions Management**
- View all user predictions
- See prediction details:
  - User name and email
  - Match details
  - Predicted outcome and scores
  - Points awarded
  - Submission timestamp
- Delete invalid predictions
- Manually award/adjust points

**API Endpoints**:
- `GET /api/predictions/all` - All predictions (admin only)
- `DELETE /api/predictions/:id` - Remove prediction

#### 4. **Tickets Management**
**Create New Tickets**:
- Select match
- Create ticket categories (VIP, Premium, Standard)
- Set pricing per category
- Set available quantity
- Add seat information

**Edit Tickets**:
- Update pricing
- Change availability
- Modify seat allocations

**Delete Tickets**:
- Remove ticket offerings
- View purchase history before deletion

**API Endpoints**:
- `GET /api/tickets` - All tickets
- `POST /api/tickets` - Create ticket
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Remove ticket

---

## 🔌 API Endpoints

### Base URL: `http://localhost:3000/api`

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | User login | No |
| POST | `/auth/register` | Create account | No |

### Matches
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/matches` | Get all matches | No |
| GET | `/matches/:id` | Get match details | No |
| POST | `/matches` | Create match | Admin only* |
| PUT | `/matches/:id` | Update match | Admin only* |
| DELETE | `/matches/:id` | Delete match | Admin only* |

### Predictions
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/predictions/user/:userId` | User's predictions | Yes |
| GET | `/predictions/all` | All predictions | Admin only* |
| POST | `/predictions` | Submit prediction | Yes |
| DELETE | `/predictions/:id` | Delete prediction | Admin only* |

### Tickets
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tickets` | All tickets | No |
| GET | `/tickets/match/:matchId` | Match tickets | No |
| POST | `/tickets` | Create ticket | Admin only* |
| PUT | `/tickets/:id` | Update ticket | Admin only* |
| DELETE | `/tickets/:id` | Delete ticket | Admin only* |

### Users
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/:id` | Get user profile + stats | Yes |
| PUT | `/users/:id` | Update profile | Yes |

### Clubs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/clubs` | All clubs | No |
| GET | `/clubs/:id` | Club details | No |

### Players
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/players` | All players | No |
| GET | `/players/club/:clubId` | Club players | No |
| GET | `/players/:id` | Player details | No |

### Leagues
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/leagues` | All leagues | No |
| GET | `/leagues/:id/standings` | League table | No |

### Health Check
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Server status | No |

**Note**: *Admin authentication is implemented in middleware but temporarily disabled for testing. Will be re-enabled in production.

---

## 🗄️ Database Structure

### Core Tables

#### `users`
- `user_id` (PK)
- `email` (unique)
- `password` (hashed with bcrypt)
- `name`
- `role` (enum: 'user', 'admin')
- `is_active` (boolean)
- `created_at`, `last_login`

#### `clubs`
- `club_id` (PK)
- `name`
- `logo_url`
- `country`
- `stadium`
- `founded_year`
- `league_id` (FK)

#### `matches`
- `match_id` (PK)
- `home_club_id` (FK → clubs)
- `away_club_id` (FK → clubs)
- `league_id` (FK → leagues)
- `match_date`
- `venue`
- `status` (enum: 'Scheduled', 'Live', 'Finished')
- `home_score`, `away_score`
- `match_minute`

#### `predictions`
- `prediction_id` (PK)
- `user_id` (FK → users)
- `match_id` (FK → matches)
- `predicted_winner` (enum: 'home', 'draw', 'away')
- `home_score`, `away_score`
- `points` (awarded after match)
- `created_at`

#### `tickets`
- `ticket_id` (PK)
- `match_id` (FK → matches)
- `category` (enum: 'VIP', 'Premium', 'Standard')
- `price`
- `available_quantity`
- `total_quantity`
- `section`, `seat_info`

#### `user_tickets`
- `user_ticket_id` (PK)
- `user_id` (FK → users)
- `ticket_id` (FK → tickets)
- `purchase_date`
- `quantity`
- `total_price`
- `status` (enum: 'active', 'used', 'cancelled')

#### `leagues`
- `league_id` (PK)
- `name`
- `country`
- `logo_url`
- `season`

#### `league_standings`
- `standing_id` (PK)
- `league_id` (FK → leagues)
- `club_id` (FK → clubs)
- `position`
- `played`, `won`, `drawn`, `lost`
- `goals_for`, `goals_against`, `goal_difference`
- `points`

#### `players`
- `player_id` (PK)
- `name`
- `club_id` (FK → clubs)
- `position`
- `nationality`
- `age`, `height`, `shirt_number`
- `goals`, `assists`, `appearances`

#### `user_statistics`
- `stat_id` (PK)
- `user_id` (FK → users)
- `total_points`
- `predictions_made`
- `correct_predictions`
- `accuracy_rate`
- `global_rank`

### Database Relationships
- One-to-Many: Users → Predictions, Users → User_Tickets
- Many-to-One: Matches → Clubs (home & away), Predictions → Matches
- One-to-Many: Matches → Tickets, Matches → Predictions
- Many-to-Many: Users ↔ Tickets (through user_tickets)

---

## 🔐 Authentication System

### JWT Implementation
**Location**: `backend/routes/auth.js`, `backend/middleware/auth.js`

### Token Structure
```javascript
{
  user_id: 123,
  email: "user@example.com",
  role: "user" | "admin",
  exp: 1234567890 // 24 hours from issue
}
```

### Authentication Flow
1. User submits email/password to `/api/auth/login`
2. Server validates credentials against database
3. JWT token generated with user info
4. Token returned to client
5. Client stores token (localStorage)
6. Client includes token in API requests: `Authorization: Bearer <token>`
7. Server validates token via middleware
8. Request processed if valid

### Protected Routes
- Currently: Auth middleware exists but disabled for testing
- Production: Will require valid JWT for:
  - User profile access
  - Prediction submissions
  - Ticket purchases
  - Admin operations

### Admin Verification
```javascript
// Middleware checks role in JWT payload
if (req.user.role !== 'admin') {
  return res.status(403).json({ error: 'Admin access required' });
}
```

---

## 📊 Current Status

### ✅ Fully Functional Features
1. **Authentication System**
   - Login/registration working
   - JWT token generation
   - (Auth checks temporarily disabled)

2. **Match Management**
   - Database integration complete
   - API endpoints functional
   - Admin CRUD operations working

3. **Predictions System**
   - Submission working (after syntax fix)
   - Database storage functional
   - Points tracking implemented
   - User history display working

4. **Ticket Booking**
   - 3-step booking flow complete
   - Database integration working
   - Purchase tracking functional

5. **League Tables**
   - Migrated from hardcoded to database
   - API integration complete
   - Real-time standings display

6. **Admin Dashboard**
   - Full CRUD interface built
   - User, match, prediction, ticket management
   - Statistics dashboard working

7. **API Server**
   - All endpoints registered
   - Database connections stable
   - Error handling implemented

### 🔄 Partially Complete / In Progress
1. **Resale Marketplace**
   - Basic structure exists
   - Needs database migration completion
   - API endpoints need finalization
   - Frontend needs sync with backend

2. **Profile Page**
   - Basic display working
   - Needs full API integration
   - Statistics loading needs enhancement

### ⚠️ Known Issues & Limitations
1. **Authentication**: Currently disabled on admin routes for testing
2. **Password Hashing**: Temporarily bypassed (needs bcrypt re-enable)
3. **Resale System**: Not fully integrated with database
4. **Error Handling**: Some edge cases need handling
5. **Validation**: Client-side validation needs strengthening

### 🚀 Next Steps (Priority Order)
1. Complete resale marketplace database integration
2. Re-enable authentication middleware
3. Add comprehensive error handling
4. Implement form validation across all pages
5. Add loading states and user feedback
6. Optimize database queries
7. Add caching layer for performance
8. Implement real-time updates with WebSockets
9. Add email notifications
10. Build mobile-responsive design

---

## 🎮 User Journey Examples

### Example 1: New User Makes Prediction
1. User lands on `index.html` → auto-redirect to `login/login.html`
2. User clicks "Register" → enters details → account created
3. User logs in → JWT token stored → redirect to `home/home.html`
4. User clicks "Start Predicting" → navigates to `predictions/predictions.html`
5. Page loads upcoming matches via `GET /api/matches`
6. User selects winner and enters scores on prediction card
7. User clicks "Submit Prediction" → `POST /api/predictions` with match_id, user_id, scores
8. Database stores prediction → success message shown
9. User sees prediction in "Recent Predictions" section
10. When match finishes, points automatically calculated and awarded

### Example 2: Admin Creates Match and Tickets
1. Admin logs in with admin credentials
2. Navigates to `admin/admin.html`
3. Clicks "Matches" tab
4. Fills form: Home club (dropdown), Away club (dropdown), date, venue, league
5. Clicks "Add Match" → `POST /api/matches` creates record
6. New match appears in matches table with edit/delete options
7. Admin switches to "Tickets" tab
8. Selects the new match from dropdown
9. Creates 3 ticket types: VIP ($150, 50 qty), Premium ($80, 200 qty), Standard ($30, 1000 qty)
10. Clicks "Create Ticket" for each → `POST /api/tickets`
11. Tickets now available on `tickets/tickets.html` for users to purchase

### Example 3: User Books Ticket
1. User navigates to `tickets/tickets.html`
2. Page loads matches via `GET /api/matches` (only upcoming/live)
3. User browses matches, clicks "Select Seats" on desired match
4. Redirected to `tickets/step2.html?matchId=123`
5. Page loads ticket options via `GET /api/tickets/match/123`
6. User selects "Standard" category, quantity 2
7. Total price calculated: 2 × $30 = $60
8. User clicks "Continue to Checkout" → `tickets/step3.html`
9. User reviews order, enters payment (mock for now)
10. Clicks "Complete Purchase" → `POST /api/tickets/purchase`
11. Record created in `user_tickets` table
12. Confirmation shown, user can now resell if desired

---

## 🔧 Technical Details

### Server Configuration
```javascript
// backend/server.js
PORT: 3000
Database: MySQL (statarena)
CORS: Enabled for all origins
Body Parser: JSON + URL-encoded
```

### Environment Variables
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=mysqlkhaled900
DB_NAME=statarena
JWT_SECRET=default_secret
PORT=3000
```

### Database Connection
- Connection pooling enabled
- Max connections: 10
- Timeout: 60 seconds
- Auto-reconnect on failure

---

## 📝 Notes

### Recent Fixes
1. **Predictions Syntax Error**: Fixed arrow function incompatibility with Node v22.19.0
2. **Server Startup**: Fixed directory issues causing .env not loading
3. **Admin Validation**: Changed team name inputs to ID dropdowns
4. **League Tables**: Migrated from hardcoded data to database API

### Development Mode Features
- Auth checks disabled for easier testing
- Password validation bypassed
- Detailed console logging
- CORS open for development

### Production Readiness Checklist
- [ ] Re-enable authentication on all protected routes
- [ ] Re-enable bcrypt password hashing
- [ ] Restrict CORS to frontend domain only
- [ ] Add rate limiting to API endpoints
- [ ] Implement request validation
- [ ] Add database connection encryption
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Add API documentation (Swagger)
- [ ] Implement caching strategy
- [ ] Set up automated backups
- [ ] Configure SSL/HTTPS
- [ ] Optimize database indexes
- [ ] Add CDN for static assets
- [ ] Implement logging system

---

**Last Updated**: December 8, 2025  
**Version**: 1.0  
**Maintained By**: Development Team  
**Contact**: Support via admin dashboard
