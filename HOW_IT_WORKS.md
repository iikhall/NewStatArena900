# StatArena - How It Works

## Overview
StatArena is a football statistics and prediction platform with a **full-stack architecture**:
- **Frontend**: HTML/CSS/JavaScript pages in your browser
- **Backend**: Node.js/Express API server (Port 3000)
- **Database**: MySQL with real match data, teams, players, and user information

**Current Status**: Backend and database are ready with data! Frontend needs to be connected to use the API instead of localStorage.

---

## 🏗️ Architecture

### Frontend (What You See)
- **Location**: `statarena/` folder
- **Technology**: HTML, CSS, JavaScript
- **Pages**: 
  - Home, Matches, Clubs, Players, Tables
  - Predictions, Tickets, Resell, Admin, Profile

### Backend (Optional Server)
- **Location**: `backend/` folder
- **Technology**: Node.js + Express
- **Status**: ✅ **Running and ready** with full API endpoints
- **Port**: localhost:3000
- **Features**: Authentication, matches, predictions, bookings, user management

### Database (Optional Storage)
- **Location**: `database/` folder
- **Technology**: MySQL
- **Status**: ✅ **Populated with real data** (matches, teams, players, leagues)
- **Connection**: Backend server is connected and working

### What Needs To Be Done
The backend and database are ready! We just need to update the frontend JavaScript files to call the API instead of using localStorage.

---

## 💾 How Data is Stored

### Current System: LocalStorage (Browser Storage)

All user data is saved in your browser's localStorage. Think of it like a small filing cabinet inside your browser.

#### What Gets Stored:

1. **User Session**
   - Key: `statarena_session`
   - Stores: Email, name, role (admin/user)
   - When: After login

2. **User Predictions**
   - Key: `userPredictions`
   - Stores: All match predictions made by user
   - Format: Array of prediction objects

3. **Favorite Teams**
   - Key: `statarena_favorites_{email}`
   - Stores: List of favorited clubs/players
   - Separate for each user

4. **Ticket Bookings**
   - Key: `userBookings`
   - Stores: All purchased tickets
   - Includes: Match info, seat category, price, customer details

5. **Resale Listings**
   - Key: `resaleListings`
   - Stores: All tickets listed for resale
   - Shared between all users (everyone sees all listings)

---

## 🎯 Example: How Predictions Work

Let's follow what happens when a user makes a prediction:

### Step 1: User Opens Predictions Page
```
User clicks "Predictions" in navbar
→ Opens predictions/predictions.html
→ JavaScript loads matches from hardcoded data
```

### Step 2: User Makes a Prediction
```
User selects: Arsenal vs Chelsea
User predicts: 2-1 Arsenal
User clicks "Submit Prediction"
```

### Step 3: Saving the Prediction
```javascript
// JavaScript in predictions.js does this:

1. Get current user from session:
   let session = JSON.parse(localStorage.getItem('statarena_session'))
   let userEmail = session.email

2. Get existing predictions:
   let predictions = JSON.parse(localStorage.getItem('userPredictions')) || []

3. Add new prediction:
   predictions.push({
     id: Date.now(),
     userEmail: userEmail,
     match: "Arsenal vs Chelsea",
     prediction: "2-1 Arsenal",
     homeScore: 2,
     awayScore: 1,
     date: "2024-12-07",
     status: "pending"
   })

4. Save back to localStorage:
   localStorage.setItem('userPredictions', JSON.stringify(predictions))
```

### Step 4: Viewing Predictions
```
User opens Profile page
→ JavaScript reads 'userPredictions' from localStorage
→ Filters predictions by current user's email
→ Displays last 5 predictions in profile
```

### Storage Location
```
Your Browser → Developer Tools → Application → Local Storage → file://
→ statarena_session: {email: "user@email.com", name: "User"}
→ userPredictions: [{match: "Arsenal vs Chelsea", prediction: "2-1"}]
```

---

## 🎫 Example: How Ticket Booking Works

### The Journey:

#### Step 1: Select Match (tickets.html)
```
User browses matches
→ Clicks on a match card
→ Match data saved to localStorage as 'selectedEvent'
→ Redirects to step2.html
```

#### Step 2: Choose Seats (step2.html)
```
User selects:
- Category: CAT 2 (60 SAR)
- Quantity: 2 tickets
→ Calculates: 60 × 2 = 120 SAR
→ Adds service fee: 120 × 1.08 = 129.6 SAR
→ Saves selection to localStorage as 'bookingData'
→ Redirects to step3.html
```

#### Step 3: Payment & Confirmation (step3.html)
```
User enters:
- Full Name: "Khaled Ahmed"
- Email: "k@k.com"
- Phone: "0501234567"

Clicks "Complete Payment"

JavaScript creates booking:
{
  id: "BK1733598234",
  userEmail: "k@k.com",
  customerName: "Khaled Ahmed",
  customerEmail: "k@k.com",
  customerPhone: "0501234567",
  match: "Real Madrid vs Barcelona",
  stadium: "Santiago Bernabéu",
  date: "2024-12-15",
  category: "CAT 2",
  quantity: 2,
  totalPrice: 129.6,
  status: "confirmed",
  bookingDate: "2024-12-07"
}

Saves to localStorage 'userBookings' array
```

#### Step 4: View in Profile
```
User opens profile/profile.html
→ JavaScript reads 'userBookings'
→ Filters by user's email
→ Displays tickets in "My Tickets" section
```

---

## 🔄 Example: How Resale Works

### Listing a Ticket:

