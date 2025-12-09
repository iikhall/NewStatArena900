-- StatArena Clean Database Schema
-- Simplified database with only user-content tables
-- Created: December 9, 2025

-- Drop existing database and create fresh
DROP DATABASE IF EXISTS statarena;
CREATE DATABASE statarena;
USE statarena;

-- ============================================
-- 1. USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active TINYINT(1) DEFAULT 1
);

-- Insert default admin and test user
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@statarena.com', '$2b$10$xZKqH8P9yJ0vN7rL9mW8qO5H8rH5E6kJ9lK7mN8pQ3rT4uV5wX6yZ', 'admin'),
('khaled', 'k@k.com', '$2b$10$xZKqH8P9yJ0vN7rL9mW8qO5H8rH5E6kJ9lK7mN8pQ3rT4uV5wX6yZ', 'user'),
('john', 'john@example.com', '$2b$10$xZKqH8P9yJ0vN7rL9mW8qO5H8rH5E6kJ9lK7mN8pQ3rT4uV5wX6yZ', 'user'),
('sarah', 'sarah@example.com', '$2b$10$xZKqH8P9yJ0vN7rL9mW8qO5H8rH5E6kJ9lK7mN8pQ3rT4uV5wX6yZ', 'user');

-- ============================================
-- 2. PREDICTIONS
-- ============================================

CREATE TABLE predictions (
    prediction_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    match_title VARCHAR(200) NOT NULL,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    league_name VARCHAR(100),
    predicted_home_score INT NOT NULL,
    predicted_away_score INT NOT NULL,
    match_date VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'correct', 'incorrect') DEFAULT 'pending',
    points_earned INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Sample predictions
INSERT INTO predictions (user_id, match_title, home_team, away_team, league_name, predicted_home_score, predicted_away_score, match_date, status, points_earned) VALUES
(2, 'Arsenal vs Tottenham', 'Arsenal', 'Tottenham', 'Premier League', 2, 1, '12/9/2025', 'pending', 0),
(2, 'Manchester City vs Bayern Munich', 'Manchester City', 'Bayern Munich', 'Champions League', 3, 2, '12/10/2025', 'pending', 0),
(2, 'Barcelona vs Real Madrid', 'Barcelona', 'Real Madrid', 'La Liga', 1, 1, '12/11/2025', 'pending', 0),
(3, 'Arsenal vs Tottenham', 'Arsenal', 'Tottenham', 'Premier League', 3, 0, '12/9/2025', 'pending', 0),
(3, 'Liverpool vs Chelsea', 'Liverpool', 'Chelsea', 'Premier League', 2, 2, '12/15/2025', 'pending', 0),
(4, 'Manchester City vs Bayern Munich', 'Manchester City', 'Bayern Munich', 'Champions League', 1, 0, '12/10/2025', 'pending', 0);

-- ============================================
-- 3. USER TICKETS (Purchased Tickets)
-- ============================================

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

-- Sample tickets
INSERT INTO user_tickets (user_id, match_title, match_date, stadium, category, quantity, price, total) VALUES
(2, 'Arsenal vs Tottenham', '12/9/2025', 'Emirates Stadium', 'Premium', 2, 150.00, 300.00),
(2, 'Barcelona vs Real Madrid', '12/11/2025', 'Camp Nou', 'Standard', 1, 120.00, 120.00),
(3, 'Manchester City vs Liverpool', '12/20/2025', 'Etihad Stadium', 'VIP', 2, 250.00, 500.00),
(4, 'Arsenal vs Tottenham', '12/9/2025', 'Emirates Stadium', 'Standard', 3, 80.00, 240.00);

-- ============================================
-- 4. RESALE TICKETS
-- ============================================

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

-- Sample resale listings
INSERT INTO resale_tickets (user_ticket_id, seller_id, resale_price, notes, status) VALUES
(3, 3, 220.00, 'Great seats! Cannot attend due to work.', 'available'),
(4, 4, 70.00, 'Selling 3 tickets together', 'available');

-- ============================================
-- 5. FAVORITES - CLUBS
-- ============================================

CREATE TABLE user_favorite_clubs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    club_name VARCHAR(150) NOT NULL,
    club_logo VARCHAR(500),
    league VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_club (user_id, club_name)
);

-- Sample favorite clubs
INSERT INTO user_favorite_clubs (user_id, club_name, club_logo, league) VALUES
(2, 'Arsenal', 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg', 'Premier League'),
(2, 'Barcelona', 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_(crest).svg', 'La Liga'),
(2, 'Bayern Munich', 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg', 'Bundesliga'),
(3, 'Manchester City', 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg', 'Premier League'),
(3, 'Real Madrid', 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg', 'La Liga'),
(4, 'Liverpool', 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg', 'Premier League');

-- ============================================
-- 6. FAVORITES - PLAYERS
-- ============================================

CREATE TABLE user_favorite_players (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    player_name VARCHAR(150) NOT NULL,
    player_photo VARCHAR(500),
    club VARCHAR(100),
    position VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_player (user_id, player_name)
);

-- Sample favorite players
INSERT INTO user_favorite_players (user_id, player_name, player_photo, club, position) VALUES
(2, 'Erling Haaland', 'https://cdn.sofifa.net/players/239/085/25_120.png', 'Manchester City', 'Striker'),
(2, 'Kylian Mbappé', 'https://cdn.sofifa.net/players/231/747/25_120.png', 'Real Madrid', 'Forward'),
(2, 'Kevin De Bruyne', 'https://cdn.sofifa.net/players/192/985/25_120.png', 'Manchester City', 'Midfielder'),
(3, 'Harry Kane', 'https://cdn.sofifa.net/players/202/126/25_120.png', 'Bayern Munich', 'Striker'),
(3, 'Bukayo Saka', 'https://cdn.sofifa.net/players/246/669/25_120.png', 'Arsenal', 'Winger'),
(4, 'Mohamed Salah', 'https://cdn.sofifa.net/players/209/331/25_120.png', 'Liverpool', 'Forward');

-- ============================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_status ON predictions(status);
CREATE INDEX idx_user_tickets_user ON user_tickets(user_id);
CREATE INDEX idx_user_tickets_resale ON user_tickets(resale_listed);
CREATE INDEX idx_resale_status ON resale_tickets(status);
CREATE INDEX idx_resale_seller ON resale_tickets(seller_id);
CREATE INDEX idx_favorite_clubs_user ON user_favorite_clubs(user_id);
CREATE INDEX idx_favorite_players_user ON user_favorite_players(user_id);

-- ============================================
-- DATABASE SETUP COMPLETE
-- ============================================
