# StatArena Login System - Testing Guide

## How the Login System Works

The authentication system uses **localStorage** to store user accounts and session data. This is a client-side solution that persists data in the browser.

### Features Implemented:

1. **Sign Up**: Create new accounts with name, email, and password
2. **Sign In**: Login with existing credentials
3. **Session Management**: "Remember me" option for persistent login
4. **Dynamic Navbar**: Shows user's name when logged in
5. **Logout**: Clear session and redirect to login

---

## Testing Instructions

### Option 1: Create a New Account

1. Open `statarena/index.html` in your browser
2. You'll be redirected to the login page
3. Click on "Create Account" tab
4. Fill in the form:
   - Full Name: `Khaled` (or any name you want)
   - Email: `khaled@example.com`
   - Password: `123456` (or any password 6+ characters)
   - Confirm Password: `123456`
5. Click "Create Account"
6. You'll be automatically logged in and redirected to the home page
7. The navbar will show "Welcome, Khaled!" with your name

### Option 2: Use Pre-populated Test Account

Run this JavaScript code in your browser console to create a test account:

```javascript
localStorage.setItem('statarena_users', JSON.stringify([
    {
        name: 'Khaled',
        email: 'khaled@test.com',
        password: '123456',
        createdAt: new Date().toISOString()
    }
]));
```

Then login with:
- Email: `khaled@test.com`
- Password: `123456`

---

## Testing the Login Flow

1. **First Visit**: 
   - Open `index.html` → Redirects to login page
   - No session exists yet

2. **After Login**:
   - Navigate to any page (Home, Matches, Clubs, etc.)
   - Navbar shows: "Welcome, [Your Name]!"
   - Logout icon appears (arrow icon)

3. **Remember Me**:
   - Check "Remember me" when logging in
   - Close browser and reopen
   - You'll still be logged in (uses localStorage)
   - Without "Remember me", session ends when browser closes (uses sessionStorage)

4. **Logout**:
   - Click the logout icon (arrow) in the navbar
   - Confirm the logout
   - Redirected to login page
   - Session cleared

---

## File Structure

```
statarena/
├── index.html (redirects to login)
├── login/
│   ├── login.html (login/signup page)
│   ├── login.css (login page styles)
│   └── auth.js (login/signup logic)
├── assets/
│   ├── css/
│   │   └── global.css (navbar styles)
│   └── js/
│       └── auth-check.js (checks login status on all pages)
└── [all other pages include auth-check.js]
```

---

## How to View Stored Data

Open browser console (F12) and run:

```javascript
// View all registered users
console.log(JSON.parse(localStorage.getItem('statarena_users')));

// View current session
console.log(JSON.parse(localStorage.getItem('statarena_session')));
```

---

## Important Notes

⚠️ **This is a client-side demo system**. In production, you would need:
- Backend server (Node.js, PHP, Python, etc.)
- Database (MySQL, MongoDB, etc.)
- Password encryption (bcrypt)
- JWT tokens for authentication
- HTTPS security

✅ **For demonstration purposes**, this system:
- Works entirely in the browser
- Stores data in localStorage
- Shows the login/logout flow
- Updates navbar dynamically
- Persists across page navigation

---

## Customization

To change the welcome message format, edit `assets/js/auth-check.js`:

```javascript
// Current format: "Welcome, Khaled!"
<span>Welcome, ${sessionData.name}!</span>

// Alternative formats:
<span>Hello ${sessionData.name}!</span>
<span>Welcome back, ${sessionData.name}!</span>
<span>${sessionData.name}</span>
```

---

## Troubleshooting

**Problem**: Not redirecting after login
- **Solution**: Check browser console for errors, ensure all paths are correct

**Problem**: User info not showing in navbar
- **Solution**: Make sure `auth-check.js` is loaded on the page (check <script> tag)

**Problem**: Can't create account with same email
- **Solution**: This is expected behavior - use a different email or clear localStorage

**Clear All Data**:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```
