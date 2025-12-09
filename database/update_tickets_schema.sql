-- Update tickets schema for simplified ticket purchase and resale system
-- Run this script to update the existing database

-- First, drop existing tables if they exist (remove foreign key constraints first)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS resale_tickets;
DROP TABLE IF EXISTS user_tickets;
SET FOREIGN_KEY_CHECKS = 1;

-- Create updated user_tickets table (stores purchased tickets)
CREATE TABLE user_tickets (
    user_ticket_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    match_title VARCHAR(200) NOT NULL,
    match_date VARCHAR(100),
    stadium VARCHAR(150),
    category VARCHAR(50),
    quantity INT DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resale_listed TINYINT(1) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create resale_tickets table (stores tickets listed for resale)
CREATE TABLE resale_tickets (
    resale_id INT PRIMARY KEY AUTO_INCREMENT,
    user_ticket_id INT NOT NULL,
    seller_id INT NOT NULL,
    buyer_id INT DEFAULT NULL,
    resale_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    listed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sold_date TIMESTAMP NULL,
    status ENUM('available', 'sold', 'cancelled') DEFAULT 'available',
    FOREIGN KEY (user_ticket_id) REFERENCES user_tickets(user_ticket_id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Add indexes for better performance
CREATE INDEX idx_user_tickets_user ON user_tickets(user_id);
CREATE INDEX idx_user_tickets_resale ON user_tickets(resale_listed);
CREATE INDEX idx_resale_status ON resale_tickets(status);
CREATE INDEX idx_resale_seller ON resale_tickets(seller_id);
