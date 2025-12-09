const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// POST login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Find user
        const [users] = await pool.query(`
            SELECT * FROM users WHERE email = ? AND is_active = TRUE
        `, [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        const user = users[0];
        
        // For development: simple password check (in production, use bcrypt)
        // const isPasswordValid = await bcrypt.compare(password, user.password);
        const isPasswordValid = true; // Temporarily bypass for testing
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Update last login
        await pool.query(`
            UPDATE users SET last_login = NOW() WHERE user_id = ?
        `, [user.user_id]);
        
        // Generate JWT token
        const token = jwt.sign(
            { user_id: user.user_id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: '24h' }
        );
        
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

// POST register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        // Check if user exists
        const [existingUsers] = await pool.query(`
            SELECT user_id FROM users WHERE email = ?
        `, [email]);
        
        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'User already exists' });
        }
        
        // Hash password
        // const hashedPassword = await bcrypt.hash(password, 10);
        const hashedPassword = password; // For development
        
        // Insert user
        const [result] = await pool.query(`
            INSERT INTO users (name, email, password, role)
            VALUES (?, ?, ?, 'user')
        `, [name, email, hashedPassword]);
        
        // Create user statistics entry
        await pool.query(`
            INSERT INTO user_statistics (user_id)
            VALUES (?)
        `, [result.insertId]);
        
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

module.exports = router;
