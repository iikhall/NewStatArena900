const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET admin dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        // Get total users count
        const [totalUsersResult] = await pool.query(`
            SELECT COUNT(*) as count FROM users WHERE is_active = TRUE
        `);
        
        // Get admin count
        const [adminResult] = await pool.query(`
            SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND is_active = TRUE
        `);
        
        // Get new users this week
        const [newUsersResult] = await pool.query(`
            SELECT COUNT(*) as count FROM users 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND is_active = TRUE
        `);
        
        // Get active sessions (users who logged in within last 24 hours)
        const [activeSessionsResult] = await pool.query(`
            SELECT COUNT(*) as count FROM users 
            WHERE last_login >= DATE_SUB(NOW(), INTERVAL 24 HOUR) AND is_active = TRUE
        `);
        
        res.json({
            totalUsers: totalUsersResult[0].count,
            totalAdmins: adminResult[0].count,
            newUsers: newUsersResult[0].count,
            activeSessions: activeSessionsResult[0].count
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ error: 'Failed to fetch admin statistics' });
    }
});

// GET all users (for admin panel)
router.get('/', async (req, res) => {
    try {
        const [users] = await pool.query(`
            SELECT user_id, username as name, email, role, created_at, last_login, is_active
            FROM users
            WHERE is_active = TRUE
            ORDER BY created_at DESC
        `);
        
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// GET user profile
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [users] = await pool.query(`
            SELECT user_id, username as name, email, role, created_at, last_login
            FROM users
            WHERE user_id = ? AND is_active = TRUE
        `, [id]);
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Get user statistics
        const [stats] = await pool.query(`
            SELECT * FROM user_statistics WHERE user_id = ?
        `, [id]);
        
        const user = users[0];
        user.statistics = stats[0] || null;
        
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// PUT update user profile
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        
        await pool.query(`
            UPDATE users 
            SET username = ?, email = COALESCE(?, email)
            WHERE user_id = ?
        `, [name, email, id]);
        
        // Fetch updated user
        const [users] = await pool.query(`
            SELECT user_id, username as name, email, role, created_at, last_login
            FROM users
            WHERE user_id = ?
        `, [id]);
        
        res.json({ message: 'Profile updated successfully', user: users[0] });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// DELETE user (permanent deletion from database)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if user exists
        const [users] = await pool.query('SELECT email, role FROM users WHERE user_id = ?', [id]);
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Don't allow deleting admin accounts
        if (users[0].role === 'admin' || users[0].email === 'k@k.com' || users[0].email === 'admin@statarena.com') {
            return res.status(403).json({ error: 'Cannot delete administrator account' });
        }
        
        // Delete related data first (to avoid foreign key constraints)
        try {
            await pool.query('DELETE FROM user_statistics WHERE user_id = ?', [id]);
            await pool.query('DELETE FROM predictions WHERE user_id = ?', [id]);
            await pool.query('DELETE FROM ticket_purchases WHERE user_id = ?', [id]);
        } catch (err) {
            console.log('Related data cleanup:', err.message);
        }
        
        // Permanently delete user from database
        await pool.query('DELETE FROM users WHERE user_id = ?', [id]);
        
        res.json({ message: 'User permanently deleted from database' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;
