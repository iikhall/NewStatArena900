const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET all tickets
router.get('/', async (req, res) => {
    try {
        const [tickets] = await pool.query(`
            SELECT 
                t.*,
                m.match_date,
                hc.name AS home_team,
                ac.name AS away_team,
                l.name AS league_name
            FROM tickets t
            JOIN matches m ON t.match_id = m.match_id
            JOIN clubs hc ON m.home_club_id = hc.club_id
            JOIN clubs ac ON m.away_club_id = ac.club_id
            LEFT JOIN leagues l ON m.league_id = l.league_id
            ORDER BY m.match_date ASC
        `);
        
        res.json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});

// GET tickets by match ID
router.get('/match/:matchId', async (req, res) => {
    try {
        const { matchId } = req.params;
        
        const [tickets] = await pool.query(`
            SELECT 
                t.*,
                m.match_date,
                hc.name AS home_team,
                ac.name AS away_team
            FROM tickets t
            JOIN matches m ON t.match_id = m.match_id
            JOIN clubs hc ON m.home_club_id = hc.club_id
            JOIN clubs ac ON m.away_club_id = ac.club_id
            WHERE t.match_id = ?
        `, [matchId]);
        
        res.json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});

// POST - Create new ticket (Admin only - auth to be added later)
router.post('/', async (req, res) => {
    try {
        const { match_id, section, price, available_quantity, total_quantity, seat_info } = req.body;
        
        if (!match_id || !section || !price || !available_quantity) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const [result] = await pool.query(`
            INSERT INTO tickets (match_id, section, price, available_quantity, total_quantity, seat_info)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [match_id, section, price, available_quantity, total_quantity || available_quantity, seat_info || null]);
        
        res.status(201).json({ 
            success: true, 
            message: 'Ticket created successfully',
            ticket_id: result.insertId 
        });
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ error: 'Failed to create ticket' });
    }
});

// PUT - Update ticket (Admin only - auth to be added later)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { price, available_quantity, total_quantity } = req.body;
        
        const [result] = await pool.query(`
            UPDATE tickets 
            SET price = COALESCE(?, price),
                available_quantity = COALESCE(?, available_quantity),
                total_quantity = COALESCE(?, total_quantity)
            WHERE ticket_id = ?
        `, [price, available_quantity, total_quantity, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        res.json({ success: true, message: 'Ticket updated successfully' });
    } catch (error) {
        console.error('Error updating ticket:', error);
        res.status(500).json({ error: 'Failed to update ticket' });
    }
});

// DELETE - Delete ticket (Admin only - auth to be added later)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.query('DELETE FROM tickets WHERE ticket_id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        res.json({ success: true, message: 'Ticket deleted successfully' });
    } catch (error) {
        console.error('Error deleting ticket:', error);
        res.status(500).json({ error: 'Failed to delete ticket' });
    }
});

// POST - Purchase ticket (create user_ticket)
router.post('/purchase', async (req, res) => {
    try {
        const { user_id, match_title, match_date, stadium, category, quantity, price, total } = req.body;
        
        if (!user_id || !match_title || !quantity || !price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const [result] = await pool.query(`
            INSERT INTO user_tickets (user_id, match_title, match_date, stadium, category, quantity, price, total, purchase_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [user_id, match_title, match_date, stadium, category, quantity, price, total]);
        
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

// GET user tickets
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const [tickets] = await pool.query(`
            SELECT * FROM user_tickets 
            WHERE user_id = ? AND resale_listed = 0
            ORDER BY purchase_date DESC
        `, [userId]);
        
        res.json(tickets);
    } catch (error) {
        console.error('Error fetching user tickets:', error);
        res.status(500).json({ error: 'Failed to fetch user tickets' });
    }
});

// GET all resale tickets
router.get('/resale', async (req, res) => {
    try {
        const [tickets] = await pool.query(`
            SELECT 
                r.*,
                ut.match_title,
                ut.match_date,
                ut.stadium,
                ut.category,
                ut.quantity,
                ut.price as original_price,
                u.name as seller_name
            FROM resale_tickets r
            JOIN user_tickets ut ON r.user_ticket_id = ut.user_ticket_id
            JOIN users u ON r.seller_id = u.user_id
            WHERE r.status = 'available'
            ORDER BY r.listed_date DESC
        `);
        
        res.json(tickets);
    } catch (error) {
        console.error('Error fetching resale tickets:', error);
        res.status(500).json({ error: 'Failed to fetch resale tickets' });
    }
});

// POST - List ticket for resale
router.post('/resale', async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { user_ticket_id, resale_price, notes } = req.body;
        
        if (!user_ticket_id || !resale_price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        await connection.beginTransaction();
        
        // Get user_id from the ticket
        const [tickets] = await connection.query(
            'SELECT user_id FROM user_tickets WHERE user_ticket_id = ?',
            [user_ticket_id]
        );
        
        if (tickets.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        const seller_id = tickets[0].user_id;
        
        // Create resale listing
        const [result] = await connection.query(`
            INSERT INTO resale_tickets (user_ticket_id, seller_id, resale_price, notes, listed_date, status)
            VALUES (?, ?, ?, ?, NOW(), 'available')
        `, [user_ticket_id, seller_id, resale_price, notes || null]);
        
        // Update user_ticket to mark as listed
        await connection.query(
            'UPDATE user_tickets SET resale_listed = 1 WHERE user_ticket_id = ?',
            [user_ticket_id]
        );
        
        await connection.commit();
        
        res.status(201).json({ 
            success: true, 
            message: 'Ticket listed for resale successfully',
            resale_id: result.insertId 
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error listing ticket for resale:', error);
        res.status(500).json({ error: 'Failed to list ticket for resale' });
    } finally {
        connection.release();
    }
});

// POST - Purchase resale ticket
router.post('/resale/:resaleId/purchase', async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { resaleId } = req.params;
        const { buyer_id } = req.body;
        
        if (!buyer_id) {
            return res.status(400).json({ error: 'Buyer ID is required' });
        }
        
        await connection.beginTransaction();
        
        // Get resale ticket details
        const [resaleTickets] = await connection.query(`
            SELECT r.*, ut.* 
            FROM resale_tickets r
            JOIN user_tickets ut ON r.user_ticket_id = ut.user_ticket_id
            WHERE r.resale_id = ? AND r.status = 'available'
        `, [resaleId]);
        
        if (resaleTickets.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Resale ticket not found or already sold' });
        }
        
        const ticket = resaleTickets[0];
        
        // Create new ticket for buyer
        await connection.query(`
            INSERT INTO user_tickets (user_id, match_title, match_date, stadium, category, quantity, price, total, purchase_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [buyer_id, ticket.match_title, ticket.match_date, ticket.stadium, ticket.category, ticket.quantity, ticket.resale_price, ticket.resale_price]);
        
        // Update resale status to sold
        await connection.query(
            'UPDATE resale_tickets SET status = "sold", buyer_id = ?, sold_date = NOW() WHERE resale_id = ?',
            [buyer_id, resaleId]
        );
        
        await connection.commit();
        
        res.json({ 
            success: true, 
            message: 'Resale ticket purchased successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error purchasing resale ticket:', error);
        res.status(500).json({ error: 'Failed to purchase resale ticket' });
    } finally {
        connection.release();
    }
});

// DELETE - Cancel resale listing
router.delete('/resale/:resaleId', async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { resaleId } = req.params;
        
        await connection.beginTransaction();
        
        // Get the user_ticket_id before deleting
        const [resaleTickets] = await connection.query(
            'SELECT user_ticket_id FROM resale_tickets WHERE resale_id = ? AND status = "available"',
            [resaleId]
        );
        
        if (resaleTickets.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Resale listing not found or already sold' });
        }
        
        const user_ticket_id = resaleTickets[0].user_ticket_id;
        
        // Delete the resale listing
        await connection.query(
            'DELETE FROM resale_tickets WHERE resale_id = ?',
            [resaleId]
        );
        
        // Update user_ticket to mark as not listed
        await connection.query(
            'UPDATE user_tickets SET resale_listed = 0 WHERE user_ticket_id = ?',
            [user_ticket_id]
        );
        
        await connection.commit();
        
        res.json({ 
            success: true, 
            message: 'Resale listing cancelled successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error cancelling resale listing:', error);
        res.status(500).json({ error: 'Failed to cancel resale listing' });
    } finally {
        connection.release();
    }
});

module.exports = router;

