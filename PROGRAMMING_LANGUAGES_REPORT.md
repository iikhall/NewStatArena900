# StatArena: Programming Languages Perspective

Author: [Your Name]
Course: Programming Languages (CS360/471)
Date: December 9, 2025

## Executive Summary
StatArena is a full‑stack web application for football statistics, predictions, and ticketing. The system combines declarative markup (HTML, CSS), imperative multi‑paradigm scripting (JavaScript on both client and server), and declarative data querying (SQL/MySQL). This report analyzes the project through programming languages concepts introduced in Chapter 1: language types and paradigms (declarative vs. imperative, scripting vs. general‑purpose), runtime model (interpreted/JIT), typing discipline, and domain suitability. It explains why each language was chosen, how it is used in StatArena, and which design trade‑offs it resolves.

## Architecture at a Glance
- Frontend: Static HTML pages + CSS + Vanilla JavaScript in `statarena/` for all UI and presentation (e.g., `statarena/matches/matches.html`, `statarena/clubs/clubs.html`, `statarena/tables/league-table.html`).
- Backend API: Node.js (V8) + Express in `backend/` for predictions and tickets only (e.g., `backend/server.js`, `backend/routes/predictions.js`, `backend/routes/tickets.js`, `backend/middleware/auth.js`).
- Database: MySQL with SQL schema used exclusively for predictions and tickets data in `database/statarena_database.sql`.
- Data Architecture: **Matches, Clubs, Players, and League Tables are implemented as static HTML/CSS content** without database fetching. Only **Predictions and Tickets** use backend API with JSON over HTTP (CORS enabled, `fetch` API).

## Language Overview and Rationale

### HTML (HyperText Markup Language)
- Type/Paradigm: Declarative markup language; describes structure and semantics of documents.
- Project Usage: Page structure and content for all views under `statarena/*/*.html` (home, matches, players, clubs, profiles, tickets, admin). Example: `statarena/home/home.html` structures the landing UI consumed by CSS/JS.
- Why HTML here:
  - Semantics: Accessible, SEO‑friendly structure (headings, sections, forms).
  - Interoperability: Universal browser support; integrates cleanly with CSS and JS.
  - Separation of concerns: Keeps structure distinct from behavior (JS) and presentation (CSS).
- Trade‑offs: Logic is intentionally minimal in HTML; dynamic behavior is delegated to JS and the backend.

### CSS (Cascading Style Sheets)
- Type/Paradigm: Declarative stylesheet language; constraint‑based cascade and selectors.
- Project Usage: Visual presentation and responsive layout for all pages, e.g., `statarena/assets/css/global.css` and feature‑specific styles such as `statarena/matches/matches.css`, `statarena/players/player-details.css`.
- Why CSS here:
  - Declarative styling: Expresses layout, color, typography without imperative code.
  - Modularity: Page‑specific styles keep concerns scoped; site‑wide styles live in `global.css`.
  - Responsiveness: Media queries and modern layout (Flexbox/Grid) suit multi‑device UI.
- Trade‑offs: Cascade and specificity can be complex; conventions and file scoping mitigate it.

### JavaScript (Client‑Side)
- Type/Paradigm: Multi‑paradigm, dynamically typed, prototype‑based; event‑driven; interpreted/JIT in browsers.
- Project Usage:
  - Static data rendering: `statarena/tables/league-table.js` contains embedded league standings data rendered dynamically without API calls.
  - Auth flows and predictions/tickets: `statarena/login/auth.js` handles sign‑in/up with session storage; `statarena/assets/js/api-client.js` provides fetch wrapper for predictions/tickets endpoints only.
  - UI interactivity: Event handling for favorites, form submissions, and navigation across feature pages.
- Why JavaScript on the client:
  - Interactivity: Event‑driven DOM manipulation for dynamic rendering of static data structures.
  - Selective data fetching: Non‑blocking `fetch` only for user-generated content (predictions, tickets).
  - JSON affinity: Native JSON support for API payloads and embedded data structures.
