const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

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

// DELETE prediction (Admin only - auth to be added later)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.query('DELETE FROM predictions WHERE prediction_id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Prediction not found' });
        }
        
        res.json({ success: true, message: 'Prediction deleted successfully' });
    } catch (error) {
        console.error('Error deleting prediction:', error);
        res.status(500).json({ error: 'Failed to delete prediction' });
    }
});

module.exports = router;
