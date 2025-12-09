require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const { pool } = require('../backend/config/database');

async function runMigration() {

    try {
        console.log('Connected to database');

        // Create ticket_resale table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ticket_resale (
                resale_id INT PRIMARY KEY AUTO_INCREMENT,
                ticket_id INT NOT NULL,
                seller_id INT NOT NULL,
                resale_price DECIMAL(10,2) NOT NULL,
                quantity INT NOT NULL,
                notes TEXT,
                status ENUM('available', 'sold', 'cancelled') DEFAULT 'available',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                sold_at TIMESTAMP NULL,
                FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
                FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Created ticket_resale table');

        // Update tickets table structure
        await pool.query(`
            ALTER TABLE tickets 
            ADD COLUMN IF NOT EXISTS section VARCHAR(50) DEFAULT 'General'
        `);
        console.log('✅ Added section column to tickets');

        await pool.query(`
            ALTER TABLE tickets 
            ADD COLUMN IF NOT EXISTS available_quantity INT DEFAULT 100
        `);
        console.log('✅ Added available_quantity column to tickets');

        await pool.query(`
            ALTER TABLE tickets 
            ADD COLUMN IF NOT EXISTS total_quantity INT DEFAULT 100
        `);
        console.log('✅ Added total_quantity column to tickets');

        await pool.query(`
            ALTER TABLE tickets 
            ADD COLUMN IF NOT EXISTS seat_info TEXT
        `);
        console.log('✅ Added seat_info column to tickets');

        console.log('\n✅ Migration completed successfully!');
    } catch (error) {
        console.error('Migration error:', error.message);
    } finally {
        await pool.end();
    }
}

runMigration();