- Trade‑offs: Embedding data in JS increases initial page size but eliminates server round-trips; dynamic typing mitigated by modular code.
### JavaScript (Server‑Side with Node.js + Express)
- Type/Runtime: Same language as client, executed on V8 (JIT); non‑blocking I/O model.
- Project Usage:
  - API server for user-generated content: `backend/server.js` mounts Express routers under `/api/*` for predictions and tickets only (e.g., `/api/predictions`, `/api/tickets`, `/api/auth`).
  - Middleware: Cross‑cutting concerns like logging, CORS, JSON parsing; `backend/middleware/auth.js` validates JWTs for protected routes.
  - Business logic for predictions/tickets: Route handlers in `backend/routes/predictions.js` and `backend/routes/tickets.js` query MySQL for user submissions and purchases.
- Why JavaScript on the server (limited scope):
  - Unified language: Same language across stack for prediction/ticket features.
  - I/O efficiency: Event loop suits database queries for user-generated content.
  - Ecosystem: Packages (`express`, `mysql2`, `jsonwebtoken`, `bcryptjs`) for auth and data persistence.
- Trade‑offs: Backend only handles dynamic user data; static content served directly eliminates unnecessary server overhead.very.
- Trade‑offs: CPU‑heavy tasks require care (offloading/worker threads); not an issue for this API profile.
### SQL/MySQL
- Type/Paradigm: Declarative query language; set‑based; optimized by the database engine.
- Project Usage:
  - Schema for user-generated content: `database/statarena_database.sql` defines normalized tables for **users, predictions, user_statistics, tickets, user_tickets, and resell_tickets** only.
  - Views for leaderboards: `vw_leaderboard` view computes user prediction rankings from `user_statistics`.
  - Runtime access: Backend uses `mysql2` (`backend/config/database.js`) with parameterized queries in `routes/predictions.js` and `routes/tickets.js` to persist and retrieve user data.
- Why MySQL/SQL (limited scope):
  - User data integrity: Constraints and foreign keys ensure consistent user predictions and ticket purchases.
  - Leaderboard queries: SQL aggregations efficiently compute points and rankings.
  - Persistence: ACID properties protect user submissions and transactions.
- Trade‑offs: Database limited to dynamic user content; static match/club/league data lives in frontend code for faster initial rendering and reduced server load.
- Trade‑offs: Schema migrations and rigid schemas require planning; benefits outweigh costs for strongly relational data.
## Mapping Features to Languages
- Health/API surface: `backend/server.js` exposes `/api/health` for liveness checks.
- Authentication:
  - Client JS: `statarena/login/auth.js` handles form events, session storage, and redirects.
  - Server JS: `backend/routes/auth.js` performs login/register, issues JWTs; `middleware/auth.js` verifies tokens.
  - SQL: `users` table stores credentials, roles, and timestamps; login updates `last_login`.
- **Matches (Static)**:
  - HTML: `statarena/matches/matches.html` contains hardcoded match cards for live, upcoming, and finished matches.
  - CSS: `statarena/matches/matches.css` styles match rows, status badges, and scores.
  - No backend/database: All match data embedded in HTML for instant rendering.
- **Clubs (Static)**:
  - HTML: `statarena/clubs/clubs.html` displays club cards with logos, stats, and top players.
  - CSS: `statarena/clubs/clubs.css` styles club cards with gradients and layouts.
  - Client JS: `statarena/clubs/club-details.js` contains embedded club data and squad rosters rendered on detail pages.
  - No backend/database: Club information hardcoded in markup and JS.
- **Players (Static)**:
  - HTML: `statarena/players/player-details.html` provides player profile structure.
  - CSS: `statarena/players/player-details.css` styles player cards, stats bars, and charts.
  - Client JS: `statarena/players/player-details.js` contains embedded player data (stats, bio, club info) rendered dynamically.
  - No backend/database: All player information lives in JS objects.
- **League Tables (Static with JS Data)**:
  - HTML/CSS: `statarena/tables/league-table.html` and `league-table.css` provide table structure.
  - Client JS: `statarena/tables/league-table.js` contains embedded standings arrays (Premier League, La Liga, etc.) and renders rows dynamically.
  - No backend/database: All standings data lives in JS objects.
- **Predictions (Dynamic)**:
  - Client JS: Submit predictions and render stats/leaderboard via `api-client.js`.
  - Server JS: `backend/routes/predictions.js` validates and persists to database.
  - SQL: `predictions`, `user_statistics` tables; `vw_leaderboard` view computes rankings.
- **Tickets & Marketplace (Dynamic)**:
  - Client JS: Purchase/resell flows in ticket pages using API calls.
  - Server JS: `backend/routes/tickets.js` handles transactions.
  - SQL: `tickets`, `user_tickets`, `resell_tickets` tables persist purchases.
  - Server JS + SQL: Persists to `tickets`, `user_tickets`, `resell_tickets`.

