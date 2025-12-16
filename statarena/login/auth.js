// Authentication JavaScript

// Tab Switching
document.getElementById('signinTab').addEventListener('click', function() {
    document.getElementById('signinTab').classList.add('active');
    document.getElementById('signupTab').classList.remove('active');
    document.getElementById('signinForm').classList.remove('hidden');
    document.getElementById('signupForm').classList.add('hidden');
});

document.getElementById('signupTab').addEventListener('click', function() {
    document.getElementById('signupTab').classList.add('active');
    document.getElementById('signinTab').classList.remove('active');
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('signinForm').classList.add('hidden');
});

// Toggle Password Visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Handle Sign In
async function handleSignIn(event) {
    event.preventDefault();
    
    const email = document.getElementById('signinEmail').value;
    const password = document.getElementById('signinPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    try {
        // Call backend API for login
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Save session with real user data from database
            const sessionData = {
                token: data.token,
                user_id: data.user.user_id,
                name: data.user.name,
                username: data.user.username || data.user.name, // Use username field
                email: data.user.email,
                role: data.user.role,
                loggedIn: true,
                loginTime: new Date().toISOString()
            };
            
            if (rememberMe) {
                localStorage.setItem('statarena_session', JSON.stringify(sessionData));
            } else {
                sessionStorage.setItem('statarena_session', JSON.stringify(sessionData));
            }
            
            // Show success message
            alert('Login successful! Welcome back, ' + data.user.name + '!');
            
            // Redirect to home page
            window.location.href = '../home/home.html';
        } else {
            alert(data.error || 'Invalid email or password. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Cannot connect to server. Please make sure the backend is running on port 3000.');
    }
}

// Handle Sign Up
async function handleSignUp(event) {
    event.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
    }
    
    // Validate password strength
    if (password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
    }
    
    try {
        // Call backend API for registration
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Auto login after signup
            const sessionData = {
                token: data.token,
                user_id: data.user.user_id,
                name: data.user.name,
                email: data.user.email,
                role: data.user.role,
                loggedIn: true,
                loginTime: new Date().toISOString()
            };
            
            localStorage.setItem('statarena_session', JSON.stringify(sessionData));
            
            // Show success message
            alert('Account created successfully! Welcome to StatArena, ' + name + '!');
            
            // Redirect to home page
            window.location.href = '../home/home.html';
        } else {
            alert(data.error || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Cannot connect to server. Please make sure the backend is running on port 3000.');
    }
}

// Check if user is already logged in
function checkLoginStatus() {
    const session = localStorage.getItem('statarena_session') || sessionStorage.getItem('statarena_session');
    
    if (session) {
        const sessionData = JSON.parse(session);
        if (sessionData.loggedIn) {
            // User is already logged in, redirect to home
            window.location.href = '../home/home.html';
        }
    }
}

// Run on page load
checkLoginStatus();