```
User in Profile → Clicks "Resell" on owned ticket
→ Opens modal to set price
→ User enters: 150 SAR (custom price)
→ JavaScript creates resale listing:

{
  id: "RS1733598300",
  bookingId: "BK1733598234",
  sellerEmail: "k@k.com",
  match: "Real Madrid vs Barcelona",
  originalPrice: 129.6,
  resalePrice: 150,
  status: "available"
}

→ Saves to 'resaleListings' in localStorage
→ Shows in Resell page for ALL users to see
```

### Buying from Resale:

```
Another user opens resell/resell.html
→ Sees listing for 150 SAR
→ Clicks "Buy This Ticket"
→ JavaScript:
  1. Removes ticket from original owner's 'userBookings'
  2. Adds ticket to buyer's 'userBookings'
  3. Removes listing from 'resaleListings'
  4. Updates seller and buyer data
```

---

## 🔐 How Login Works

### Current System (Simple):

```javascript
// In login/auth.js

User enters:
- Email: k@k.com
- Password: password123

JavaScript checks:
if (email === 'k@k.com' && password === 'password123') {
  // Admin login
  localStorage.setItem('statarena_session', JSON.stringify({
    email: 'k@k.com',
    name: 'Khaled',
    role: 'admin'
  }))
  // Redirect to home
}
else if (email && password) {
  // Regular user login
  localStorage.setItem('statarena_session', JSON.stringify({
    email: email,
    name: email.split('@')[0],
    role: 'user'
  }))
  // Redirect to home
}
```

**Note**: This is a simple demo system. No real password checking or security!

---

## 🗄️ Backend & Database (Not Currently Used)

### Backend Server
- **File**: `backend/server.js`
- **What it does**: Provides API endpoints to connect to MySQL database
- **Endpoints available**:
  - `/api/matches` - Get matches
  - `/api/teams` - Get teams
  - `/api/players` - Get players
  - `/api/standings` - Get league tables
  - `/api/predictions` - Save/get predictions
  
- **Status**: Server can run, but frontend doesn't call these APIs

### Database
- **File**: `database/statarena_database.sql`
- **What it contains**: Tables for users, matches, teams, predictions, bookings
- **Status**: Database structure exists but isn't being used

### Why Not Connected?

The website currently works as a **standalone frontend** using localStorage. This means:
- ✅ Fast and simple
- ✅ No server setup needed
- ✅ Works offline
- ❌ Data lost if browser cache cleared
- ❌ Can't share data between devices
- ❌ No real user authentication

---

## 🔧 How To Connect Backend (If Needed)

If you want to use the backend instead of localStorage:

### Step 1: Start Backend Server
```powershell
cd backend
node server.js
```
Server runs on: http://localhost:3000

### Step 2: Update Frontend Code
Replace localStorage calls with API calls:

**Current (localStorage):**
```javascript
let predictions = JSON.parse(localStorage.getItem('userPredictions')) || []
```

**With Backend (API):**
```javascript
let response = await fetch('http://localhost:3000/api/predictions')
let predictions = await response.json()
```

### Step 3: Update All Features
- Predictions: Call `/api/predictions`
- Bookings: Call `/api/bookings`
- Favorites: Call `/api/favorites`
- Login: Call `/api/auth/login`

---

## 📊 Data Flow Diagram

### Current System (localStorage):
```
User → Browser → JavaScript → localStorage
                     ↓
              (Saves data locally)
                     ↓
         (Read on next page load)
```

### With Backend (Future):
```
User → Browser → JavaScript → API Call → Express Server → MySQL Database
                                                    ↓
                                            (Saves permanently)
                                                    ↓
                                            (Returns data)
                                                    ↓
Browser ← JavaScript ← Response ← Express ← Database
```

---

## 🎮 Summary: Key Points

1. **Everything works in your browser** - no server needed right now
2. **Data stored in localStorage** - like a small database in your browser
3. **Each feature uses different localStorage keys** - organized storage
4. **Backend exists but isn't connected** - ready to use if needed
5. **Database is set up but empty** - ready to store real data

### When Backend Would Be Useful:
- Multiple users need to see same data
- Data needs to persist across devices
- Real user accounts with passwords
- Admin dashboard to manage content
- Analytics and reporting

### Current Advantages:
- Super fast (no network calls)
- Works offline
- Easy to develop and test
- No server hosting costs

---

## 🔍 Where to Find Things

```
Project Structure:

statarena/
├── home/           → Home page
├── login/          → Login system (localStorage)
├── predictions/    → Predictions (localStorage)
├── tickets/        → Ticket booking (localStorage)
├── resell/         → Resale marketplace (localStorage)
├── profile/        → User profile (reads localStorage)
└── assets/js/      → Shared JavaScript files

backend/
└── server.js       → API server (not used yet)

database/
└── statarena_database.sql  → Database structure (not used yet)
```

---

## 💡 Quick Reference: localStorage Keys

| Key | What It Stores | Used By |
|-----|----------------|---------|
| `statarena_session` | Current logged-in user | All pages |
| `userPredictions` | All predictions | Predictions, Profile |
| `statarena_favorites_{email}` | User's favorites | Clubs, Players, Profile |
| `userBookings` | Ticket bookings | Tickets, Profile |
| `resaleListings` | Tickets for resale | Resell, Profile |
| `selectedEvent` | Temporary match selection | Ticket booking flow |
| `bookingData` | Temporary booking info | Ticket booking flow |

---

**Need Help?** 
- Check browser Console (F12) for errors
- Check Application tab in DevTools to see localStorage data
- All JavaScript files have comments explaining the code
