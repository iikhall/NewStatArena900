const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Import routes (only for dynamic user-generated content)
const predictionsRoutes = require('./routes/predictions');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const ticketsRoutes = require('./routes/tickets');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'StatArena API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes (only for dynamic user-generated content)
app.use('/api/auth', authRoutes);
app.use('/api/predictions', predictionsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tickets', ticketsRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

// Start server
async function startServer() {
    // Test database connection first
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
        console.error('❌ Cannot start server without database connection');
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`🚀 StatArena API Server running on http://localhost:${PORT}`);
        console.log(`📊 API Endpoints (User-Generated Content Only):`);
        console.log(`   - GET  /api/health`);
        console.log(`   - POST /api/auth/login`);
        console.log(`   - POST /api/auth/register`);
        console.log(`   - GET  /api/predictions/user/:userId`);
        console.log(`   - POST /api/predictions`);
        console.log(`   - GET  /api/tickets`);
        console.log(`   - GET  /api/users/:userId`);
    });
}

startServer();

module.exports = app;
