const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get clubs (for dropdowns) - MUST be before /:id route
router.get('/data/clubs', async (req, res) => {
    try {
        const [clubs] = await pool.query('SELECT club_id, name FROM clubs ORDER BY name');
        res.json(clubs);
    } catch (error) {
        console.error('Error fetching clubs:', error);
        res.status(500).json({ error: 'Failed to fetch clubs' });
    }
});

// Get leagues (for dropdowns) - MUST be before /:id route
router.get('/data/leagues', async (req, res) => {
    try {
        const [leagues] = await pool.query('SELECT league_id, name FROM leagues ORDER BY name');
        res.json(leagues);
    } catch (error) {
        console.error('Error fetching leagues:', error);
        res.status(500).json({ error: 'Failed to fetch leagues' });
    }
});

// Get all matches
router.get('/', async (req, res) => {
    try {
        const [matches] = await pool.query(`
            SELECT 
                m.match_id,
                m.match_date,
                m.venue,
                m.status,
                m.home_score,
                m.away_score,
                m.match_minute,
                h.name as home_team,
                h.club_id as home_club_id,
                h.logo_url as home_logo,
                a.name as away_team,
                a.club_id as away_club_id,
                a.logo_url as away_logo,
                l.name as league_name,
                l.league_id as league_id
            FROM matches m
            JOIN clubs h ON m.home_club_id = h.club_id
            JOIN clubs a ON m.away_club_id = a.club_id
            LEFT JOIN leagues l ON m.league_id = l.league_id
            ORDER BY m.match_date DESC
        `);
        
        res.json(matches);
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
});

// Get match by ID
router.get('/:id', async (req, res) => {
    try {
        const [matches] = await pool.query(`
            SELECT 
                m.match_id,
                m.match_date,
                m.venue,
                m.status,
                m.home_score,
                m.away_score,
                m.match_minute,
                h.name as home_team,
                h.club_id as home_club_id,
                a.name as away_team,
                a.club_id as away_club_id,
                l.name as league_name,
                l.league_id as league_id
            FROM matches m
            JOIN clubs h ON m.home_club_id = h.club_id
            JOIN clubs a ON m.away_club_id = a.club_id
            LEFT JOIN leagues l ON m.league_id = l.league_id
            WHERE m.match_id = ?
        `, [req.params.id]);
        
        if (matches.length === 0) {
            return res.status(404).json({ error: 'Match not found' });
        }
        
        res.json(matches[0]);
    } catch (error) {
        console.error('Error fetching match:', error);
        res.status(500).json({ error: 'Failed to fetch match' });
    }
});

// Create new match (admin only)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { home_club_id, away_club_id, league_id, match_date, venue, status } = req.body;
        
        // Validate required fields
        if (!home_club_id || !away_club_id) {
            return res.status(400).json({ error: 'Home and away teams are required' });
        }
        
        // Validate teams are different
        if (home_club_id === away_club_id) {
            return res.status(400).json({ error: 'Home and away teams must be different' });
        }
        
        const [result] = await pool.query(
            `INSERT INTO matches (home_club_id, away_club_id, league_id, match_date, venue, status) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [home_club_id, away_club_id, league_id, match_date, venue, status || 'Upcoming']
        );
        
        res.status(201).json({ 
            message: 'Match created successfully', 
            match_id: result.insertId 
        });
    } catch (error) {
        console.error('Error creating match:', error);
        res.status(500).json({ error: 'Failed to create match' });
    }
});

// Update match (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { home_club_id, away_club_id, league_id, match_date, venue, status, home_score, away_score } = req.body;
        
        // Validate teams are different if both provided
        if (home_club_id && away_club_id && home_club_id === away_club_id) {
            return res.status(400).json({ error: 'Home and away teams must be different' });
        }
        
        const [result] = await pool.query(
            `UPDATE matches 
             SET home_club_id = COALESCE(?, home_club_id),
                 away_club_id = COALESCE(?, away_club_id),
                 league_id = COALESCE(?, league_id),
                 match_date = COALESCE(?, match_date),
                 venue = COALESCE(?, venue),
                 status = COALESCE(?, status),
                 home_score = ?,
                 away_score = ?
             WHERE match_id = ?`,
            [home_club_id, away_club_id, league_id, match_date, venue, status, home_score, away_score, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Match not found' });
        }
        
        res.json({ message: 'Match updated successfully' });
    } catch (error) {
        console.error('Error updating match:', error);
        res.status(500).json({ error: 'Failed to update match' });
    }
});

// Delete match (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM matches WHERE match_id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Match not found' });
        }
        
        res.json({ message: 'Match deleted successfully' });
    } catch (error) {
        console.error('Error deleting match:', error);
        res.status(500).json({ error: 'Failed to delete match' });
    }
});

module.exports = router;
