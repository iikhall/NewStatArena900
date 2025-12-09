-- StatArena Database Schema
-- This database contains all data currently in the website
-- Created: December 4, 2025

-- Select the database
USE statarena;

-- Drop existing tables to avoid conflicts
DROP TABLE IF EXISTS user_statistics;
DROP TABLE IF EXISTS predictions;
DROP TABLE IF EXISTS ticket_purchases;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS clubs;
DROP TABLE IF EXISTS leagues;
DROP TABLE IF EXISTS users;

-- ============================================
-- 1. USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Should be hashed in production
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Sample user data from the website
INSERT INTO users (name, email, password, role) VALUES
('Khaled', 'k@k.com', 'hashed_password_here', 'admin'),
('Khaled', 'khaled@example.com', 'hashed_password_here', 'user');

-- ============================================
-- 2. LEAGUES
-- ============================================

CREATE TABLE leagues (
    league_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    logo_url VARCHAR(500),
    season VARCHAR(20) DEFAULT '2023/24',
    total_teams INT DEFAULT 20,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO leagues (name, country, logo_url, total_teams) VALUES
('Premier League', 'England', 'https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg', 20),
('La Liga', 'Spain', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/LaLiga_logo_2023.svg/1200px-LaLiga_logo_2023.svg.png', 20),
('Serie A', 'Italy', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_Serie_A_%282024%29.svg/440px-Logo_Serie_A_%282024%29.svg.png', 20),
('Bundesliga', 'Germany', 'https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Bundesliga_logo_%282017%29.svg/440px-Bundesliga_logo_%282017%29.svg.png', 20),
('Ligue 1', 'France', 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Ligue_1_Logo_%282008-2024%29.svg', 20);

-- ============================================
-- 3. CLUBS
-- ============================================

CREATE TABLE clubs (
    club_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    league_id INT,
    logo_url VARCHAR(500),
    stadium VARCHAR(150),
    stadium_capacity INT,
    founded_year INT,
    market_value VARCHAR(50),
    points INT DEFAULT 0,
    goals_scored INT DEFAULT 0,
    goal_difference INT DEFAULT 0,
    wins INT DEFAULT 0,
    draws INT DEFAULT 0,
    losses INT DEFAULT 0,
    favorites_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (league_id) REFERENCES leagues(league_id)
);

INSERT INTO clubs (name, league_id, logo_url, stadium, stadium_capacity, founded_year, market_value, points, goals_scored, goal_difference, wins, draws, losses, favorites_count) VALUES
('Bayern Munich', 4, 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg', 'Allianz Arena', 0, 1900, '€1.1B', 91, 85, 63, 30, 3, 1, 317000),
('Manchester City', 1, 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg', 'Etihad Stadium', 0, 1880, '€1.2B', 89, 71, 41, 28, 4, 3, 281000),
('Real Madrid', 2, 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg', 'Santiago Bernabéu', 0, 1902, '€1.5B', 88, 75, 50, 28, 5, 2, 368000),
('Arsenal', 1, 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg', 'Emirates Stadium', 0, 1886, '€1.0B', 68, 60, 28, 21, 5, 4, 0),
('Barcelona', 2, 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg', 'Camp Nou', 99354, 1899, '€1.3B', 0, 0, 0, 0, 0, 0, 0),
('AC Milan', 3, 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg', 'San Siro', 80018, 1899, '€850M', 0, 0, 0, 0, 0, 0, 0),
('Inter Milan', 3, 'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg', 'San Siro', 80018, 1908, '€900M', 0, 0, 0, 0, 0, 0, 0),
('Manchester United', 1, 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg', 'Old Trafford', 74879, 1878, '€1.1B', 0, 0, 0, 0, 0, 0, 0),
('Newcastle United', 1, 'https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg', 'St James Park', 52305, 1892, '€700M', 0, 0, 0, 0, 0, 0, 0),
('Tottenham', 1, 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg', 'Tottenham Hotspur Stadium', 62850, 1882, '€950M', 0, 0, 0, 0, 0, 0, 0),
('Brighton', 1, 'https://upload.wikimedia.org/wikipedia/en/f/fd/Brighton_%26_Hove_Albion_logo.svg', 'Amex Stadium', 31800, 1901, '€500M', 0, 0, 0, 0, 0, 0, 0),
('Leeds United', 1, NULL, 'Elland Road', 37890, 1919, '€300M', 0, 0, 0, 0, 0, 0, 0),
('Burnley', 1, 'https://upload.wikimedia.org/wikipedia/en/6/6d/Burnley_FC_Logo.svg', 'Turf Moor', 21944, 1882, '€200M', 0, 0, 0, 0, 0, 0, 0),
('Crystal Palace', 1, 'https://upload.wikimedia.org/wikipedia/en/a/a2/Crystal_Palace_FC_logo_%282022%29.svg', 'Selhurst Park', 25486, 1905, '€350M', 0, 0, 0, 0, 0, 0, 0),
('Brentford', 1, 'https://upload.wikimedia.org/wikipedia/en/2/2a/Brentford_FC_crest.svg', 'Gtech Community Stadium', 17250, 1889, '€320M', 0, 0, 0, 0, 0, 0, 0),
('Liverpool', 1, 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg', 'Anfield', 53394, 1892, '€1.2B', 63, 65, 25, 19, 6, 4, 0),
('Paris Saint-Germain', 5, NULL, 'Parc des Princes', 47929, 1970, '€1.4B', 0, 0, 0, 0, 0, 0, 0),
('Olympique Marseille', 5, NULL, 'Stade Vélodrome', 67394, 1899, '€400M', 0, 0, 0, 0, 0, 0, 0),
('Lyon', 5, NULL, 'Groupama Stadium', 59186, 1950, '€450M', 0, 0, 0, 0, 0, 0, 0),
('Monaco', 5, NULL, 'Stade Louis II', 18523, 1924, '€380M', 0, 0, 0, 0, 0, 0, 0),
('Lille', 5, NULL, 'Stade Pierre-Mauroy', 50186, 1944, '€420M', 0, 0, 0, 0, 0, 0, 0),
-- Additional La Liga clubs
('Atlético Madrid', 2, 'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg', 'Wanda Metropolitano', 68000, 1903, '€700M', 0, 0, 0, 0, 0, 0, 0),
('Sevilla', 2, 'https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg', 'Ramón Sánchez Pizjuán', 43883, 1890, '€350M', 0, 0, 0, 0, 0, 0, 0),
('Real Betis', 2, 'https://upload.wikimedia.org/wikipedia/en/1/13/Real_betis_logo.svg', 'Benito Villamarín', 60720, 1907, '€280M', 0, 0, 0, 0, 0, 0, 0),
('Villarreal', 2, 'https://upload.wikimedia.org/wikipedia/en/b/b9/Villarreal_CF_logo-en.svg', 'Estadio de la Cerámica', 23500, 1923, '€300M', 0, 0, 0, 0, 0, 0, 0),
('Real Sociedad', 2, 'https://upload.wikimedia.org/wikipedia/en/f/f1/Real_Sociedad_logo.svg', 'Anoeta Stadium', 39500, 1909, '€320M', 0, 0, 0, 0, 0, 0, 0),
('Athletic Bilbao', 2, 'https://upload.wikimedia.org/wikipedia/en/9/98/Club_Athletic_Bilbao_logo.svg', 'San Mamés', 53000, 1898, '€380M', 0, 0, 0, 0, 0, 0, 0),
('Valencia', 2, 'https://upload.wikimedia.org/wikipedia/en/c/ce/Valenciacf.svg', 'Mestalla', 49430, 1919, '€260M', 0, 0, 0, 0, 0, 0, 0),
('Getafe', 2, 'https://upload.wikimedia.org/wikipedia/en/4/46/Getafe_logo.svg', 'Coliseum Alfonso Pérez', 17700, 1983, '€120M', 0, 0, 0, 0, 0, 0, 0),
-- Additional Serie A clubs
('Juventus', 3, 'https://upload.wikimedia.org/wikipedia/commons/3/36/Juventus_FC_-_pictogram_black_%28Italy%2C_2017%29.svg', 'Allianz Stadium', 41507, 1897, '€800M', 0, 0, 0, 0, 0, 0, 0),
('Napoli', 3, 'https://upload.wikimedia.org/wikipedia/commons/2/2d/SSC_Neapel.svg', 'Stadio Diego Armando Maradona', 54726, 1926, '€620M', 0, 0, 0, 0, 0, 0, 0),
('Roma', 3, 'https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg', 'Stadio Olimpico', 70634, 1927, '€550M', 0, 0, 0, 0, 0, 0, 0),
('Lazio', 3, 'https://upload.wikimedia.org/wikipedia/en/c/ce/S.S._Lazio_badge.svg', 'Stadio Olimpico', 70634, 1900, '€420M', 0, 0, 0, 0, 0, 0, 0),
('Atalanta', 3, 'https://upload.wikimedia.org/wikipedia/en/6/66/AtalantaBC.svg', 'Gewiss Stadium', 21747, 1907, '€380M', 0, 0, 0, 0, 0, 0, 0),
('Fiorentina', 3, 'https://upload.wikimedia.org/wikipedia/commons/2/2e/ACF_Fiorentina.svg', 'Stadio Artemio Franchi', 43147, 1926, '€340M', 0, 0, 0, 0, 0, 0, 0),
('Torino', 3, 'https://upload.wikimedia.org/wikipedia/en/2/2e/Torino_FC_Logo.svg', 'Stadio Olimpico Grande Torino', 27958, 1906, '€250M', 0, 0, 0, 0, 0, 0, 0),
('Bologna', 3, 'https://upload.wikimedia.org/wikipedia/commons/9/93/Bologna_FC_1909.svg', 'Stadio Renato Dall\'Ara', 36462, 1909, '€180M', 0, 0, 0, 0, 0, 0, 0),
-- Additional Bundesliga clubs
('Borussia Dortmund', 4, 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg', 'Signal Iduna Park', 81365, 1909, '€750M', 0, 0, 0, 0, 0, 0, 0),
('RB Leipzig', 4, 'https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg', 'Red Bull Arena', 47069, 2009, '€650M', 0, 0, 0, 0, 0, 0, 0),
('Bayer Leverkusen', 4, 'https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg', 'BayArena', 30210, 1904, '€580M', 0, 0, 0, 0, 0, 0, 0),
('Union Berlin', 4, 'https://upload.wikimedia.org/wikipedia/commons/4/44/1._FC_Union_Berlin_Logo.svg', 'An der Alten Försterei', 22012, 1966, '€220M', 0, 0, 0, 0, 0, 0, 0),
('Eintracht Frankfurt', 4, 'https://upload.wikimedia.org/wikipedia/commons/0/04/Eintracht_Frankfurt_Logo.svg', 'Deutsche Bank Park', 51500, 1899, '€280M', 0, 0, 0, 0, 0, 0, 0),
('SC Freiburg', 4, 'https://upload.wikimedia.org/wikipedia/en/1/11/SC_Freiburg_logo.svg', 'Europa-Park Stadion', 34700, 1904, '€180M', 0, 0, 0, 0, 0, 0, 0),
('Wolfsburg', 4, 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Logo-VfL-Wolfsburg.svg', 'Volkswagen Arena', 30000, 1945, '€320M', 0, 0, 0, 0, 0, 0, 0),
('Borussia Mönchengladbach', 4, 'https://upload.wikimedia.org/wikipedia/commons/8/81/Borussia_M%C3%B6nchengladbach_logo.svg', 'Borussia-Park', 54057, 1900, '€260M', 0, 0, 0, 0, 0, 0, 0),
('Hoffenheim', 4, 'https://upload.wikimedia.org/wikipedia/commons/6/64/TSG_1899_Hoffenheim_logo.svg', 'PreZero Arena', 30150, 1899, '€240M', 0, 0, 0, 0, 0, 0, 0),
-- Additional Ligue 1 clubs
('Nice', 5, 'https://upload.wikimedia.org/wikipedia/en/a/a5/OGC_Nice_logo.svg', 'Allianz Riviera', 35624, 1904, '€250M', 0, 0, 0, 0, 0, 0, 0),
('Lens', 5, 'https://upload.wikimedia.org/wikipedia/en/c/c2/RC_Lens_logo.svg', 'Stade Bollaert-Delelis', 38223, 1906, '€180M', 0, 0, 0, 0, 0, 0, 0),
('Rennes', 5, 'https://upload.wikimedia.org/wikipedia/en/2/26/Stade_Rennais_FC.svg', 'Roazhon Park', 29778, 1901, '€200M', 0, 0, 0, 0, 0, 0, 0),
('Strasbourg', 5, 'https://upload.wikimedia.org/wikipedia/commons/9/97/Racing_Club_de_Strasbourg_Alsace_%28logo%2C_2019%29.svg', 'Stade de la Meinau', 26109, 1906, '€140M', 0, 0, 0, 0, 0, 0, 0),
('Montpellier', 5, 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Montpellier_HSC_%28logo%2C_2000%29.svg', 'Stade de la Mosson', 32900, 1974, '€130M', 0, 0, 0, 0, 0, 0, 0),
-- Extra Premier League clubs
('Chelsea', 1, 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg', 'Stamford Bridge', 40834, 1905, '€1.0B', 0, 0, 0, 0, 0, 0, 0);

-- Top players per club
CREATE TABLE club_top_players (
    id INT PRIMARY KEY AUTO_INCREMENT,
    club_id INT,
    players_list TEXT,
    FOREIGN KEY (club_id) REFERENCES clubs(club_id)
);

INSERT INTO club_top_players (club_id, players_list) VALUES
(1, 'Jamal Musiala • Joshua Kimmich • Thomas Müller'),
(2, 'Erling Haaland • Kevin De Bruyne • Rodri'),
(3, 'Karim Benzema • Vinícius Jr. • Luka Modrić');

-- ============================================
-- 4. PLAYERS
-- ============================================

CREATE TABLE players (
    player_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    club_id INT,
    position ENUM('Goalkeeper', 'Defender', 'Midfielder', 'Forward') NOT NULL,
    jersey_number INT,
    country VARCHAR(100),
    age INT,
    market_value VARCHAR(50),
    rating DECIMAL(3,1),
    goals INT DEFAULT 0,
    assists INT DEFAULT 0,
    speed INT,
    image_url VARCHAR(500),
    favorites_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES clubs(club_id)
);

INSERT INTO players (name, club_id, position, jersey_number, country, age, market_value, rating, goals, assists, speed, image_url, favorites_count) VALUES
('Erling Haaland', 2, 'Forward', 9, 'NORWAY', 23, '€180M', 9.2, 28, 5, 92, 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Erling_Haaland_2023_%28cropped%29.jpg/440px-Erling_Haaland_2023_%28cropped%29.jpg', 444000),
('Kylian Mbappé', 17, 'Forward', 7, 'FRANCE', 25, '€160M', 9.0, 25, 8, 97, 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/2019-07-17_SG_Dynamo_Dresden_vs._Paris_Saint-Germain_by_Sandro_Halank%E2%80%93129_%28cropped%29.jpg/440px-2019-07-17_SG_Dynamo_Dresden_vs._Paris_Saint-Germain_by_Sandro_Halank%E2%80%93129_%28cropped%29.jpg', 418000),
('Harry Kane', 1, 'Forward', 9, 'ENGLAND', 30, '€100M', 8.8, 22, 12, 75, 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Harry_Kane_2024.jpg/440px-Harry_Kane_2024.jpg', 393000),
('Kevin De Bruyne', 2, 'Midfielder', 17, 'BELGIUM', 32, '€90M', 8.6, 8, 18, 76, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Kevin_De_Bruyne_Manchester_City.jpg/440px-Kevin_De_Bruyne_Manchester_City.jpg', 367000);

-- Players in Match Details (Manchester City vs Arsenal)
INSERT INTO players (name, club_id, position, jersey_number, country) VALUES
-- Manchester City Players
('Ederson', 2, 'Goalkeeper', 1, 'BRAZIL'),
('Kyle Walker', 2, 'Defender', 2, 'ENGLAND'),
('John Stones', 2, 'Defender', 5, 'ENGLAND'),
('Ruben Dias', 2, 'Defender', 3, 'PORTUGAL'),
('Nathan Ake', 2, 'Defender', 6, 'NETHERLANDS'),
('Rodri', 2, 'Midfielder', 16, 'SPAIN'),
('Bernardo Silva', 2, 'Midfielder', 20, 'PORTUGAL'),
('Phil Foden', 2, 'Forward', 47, 'ENGLAND'),
('Jack Grealish', 2, 'Forward', 10, 'ENGLAND'),
-- Arsenal Players
('Aaron Ramsdale', 4, 'Goalkeeper', 1, 'ENGLAND'),
('Ben White', 4, 'Defender', 4, 'ENGLAND'),
('Gabriel', 4, 'Defender', 6, 'BRAZIL'),
('William Saliba', 4, 'Defender', 2, 'FRANCE'),
('Oleksandr Zinchenko', 4, 'Defender', 35, 'UKRAINE'),
('Martin Odegaard', 4, 'Midfielder', 8, 'NORWAY'),
('Thomas Partey', 4, 'Midfielder', 5, 'GHANA'),
('Declan Rice', 4, 'Midfielder', 41, 'ENGLAND'),
('Gabriel Martinelli', 4, 'Forward', 11, 'BRAZIL'),
('Eddie Nketiah', 4, 'Forward', 14, 'ENGLAND'),
('Bukayo Saka', 4, 'Forward', 7, 'ENGLAND');

-- ============================================
-- 5. MATCHES
-- ============================================

CREATE TABLE matches (
    match_id INT PRIMARY KEY AUTO_INCREMENT,
    home_club_id INT NOT NULL,
    away_club_id INT NOT NULL,
    league_id INT,
    match_date DATETIME,
    venue VARCHAR(200),
    status ENUM('Upcoming', 'LIVE', 'Finished') DEFAULT 'Upcoming',
    home_score INT DEFAULT NULL,
    away_score INT DEFAULT NULL,
    match_minute VARCHAR(10) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (home_club_id) REFERENCES clubs(club_id),
    FOREIGN KEY (away_club_id) REFERENCES clubs(club_id),
    FOREIGN KEY (league_id) REFERENCES leagues(league_id)
);

INSERT INTO matches (home_club_id, away_club_id, league_id, status, home_score, away_score, match_minute) VALUES
-- Live Matches
(2, 4, 1, 'LIVE', 1, 1, '10'''),  -- Manchester City vs Arsenal
(3, 5, 2, 'LIVE', 1, 2, '35'''),  -- Real Madrid vs Barcelona
(6, 7, 3, 'LIVE', 2, 2, '64'''),  -- AC Milan vs Inter Milan
-- Upcoming Matches
(8, 9, 1, 'Upcoming', NULL, NULL, NULL),  -- Manchester United vs Newcastle
(4, 10, 1, 'Upcoming', NULL, NULL, NULL),  -- Arsenal vs Tottenham
-- Finished Matches
(11, 12, 1, 'Finished', 3, 0, 'FT'),  -- Brighton vs Leeds
(13, 4, 1, 'Finished', 0, 2, 'FT'),  -- Burnley vs Arsenal
(14, 15, 1, 'Finished', 2, 0, 'FT');  -- Crystal Palace vs Brentford

-- ============================================
-- 6. MATCH STATISTICS
-- ============================================

CREATE TABLE match_statistics (
    stat_id INT PRIMARY KEY AUTO_INCREMENT,
    match_id INT NOT NULL,
    possession_home INT,
    possession_away INT,
    xg_home DECIMAL(3,2),
    xg_away DECIMAL(3,2),
    big_chances_home INT,
    big_chances_away INT,
    total_shots_home INT,
    total_shots_away INT,
    shots_on_target_home INT,
    shots_on_target_away INT,
    corners_home INT,
    corners_away INT,
    passes_home INT,
    passes_away INT,
    tackles_home INT,
    tackles_away INT,
    free_kicks_home INT,
    free_kicks_away INT,
    FOREIGN KEY (match_id) REFERENCES matches(match_id)
);

INSERT INTO match_statistics (match_id, possession_home, possession_away, xg_home, xg_away, big_chances_home, big_chances_away, total_shots_home, total_shots_away, shots_on_target_home, shots_on_target_away, corners_home, corners_away, passes_home, passes_away, tackles_home, tackles_away, free_kicks_home, free_kicks_away) VALUES
-- Manchester City vs Arsenal (match_id 1)
(1, 50, 50, 2.99, 0.46, 3, 1, 14, 5, 6, 2, 10, 2, 478, 467, 24, 12, 7, 10);

-- ============================================
-- 7. MATCH LINEUPS
-- ============================================

CREATE TABLE match_lineups (
    lineup_id INT PRIMARY KEY AUTO_INCREMENT,
    match_id INT NOT NULL,
    player_id INT NOT NULL,
    club_id INT NOT NULL,
    position_role ENUM('GK', 'DF', 'MF', 'FW') NOT NULL,
    is_starting BOOLEAN DEFAULT TRUE,
    is_captain BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (match_id) REFERENCES matches(match_id),
    FOREIGN KEY (player_id) REFERENCES players(player_id),
    FOREIGN KEY (club_id) REFERENCES clubs(club_id)
);

-- Manchester City vs Arsenal Lineups (match_id 1)
INSERT INTO match_lineups (match_id, player_id, club_id, position_role, is_starting) VALUES
-- Manchester City (assuming player_ids 5-13 based on insert order)
(1, 5, 2, 'GK', TRUE),   -- Ederson
(1, 6, 2, 'DF', TRUE),   -- Kyle Walker
(1, 7, 2, 'DF', TRUE),   -- John Stones
(1, 8, 2, 'DF', TRUE),   -- Ruben Dias
(1, 9, 2, 'DF', TRUE),   -- Nathan Ake
(1, 1, 2, 'MF', TRUE),   -- De Bruyne
(1, 10, 2, 'MF', TRUE),  -- Rodri
(1, 11, 2, 'MF', TRUE),  -- Bernardo Silva
(1, 12, 2, 'FW', TRUE),  -- Foden
(1, 1, 2, 'FW', TRUE),   -- Haaland
(1, 13, 2, 'FW', TRUE),  -- Grealish
-- Arsenal (assuming player_ids 14-24 based on insert order)
(1, 14, 4, 'GK', TRUE),  -- Ramsdale
(1, 15, 4, 'DF', TRUE),  -- White
(1, 16, 4, 'DF', TRUE),  -- Gabriel
(1, 17, 4, 'DF', TRUE),  -- Saliba
(1, 18, 4, 'DF', TRUE),  -- Zinchenko
(1, 19, 4, 'MF', TRUE),  -- Odegaard
(1, 20, 4, 'MF', TRUE),  -- Partey
(1, 21, 4, 'MF', TRUE),  -- Rice
(1, 22, 4, 'FW', TRUE),  -- Martinelli
(1, 23, 4, 'FW', TRUE),  -- Nketiah
(1, 24, 4, 'FW', TRUE);  -- Saka

-- ============================================
-- 8. LEAGUE STANDINGS
-- ============================================

CREATE TABLE league_standings (
    standing_id INT PRIMARY KEY AUTO_INCREMENT,
    league_id INT NOT NULL,
    club_id INT NOT NULL,
    position INT NOT NULL,
    played INT DEFAULT 0,
    won INT DEFAULT 0,
    drawn INT DEFAULT 0,
    lost INT DEFAULT 0,
    goals_for INT DEFAULT 0,
    goals_against INT DEFAULT 0,
    goal_difference INT DEFAULT 0,
    points INT DEFAULT 0,
    season VARCHAR(20) DEFAULT '2023/24',
    FOREIGN KEY (league_id) REFERENCES leagues(league_id),
    FOREIGN KEY (club_id) REFERENCES clubs(club_id)
);

-- First, add form column to league_standings table
ALTER TABLE league_standings ADD COLUMN form VARCHAR(10) DEFAULT 'WWDLL';

INSERT INTO league_standings (league_id, club_id, position, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, form) VALUES
-- Premier League Standings (League 1)
(1, 2, 1, 30, 23, 4, 3, 73, 32, 41, 73, 'WWWWD'),   -- Manchester City
(1, 4, 2, 30, 21, 5, 4, 68, 40, 28, 68, 'WWDWW'),   -- Arsenal
(1, 16, 3, 29, 19, 6, 4, 65, 40, 25, 63, 'WWLWD'),  -- Liverpool
(1, 17, 4, 30, 17, 7, 6, 58, 40, 18, 58, 'WDWLW'),  -- Chelsea
(1, 10, 5, 30, 16, 6, 8, 54, 39, 15, 54, 'LWWDW'),  -- Tottenham
(1, 8, 6, 30, 15, 7, 8, 48, 38, 10, 52, 'WDWWL'),   -- Manchester United
(1, 9, 7, 30, 14, 8, 8, 45, 40, 5, 50, 'DDWLW'),    -- Newcastle United
(1, 11, 8, 30, 13, 9, 8, 42, 40, 2, 48, 'WDLWD'),   -- Brighton
(1, 14, 9, 30, 12, 8, 10, 40, 42, -2, 44, 'LWDLW'),  -- Crystal Palace
(1, 15, 10, 30, 11, 9, 10, 38, 40, -2, 42, 'DWDLL'),  -- Brentford
(1, 12, 11, 29, 10, 8, 11, 35, 42, -7, 38, 'LLDWL'),  -- Leeds United
(1, 13, 12, 30, 8, 9, 13, 32, 48, -16, 33, 'LLLWD'),  -- Burnley

-- La Liga Standings (League 2)
(2, 3, 1, 30, 24, 3, 3, 75, 30, 45, 75, 'WWWWW'),   -- Real Madrid
(2, 5, 2, 30, 22, 5, 3, 70, 32, 38, 71, 'WWDWW'),   -- Barcelona
(2, 21, 3, 30, 18, 7, 5, 58, 38, 20, 61, 'WDWLW'),  -- Atlético Madrid
(2, 22, 4, 30, 16, 8, 6, 52, 40, 12, 56, 'DWWDW'),  -- Sevilla
(2, 23, 5, 30, 15, 9, 6, 48, 38, 10, 54, 'WDWWD'),  -- Real Betis
(2, 24, 6, 30, 14, 9, 7, 45, 40, 5, 51, 'WWLDD'),   -- Villarreal
(2, 25, 7, 30, 13, 10, 7, 42, 38, 4, 49, 'DDWLW'),  -- Real Sociedad
(2, 26, 8, 30, 12, 10, 8, 40, 40, 0, 46, 'LWDWD'),  -- Athletic Bilbao
(2, 27, 9, 30, 11, 9, 10, 38, 42, -4, 42, 'DLLWW'),  -- Valencia
(2, 28, 10, 30, 10, 10, 10, 35, 42, -7, 40, 'WDLDL'),  -- Getafe

-- Serie A Standings (League 3)
(3, 6, 1, 30, 23, 4, 3, 68, 28, 40, 73, 'WWWWD'),   -- AC Milan
(3, 7, 2, 30, 22, 5, 3, 70, 32, 38, 71, 'WWWDW'),   -- Inter Milan
(3, 29, 3, 30, 20, 6, 4, 62, 30, 32, 66, 'WDWWW'),  -- Juventus
(3, 30, 4, 30, 18, 7, 5, 58, 38, 20, 61, 'WWLDW'),  -- Napoli
(3, 31, 5, 30, 16, 8, 6, 52, 40, 12, 56, 'WDWDW'),  -- Roma
(3, 32, 6, 30, 15, 8, 7, 48, 38, 10, 53, 'DWWLW'),  -- Lazio
(3, 33, 7, 30, 14, 9, 7, 45, 40, 5, 51, 'WDLWD'),   -- Atalanta
(3, 34, 8, 30, 13, 9, 8, 42, 40, 2, 48, 'LWDWW'),   -- Fiorentina
(3, 35, 9, 30, 12, 8, 10, 38, 42, -4, 44, 'LLWDW'),  -- Torino
(3, 36, 10, 30, 10, 10, 10, 35, 42, -7, 40, 'DWDLL'),  -- Bologna

-- Bundesliga Standings (League 4)
(4, 1, 1, 30, 25, 3, 2, 85, 22, 63, 78, 'WWWWW'),   -- Bayern Munich
(4, 37, 2, 30, 20, 6, 4, 68, 35, 33, 66, 'WWDWW'),  -- Borussia Dortmund
(4, 38, 3, 30, 18, 7, 5, 62, 38, 24, 61, 'WDWLW'),  -- RB Leipzig
(4, 39, 4, 30, 17, 7, 6, 58, 40, 18, 58, 'WWDLW'),  -- Bayer Leverkusen
(4, 40, 5, 30, 15, 8, 7, 52, 42, 10, 53, 'DWWDW'),  -- Union Berlin
(4, 41, 6, 30, 14, 9, 7, 48, 40, 8, 51, 'WDLWW'),   -- Eintracht Frankfurt
(4, 42, 7, 30, 13, 9, 8, 45, 42, 3, 48, 'LWDWD'),   -- SC Freiburg
(4, 43, 8, 30, 12, 9, 9, 42, 42, 0, 45, 'WDLDW'),   -- Wolfsburg
(4, 44, 9, 30, 11, 8, 11, 38, 45, -7, 41, 'LLWDL'),  -- Borussia Mönchengladbach
(4, 45, 10, 30, 10, 9, 11, 35, 48, -13, 39, 'DWLLL'),  -- Hoffenheim

-- Ligue 1 Standings (League 5)
(5, 17, 1, 30, 24, 4, 2, 75, 25, 50, 76, 'WWWWW'),  -- Paris Saint-Germain
(5, 18, 2, 30, 19, 7, 4, 62, 32, 30, 64, 'WWDWW'),  -- Olympique Marseille
(5, 19, 3, 30, 18, 6, 6, 58, 35, 23, 60, 'WDWLW'),  -- Lyon
(5, 20, 4, 30, 16, 8, 6, 52, 38, 14, 56, 'DWWDW'),  -- Monaco
(5, 21, 5, 30, 15, 8, 7, 48, 38, 10, 53, 'WDWWD'),  -- Lille
(5, 46, 6, 30, 14, 9, 7, 45, 40, 5, 51, 'WWLDD'),   -- Nice
(5, 47, 7, 30, 13, 9, 8, 42, 40, 2, 48, 'DWDLW'),   -- Lens
(5, 48, 8, 30, 12, 9, 9, 40, 42, -2, 45, 'LWDWD'),  -- Rennes
(5, 49, 9, 30, 11, 8, 11, 38, 45, -7, 41, 'LLDWW'),  -- Strasbourg
(5, 50, 10, 30, 10, 9, 11, 35, 48, -13, 39, 'DWLLL');  -- Montpellier

-- ============================================
-- 9. PREDICTIONS
-- ============================================

CREATE TABLE predictions (
    prediction_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    match_id INT NOT NULL,
    predicted_home_score INT NOT NULL,
    predicted_away_score INT NOT NULL,
    predicted_winner ENUM('home', 'away', 'draw'),
    points_earned INT DEFAULT 0,
    is_correct BOOLEAN DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (match_id) REFERENCES matches(match_id)
);

INSERT INTO predictions (user_id, match_id, predicted_home_score, predicted_away_score, predicted_winner, points_earned) VALUES
(1, 1, 2, 3, 'away', 10),  -- Khaled predicted Man City 2-3 Arsenal
(1, 2, 1, 2, 'away', 10),  -- Khaled predicted Real Madrid 1-2 Barcelona
(1, 3, 3, 2, 'home', 10),  -- Khaled predicted AC Milan 3-2 Inter
(1, 8, 2, 1, 'home', 10);  -- Khaled predicted Crystal Palace 2-1 Brentford

-- ============================================
-- 10. USER STATISTICS
-- ============================================

CREATE TABLE user_statistics (
    stat_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    total_points INT DEFAULT 0,
    total_predictions INT DEFAULT 0,
    correct_predictions INT DEFAULT 0,
    accuracy_percentage DECIMAL(5,2) DEFAULT 0.00,
    global_rank INT DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

INSERT INTO user_statistics (user_id, total_points, total_predictions, correct_predictions, accuracy_percentage) VALUES
(1, 40, 4, 0, 0.00);

-- ============================================
-- 11. TICKETS
-- ============================================

CREATE TABLE tickets (
    ticket_id INT PRIMARY KEY AUTO_INCREMENT,
    match_id INT NOT NULL,
    ticket_type VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    location VARCHAR(200),
    match_date_display VARCHAR(100),
    availability INT DEFAULT 1,
    is_instant_booking BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(match_id)
);

-- Note: Tickets in the website are for Ligue 1 matches not in our matches table
-- These would need specific match entries first

-- ============================================
-- 12. USER TICKETS (Purchased Tickets)
-- ============================================

CREATE TABLE user_tickets (
    user_ticket_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    ticket_id INT NOT NULL,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quantity INT DEFAULT 1,
    total_price DECIMAL(10,2),
    status ENUM('active', 'used', 'cancelled') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
);

-- ============================================
-- 13. FAVORITES
-- ============================================

CREATE TABLE user_favorite_clubs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    club_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (club_id) REFERENCES clubs(club_id),
    UNIQUE KEY unique_user_club (user_id, club_id)
);

CREATE TABLE user_favorite_players (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    player_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (player_id) REFERENCES players(player_id),
    UNIQUE KEY unique_user_player (user_id, player_id)
);

-- ============================================
-- 14. RESELL MARKETPLACE
-- ============================================

CREATE TABLE resell_tickets (
    resell_id INT PRIMARY KEY AUTO_INCREMENT,
    user_ticket_id INT NOT NULL,
    seller_user_id INT NOT NULL,
    asking_price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2) NOT NULL,
    status ENUM('listed', 'sold', 'cancelled') DEFAULT 'listed',
    buyer_user_id INT DEFAULT NULL,
    listed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sold_at TIMESTAMP NULL,
    FOREIGN KEY (user_ticket_id) REFERENCES user_tickets(user_ticket_id),
    FOREIGN KEY (seller_user_id) REFERENCES users(user_id),
    FOREIGN KEY (buyer_user_id) REFERENCES users(user_id)
);

-- ============================================
-- 15. ADMIN LOGS
-- ============================================

CREATE TABLE admin_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    admin_user_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    target_table VARCHAR(100),
    target_id INT,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_user_id) REFERENCES users(user_id)
);

-- ============================================
-- INDEXES for Performance
-- ============================================

CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_players_club ON players(club_id);
CREATE INDEX idx_players_position ON players(position);
CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_match ON predictions(match_id);
CREATE INDEX idx_standings_league ON league_standings(league_id);
CREATE INDEX idx_standings_position ON league_standings(position);

-- ============================================
-- VIEWS for Common Queries
-- ============================================

-- View for Live Matches with Club Details
CREATE VIEW vw_live_matches AS
SELECT 
    m.match_id,
    m.status,
    m.home_score,
    m.away_score,
    m.match_minute,
    hc.name AS home_team,
    hc.logo_url AS home_logo,
    ac.name AS away_team,
    ac.logo_url AS away_logo,
    l.name AS league_name
FROM matches m
JOIN clubs hc ON m.home_club_id = hc.club_id
JOIN clubs ac ON m.away_club_id = ac.club_id
LEFT JOIN leagues l ON m.league_id = l.league_id
WHERE m.status = 'LIVE';

-- View for User Leaderboard
CREATE VIEW vw_leaderboard AS
SELECT 
    u.name,
    us.total_points,
    us.total_predictions,
    us.correct_predictions,
    us.accuracy_percentage,
    us.global_rank
FROM user_statistics us
JOIN users u ON us.user_id = u.user_id
ORDER BY us.total_points DESC, us.accuracy_percentage DESC;

-- View for Club Stats with Form
CREATE VIEW vw_club_stats AS
SELECT 
    c.club_id,
    c.name,
    c.logo_url,
    c.points,
    c.goals_scored,
    c.goal_difference,
    c.wins,
    c.draws,
    c.losses,
    c.favorites_count,
    l.name AS league_name,
    ctp.players_list AS top_players
FROM clubs c
LEFT JOIN leagues l ON c.league_id = l.league_id
LEFT JOIN club_top_players ctp ON c.club_id = ctp.club_id;

-- ============================================
-- ADDITIONAL PLAYER STATISTICS FIELDS
-- ============================================
-- Adding detailed player statistics for player details page

ALTER TABLE players 
ADD COLUMN matches_played INT DEFAULT 0 AFTER assists,
ADD COLUMN minutes_played INT DEFAULT 0 AFTER matches_played,
ADD COLUMN yellow_cards INT DEFAULT 0 AFTER minutes_played,
ADD COLUMN red_cards INT DEFAULT 0 AFTER yellow_cards,
ADD COLUMN clean_sheets INT DEFAULT 0 AFTER red_cards,
ADD COLUMN pass_accuracy DECIMAL(5,2) DEFAULT 0.00 AFTER clean_sheets,
ADD COLUMN shots_on_target INT DEFAULT 0 AFTER pass_accuracy,
ADD COLUMN dribbles_completed INT DEFAULT 0 AFTER shots_on_target,
ADD COLUMN tackles_won INT DEFAULT 0 AFTER dribbles_completed,
ADD COLUMN interceptions INT DEFAULT 0 AFTER tackles_won,
ADD COLUMN aerial_duels_won INT DEFAULT 0 AFTER interceptions,
ADD COLUMN saves INT DEFAULT 0 AFTER aerial_duels_won,
ADD COLUMN penalties_scored INT DEFAULT 0 AFTER saves,
ADD COLUMN penalties_missed INT DEFAULT 0 AFTER penalties_scored,
ADD COLUMN photo_url VARCHAR(500) AFTER image_url,
ADD COLUMN height VARCHAR(10) AFTER age,
ADD COLUMN foot ENUM('Left', 'Right', 'Both') DEFAULT 'Right' AFTER height,
ADD COLUMN date_of_birth DATE AFTER country,
ADD COLUMN place_of_birth VARCHAR(100) AFTER date_of_birth,
ADD COLUMN international_caps INT DEFAULT 0 AFTER penalties_missed,
ADD COLUMN international_goals INT DEFAULT 0 AFTER international_caps;

-- Update existing players with sample detailed statistics
UPDATE players SET 
    matches_played = 30, minutes_played = 2700, yellow_cards = 2, red_cards = 0,
    clean_sheets = 0, pass_accuracy = 85.5, shots_on_target = 45, dribbles_completed = 32,
    tackles_won = 15, interceptions = 8, aerial_duels_won = 55, saves = 0,
    penalties_scored = 3, penalties_missed = 1, photo_url = image_url,
    height = '194 cm', foot = 'Left', date_of_birth = '2000-07-21', place_of_birth = 'Leeds',
    international_caps = 30, international_goals = 28
WHERE player_id = 1; -- Erling Haaland

UPDATE players SET 
    matches_played = 35, minutes_played = 3150, yellow_cards = 3, red_cards = 0,
    clean_sheets = 0, pass_accuracy = 88.2, shots_on_target = 52, dribbles_completed = 78,
    tackles_won = 20, interceptions = 15, aerial_duels_won = 30, saves = 0,
    penalties_scored = 5, penalties_missed = 0, photo_url = image_url,
    height = '178 cm', foot = 'Right', date_of_birth = '1998-12-20', place_of_birth = 'Paris',
    international_caps = 78, international_goals = 48
WHERE player_id = 2; -- Kylian Mbappé

UPDATE players SET 
    matches_played = 34, minutes_played = 3060, yellow_cards = 1, red_cards = 0,
    clean_sheets = 0, pass_accuracy = 82.7, shots_on_target = 48, dribbles_completed = 25,
    tackles_won = 12, interceptions = 10, aerial_duels_won = 95, saves = 0,
    penalties_scored = 4, penalties_missed = 2, photo_url = image_url,
    height = '188 cm', foot = 'Right', date_of_birth = '1993-07-28', place_of_birth = 'London',
    international_caps = 89, international_goals = 63
WHERE player_id = 3; -- Harry Kane

UPDATE players SET 
    matches_played = 32, minutes_played = 2880, yellow_cards = 4, red_cards = 0,
    clean_sheets = 12, pass_accuracy = 91.3, shots_on_target = 15, dribbles_completed = 45,
    tackles_won = 35, interceptions = 40, aerial_duels_won = 20, saves = 0,
    penalties_scored = 0, penalties_missed = 0, photo_url = image_url,
    height = '181 cm', foot = 'Right', date_of_birth = '1991-06-28', place_of_birth = 'Drongen',
    international_caps = 105, international_goals = 28
WHERE player_id = 4; -- Kevin De Bruyne

-- ============================================
-- END OF DATABASE SCHEMA
-- ============================================
