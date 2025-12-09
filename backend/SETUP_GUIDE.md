# StatArena Backend Setup Guide

## Prerequisites

Before you start, make sure you have:
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MySQL** (v8 or higher) - [Download here](https://dev.mysql.com/downloads/mysql/)
- **Git** (optional) - [Download here](https://git-scm.com/)

---

## Step 1: Install MySQL Database

### Windows:
1. Download MySQL Installer from [MySQL Downloads](https://dev.mysql.com/downloads/installer/)
2. Run the installer and choose "Developer Default"
3. Set root password during installation (remember this!)
4. Complete the installation

### Verify MySQL Installation:
```powershell
mysql --version
```

---

## Step 2: Create Database

### Open MySQL Command Line:
```powershell
mysql -u root -p
```
Enter your root password when prompted.

### Create the database:
```sql
CREATE DATABASE statarena;
USE statarena;
source C:/Users/kkhha/OneDrive/Desktop/MyStatArena_ik/database/statarena_database.sql
```

Or using PowerShell:
```powershell
cd C:\Users\kkhha\OneDrive\Desktop\MyStatArena_ik
mysql -u root -p statarena < database/statarena_database.sql
```

### Verify database:
```sql
USE statarena;
SHOW TABLES;
SELECT * FROM users;
```

---

## Step 3: Install Node.js Dependencies

### Navigate to backend folder:
```powershell
cd C:\Users\kkhha\OneDrive\Desktop\MyStatArena_ik\backend
```

### Install dependencies:
```powershell
npm install
```

This will install:
- express (Web server)
- mysql2 (Database connection)
- cors (Cross-origin requests)
- dotenv (Environment variables)
- bcryptjs (Password hashing)
- jsonwebtoken (Authentication)
- nodemon (Development auto-restart)

---

## Step 4: Configure Environment Variables

### Create `.env` file:
```powershell
Copy-Item .env.example .env
```

### Edit `.env` file:
Open `backend/.env` and update with your MySQL credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=statarena
DB_PORT=3306

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret (change this!)
JWT_SECRET=your_super_secret_key_12345

# Frontend URL
FRONTEND_URL=http://localhost:5500
```

**Important:** Replace `YOUR_MYSQL_PASSWORD_HERE` with your actual MySQL root password!

---

## Step 5: Start the Backend Server

### Development mode (with auto-restart):
```powershell
npm run dev
```

### Production mode:
```powershell
npm start
```

### You should see:
```
✅ Database connected successfully!
🚀 StatArena API Server running on http://localhost:3000
📊 API Endpoints:
   - GET  /api/health
   - POST /api/auth/login
   - POST /api/auth/register
   - GET  /api/matches
   - GET  /api/matches/:id
   - GET  /api/clubs
   - GET  /api/players
   - GET  /api/leagues
   - GET  /api/predictions/user/:userId
```

---

## Step 6: Test the API

### Using PowerShell:
```powershell
# Test health check
Invoke-RestMethod -Uri "http://localhost:3000/api/health"

# Get all matches
Invoke-RestMethod -Uri "http://localhost:3000/api/matches"

# Get all clubs
Invoke-RestMethod -Uri "http://localhost:3000/api/clubs"

# Get all players
Invoke-RestMethod -Uri "http://localhost:3000/api/players"
```

### Using a web browser:
Open these URLs:
- http://localhost:3000/api/health
- http://localhost:3000/api/matches
- http://localhost:3000/api/clubs
- http://localhost:3000/api/players

---

## Step 7: Connect Frontend to Backend

### Add API client to your HTML pages:

Add this line **before** your existing scripts in ALL HTML pages:

```html
<script src="../assets/js/api-client.js"></script>
```

Example for `matches.html`:
```html
    <script src="../assets/js/auth-check.js"></script>
    <script src="../assets/js/api-client.js"></script>  <!-- Add this -->
</body>
</html>
```

---

## Step 8: Update Frontend Code

### Example: Load matches dynamically

In `matches.html`, add this script:
```html
<script>
async function loadMatches() {
    try {
        // Get live matches
        const liveMatches = await api.getLiveMatches();
        console.log('Live matches:', liveMatches);
        
        // Get upcoming matches
        const upcomingMatches = await api.getUpcomingMatches();
        console.log('Upcoming matches:', upcomingMatches);
        
        // TODO: Update HTML with data
    } catch (error) {
        console.error('Error loading matches:', error);
    }
}

// Load when page loads
document.addEventListener('DOMContentLoaded', loadMatches);
</script>
```

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/:id` - Get match details
- `GET /api/matches?status=LIVE` - Get matches by status

### Clubs
- `GET /api/clubs` - Get all clubs
- `GET /api/clubs/:id` - Get club details
- `GET /api/clubs?league_id=1` - Get clubs by league
- `GET /api/clubs/standings/:league_id` - Get league standings

### Players
- `GET /api/players` - Get all players
- `GET /api/players/:id` - Get player details
- `GET /api/players?club_id=2` - Get players by club
- `GET /api/players/top/featured` - Get top players

### Leagues
- `GET /api/leagues` - Get all leagues
- `GET /api/leagues/:id` - Get league details

### Predictions
- `GET /api/predictions/user/:userId` - Get user predictions
- `GET /api/predictions/stats/:userId` - Get user stats
- `POST /api/predictions` - Create new prediction
- `GET /api/predictions/leaderboard/top` - Get leaderboard

---

## Troubleshooting

### Error: "Database connection failed"
- Check MySQL is running: `Get-Service MySQL*`
- Verify credentials in `.env` file
- Test MySQL connection: `mysql -u root -p`

### Error: "Cannot find module"
- Run `npm install` in backend folder
- Check if `node_modules` folder exists

### Error: "Port 3000 is already in use"
- Change PORT in `.env` file to another number (e.g., 3001)
- Or stop the process using port 3000

### Error: "CORS policy"
- Check FRONTEND_URL in `.env` matches your dev server
- Make sure backend server is running

---

## Next Steps

1. ✅ Backend API is running
2. ✅ Database is populated with data
3. ✅ API client is added to frontend
4. 🔄 **TODO:** Update frontend pages to fetch data from API
5. 🔄 **TODO:** Remove hardcoded HTML
6. 🔄 **TODO:** Make pages dynamic

---

## Useful Commands

```powershell
# Start MySQL service
Start-Service MySQL*

# Stop MySQL service
Stop-Service MySQL*

# Check if server is running
netstat -ano | findstr :3000

# Kill process on port 3000
Stop-Process -Id <PID>
```

---

## Development Workflow

1. **Start MySQL** (if not running)
2. **Start Backend**: `cd backend` → `npm run dev`
3. **Open Frontend**: Use Live Server or open HTML files
4. **Test API**: Check console for API calls
5. **Make changes**: Server auto-restarts with nodemon

---

## Need Help?

Check the logs:
- Backend: Terminal where `npm run dev` is running
- Frontend: Browser console (F12)
- MySQL: MySQL error logs

---

## Production Deployment

When ready to deploy:
1. Set `NODE_ENV=production` in `.env`
2. Change `JWT_SECRET` to a secure random string
3. Enable password hashing in `auth.js`
4. Use environment variables for sensitive data
5. Consider using MySQL connection pooling
6. Add rate limiting for API endpoints
7. Enable HTTPS

---

**✅ Your backend is now ready!** Start the server and test the endpoints.
