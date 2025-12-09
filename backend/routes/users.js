const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET user profile
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [users] = await pool.query(`
            SELECT user_id, name, email, role, created_at, last_login
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
            SET name = ?, email = COALESCE(?, email), updated_at = NOW()
            WHERE user_id = ?
        `, [name, email, id]);
        
        // Fetch updated user
        const [users] = await pool.query(`
            SELECT user_id, name, email, role, created_at, last_login
            FROM users
            WHERE user_id = ?
        `, [id]);
        
        res.json({ message: 'Profile updated successfully', user: users[0] });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

module.exports = router;