## Programming Languages Concepts Applied
- Declarative vs. Imperative:
  - Declarative: HTML structures content; CSS specifies styling; SQL defines result sets.
  - Imperative: JavaScript orchestrates control flow, event handling, and API requests.
- Typing and Execution:
  - JavaScript: Dynamically typed; JIT compiled; asynchronous I/O suits UI and API layers.
  - SQL: Declarative and strongly constrained by schema; query optimizer determines execution.
## Why Not Alternatives?
- Full-stack database approach: Static HTML/CSS for read-only sports data (matches, clubs, tables) eliminates server round-trips, reduces backend complexity, and improves initial page load. Database reserved for user-generated content that requires persistence.
- NoSQL vs. MySQL: Relational model suits user predictions and ticket transactions with referential integrity; limited scope keeps schema simple.
- PHP/Ruby/Python backends: JavaScript across stack (limited to predictions/tickets API) maintains language consistency where dynamic behavior is needed.
- SPA frameworks: Vanilla JS with static HTML keeps bundle size minimal and rendering instant; no build step or virtual DOM overhead for mostly static content.
## Conclusion
StatArena's language choices align directly with the system's needs and with core programming languages concepts:
- **HTML/CSS** for declarative structure and presentation of static sports content (matches, clubs, league tables).
- **JavaScript** for:
  - Client-side: Imperative rendering of embedded data structures and event-driven UI interactivity.
  - Server-side (limited): Efficient I/O for user-generated content (predictions, tickets) via Node.js/Express.
- **SQL/MySQL** for declarative, relational persistence of user data (predictions, tickets) with strong integrity constraints.
## Selected File References
- **Static Frontend (HTML/CSS/JS)**: 
  - Matches: `statarena/matches/matches.html` (hardcoded match cards), `statarena/matches/matches.css`
  - Clubs: `statarena/clubs/clubs.html` (club cards), `statarena/clubs/club-details.js` (embedded club/squad data), `statarena/clubs/clubs.css`
  - Players: `statarena/players/player-details.html`, `statarena/players/player-details.js` (embedded player stats), `statarena/players/player-details.css`
  - Tables: `statarena/tables/league-table.html`, `statarena/tables/league-table.js` (embedded standings data)
- **Dynamic Frontend (API calls)**:
  - Login: `statarena/login/auth.js` (auth flows)
  - API client: `statarena/assets/js/api-client.js` (predictions/tickets endpoints)
- **Backend (Predictions/Tickets only)**: 
  - Server: `backend/server.js`, `backend/routes/predictions.js`, `backend/routes/tickets.js`, `backend/middleware/auth.js`
  - Config: `backend/package.json` (Express, mysql2, jwt, bcryptjs, dotenv)
- **Database (User content only)**: 
  - Schema: `database/statarena_database.sql` (users, predictions, user_statistics, tickets, user_tickets, resell_tickets)
- Clean separation of concerns with consistent JavaScript across the full stack where needed.
## Why Not Alternatives?
- NoSQL vs. MySQL: The domain is relational with many joins (standings, lineups, leaderboards); SQL fits better than document stores for these queries.
- PHP/Ruby/Python backends: The team benefits from one language across client and server (JS), and Node’s event loop is ideal for API+DB I/O.
- SPA frameworks: Vanilla JS was sufficient; static HTML pages with modular scripts keep complexity low and performance high.

## Conclusion
StatArena’s language choices align directly with the system’s needs and with core programming languages concepts:
- HTML/CSS for declarative structure and presentation.
- JavaScript for imperative, event‑driven interactivity on the client and efficient I/O on the server.
- SQL/MySQL for declarative, relational data access with strong integrity.
This combination provides a clean separation of concerns, consistent developer experience, and strong performance for a data‑driven sports application.

## Selected File References
- Frontend: `statarena/home/home.html`, `statarena/assets/js/api-client.js`, `statarena/login/auth.js`, feature folders under `statarena/*/*`.
- Backend: `backend/server.js`, `backend/routes/auth.js`, `backend/routes/clubs.js`, `backend/middleware/auth.js`, `backend/package.json` (Express, mysql2, jwt, bcryptjs, dotenv).
- Database: `database/README.md`, `database/statarena_database.sql` (tables, relationships, sample data, views).
