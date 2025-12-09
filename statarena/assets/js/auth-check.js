// Authentication Check for All Pages
// This script should be included in every page to check login status

function getSessionData() {
    const session = localStorage.getItem('statarena_session') || sessionStorage.getItem('statarena_session');
    
    if (session) {
        try {
            return JSON.parse(session);
        } catch (e) {
            return null;
        }
    }
    
    return null;
}

function updateNavbarWithUser() {
    const sessionData = getSessionData();
    const navbarRight = document.querySelector('.navbar-right');
    
    if (sessionData && sessionData.loggedIn) {
        // User is logged in - show user icon only for regular users (not admins)
        const userIcon = sessionData.role === 'admin' 
            ? '' 
            : '<i class="fa-regular fa-circle-user user-icon" onclick="handleUserProfile()" style="cursor: pointer;"></i>';
        
        navbarRight.innerHTML = `
            ${userIcon}
            <i class="fa-solid fa-arrow-right-from-bracket logout-icon" onclick="handleLogout()" style="cursor: pointer;"></i>
        `;
    } else {
        // User is not logged in - show login button
        navbarRight.innerHTML = `
            <a href="../login/login.html" class="login-link">
                <i class="fa-solid fa-right-to-bracket"></i> Login / Sign Up
            </a>
        `;
    }
    
    // Hide Admin link for non-admin users
    hideAdminLinkForNonAdmins(sessionData);
}

function hideAdminLinkForNonAdmins(sessionData) {
    // Find all admin links in the navbar
    const adminLinks = document.querySelectorAll('a[href*="/admin/admin.html"], a[href*="../admin/admin.html"]');
    
    adminLinks.forEach(link => {
        // Only show admin link if user is logged in AND has admin role AND email is k@k.com
        if (sessionData && sessionData.loggedIn && sessionData.role === 'admin' && sessionData.email === 'k@k.com') {
            link.style.display = '';
        } else {
            link.style.display = 'none';
        }
    });
}

function checkAdminAccess() {
    // Check if current page is admin page
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('/admin/')) {
        const sessionData = getSessionData();
        
        // If not logged in or not admin or not the specific admin email, redirect
        if (!sessionData || !sessionData.loggedIn || sessionData.role !== 'admin' || sessionData.email !== 'k@k.com') {
            alert('Access Denied! Only administrators can access this page.');
            window.location.href = '../home/home.html';
        }
    }
}

function checkAuthAccess() {
    // Check if current page requires authentication
    const currentPath = window.location.pathname;
    const protectedPages = ['/tickets/', '/predictions/', '/resell/'];
    
    // Check if current page is protected
    const isProtected = protectedPages.some(page => currentPath.includes(page));
    
    if (isProtected) {
        const sessionData = getSessionData();
        
        // If not logged in, redirect to login
        if (!sessionData || !sessionData.loggedIn) {
            alert('Please login to access this feature. Only registered users can book tickets, make predictions, and resell tickets.');
            window.location.href = '../login/login.html';
        }
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear session data
        localStorage.removeItem('statarena_session');
        sessionStorage.removeItem('statarena_session');
        
        // Redirect to login page
        window.location.href = '../login/login.html';
    }
}

function handleUserProfile() {
    // Redirect to profile page
    window.location.href = '../profile/profile.html';
}

// Make logo clickable on all pages
function makeLogoClickable() {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', function() {
            window.location.href = '../home/home.html';
        });
    }
}

// Update navbar on page load
document.addEventListener('DOMContentLoaded', function() {
    updateNavbarWithUser();
    checkAdminAccess();
    checkAuthAccess();
    makeLogoClickable();
});
