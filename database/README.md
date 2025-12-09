# StatArena Database Documentation

## Overview
This database contains **user-generated content only** for the StatArena application. All sports content (matches, clubs, players, leagues, standings) is now served as static HTML/CSS/JS on the frontend for optimal performance.

## Database Structure (Active Tables Only)

### 1. **Users & Authentication**
- **users** - User accounts (admin and regular users)
- **admin_logs** - Track admin actions for security

**Current Users:**
- Khaled (Admin) - k@k.com
- Khaled (User) - khaled@example.com

---

### 2. **Predictions & Statistics**
- **predictions** - User match predictions
- **user_statistics** - User prediction stats and leaderboard

**Example User Predictions:**
- Total Points: 40
- Accuracy: Variable based on match results
- Global Rank: Computed from user_statistics

---

### 3. **Tickets & Marketplace**
- **tickets** - Available match tickets
- **user_tickets** - Purchased tickets
- **resell_tickets** - Resell marketplace listings

---

### 4. **Favorites**
- **user_favorite_clubs** - User's favorite clubs
- **user_favorite_players** - User's favorite players

---

## Views (Pre-built Queries)

### **vw_leaderboard**
User prediction leaderboard sorted by points

---

## Relationships

```
users (1) ----< (many) predictions
users (1) ----< (many) user_tickets
users (1) ----< (many) user_favorite_clubs
users (1) ----< (many) user_favorite_players
users (1) ----< (many) resell_tickets
```

---

## How to Use This Database

### **Setup Instructions:**

1. **Create Database:**
```sql
CREATE DATABASE statarena;
USE statarena;
```

2. **Run the Schema:**
```bash
mysql -u your_username -p statarena < statarena_database.sql
```

3. **Verify Installation:**
```sql
SHOW TABLES;
SELECT * FROM users;
SELECT * FROM vw_leaderboard;
```

---

## Important Notes

### **Architecture Change:**
⚠️ **Static Content (No Database):**
- Matches, clubs, players, leagues, and standings are now implemented as static HTML/CSS/JS
- This data lives in the frontend code for instant rendering

✅ **Dynamic Content (Uses Database):**
- User authentication and profiles
- Match predictions and leaderboards
- Ticket purchases and resale
- User favorites

### **Security:**
- Passwords should be hashed (use bcrypt)
- JWT tokens for authentication
- Parameterized queries prevent SQL injection

---

## Sample Queries

### Get user's prediction history:
```sql
SELECT 
    p.predicted_home_score,
    p.predicted_away_score,
    p.points_earned,
    p.match_id
FROM predictions p
WHERE p.user_id = 1;
```

### Get prediction leaderboard:
```sql
SELECT * FROM vw_leaderboard LIMIT 10;
```

### Get user's purchased tickets:
```sql
SELECT 
    ut.*,
    t.match_id,
    t.price
FROM user_tickets ut
JOIN tickets t ON ut.ticket_id = t.ticket_id
WHERE ut.user_id = 1;
```

---

## Contact & Support
For questions about this database structure, contact the development team.
