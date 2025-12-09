// Step 3: Checkout

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadBookingData();
    setupPaymentOptions();
    setupActionButtons();
});

// Load booking data from previous steps
function loadBookingData() {
    const matchData = JSON.parse(localStorage.getItem('selectedMatch'));
    const ticketData = JSON.parse(localStorage.getItem('selectedTickets'));
    
    if (!matchData || !ticketData) {
        // If no data, redirect to step 1
        alert('Please start from the beginning');
        window.location.href = 'tickets.html';
        return;
    }
    
    // Update order summary in the right section
    updateOrderSummary(matchData, ticketData);
    
    console.log('Booking Summary:', {
        match: matchData.title,
        category: ticketData.category,
        quantity: ticketData.quantity,
        subtotal: ticketData.subtotal,
        serviceFee: ticketData.serviceFee,
        total: ticketData.total
    });
}

// Update order summary section
function updateOrderSummary(matchData, ticketData) {
    // Update match details
    const matchInfoElements = document.querySelectorAll('.order-detail-row .detail-value');
    if (matchInfoElements.length >= 3) {
        matchInfoElements[0].textContent = matchData.title;
        matchInfoElements[1].textContent = matchData.dateTime;
        matchInfoElements[2].textContent = `${ticketData.category} × ${ticketData.quantity}`;
    }
    
    // Update prices
    const priceRows = document.querySelectorAll('.price-row .amount');
    if (priceRows.length >= 2) {
        priceRows[0].textContent = `${ticketData.subtotal.toFixed(2)} SAR`;
        priceRows[1].textContent = `${ticketData.serviceFee.toFixed(2)} SAR`;
        
        const totalElement = document.querySelector('.price-row.total .amount');
        if (totalElement) {
            totalElement.textContent = `${ticketData.total.toFixed(2)} SAR`;
        }
    }
}

// Setup payment option selection
function setupPaymentOptions() {
    const paymentOptions = document.querySelectorAll('.payment-option');
    
    paymentOptions.forEach(option => {
        option.style.cursor = 'pointer';
        option.style.transition = 'all 0.3s ease';
        
        option.addEventListener('click', function() {
            // Remove active class from all options
            paymentOptions.forEach(opt => {
                opt.classList.remove('active');
                opt.style.borderColor = '';
                opt.style.backgroundColor = '';
            });
            
            // Add active class to selected option
            this.classList.add('active');
            this.style.borderColor = '#7c3aed';
            this.style.backgroundColor = 'rgba(124, 58, 237, 0.05)';
        });
    });
}

// Setup action buttons
function setupActionButtons() {
    const backBtn = document.querySelector('.btn-back-seats');
    const completeBtn = document.querySelector('.btn-complete');
    
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'step2.html';
        });
    }
    
    if (completeBtn) {
        completeBtn.addEventListener('click', () => {
            handlePaymentCompletion();
        });
    }
}

// Handle payment completion
async function handlePaymentCompletion() {
    // Validate payment method selected
    const activePayment = document.querySelector('.payment-option.active');
    
    if (!activePayment) {
        alert('Please select a payment method');
        return;
    }
    
    // Validate customer information
    const fullName = document.getElementById('fullName').value.trim();
    const emailAddress = document.getElementById('emailAddress').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    
    if (!fullName) {
        alert('Please enter your full name');
        document.getElementById('fullName').focus();
        return;
    }
    
    if (!emailAddress) {
        alert('Please enter your email address');
        document.getElementById('emailAddress').focus();
        return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
        alert('Please enter a valid email address');
        document.getElementById('emailAddress').focus();
        return;
    }
    
    if (!phoneNumber) {
        alert('Please enter your phone number');
        document.getElementById('phoneNumber').focus();
        return;
    }
    
    // Get booking data
    const matchData = JSON.parse(localStorage.getItem('selectedMatch'));
    const ticketData = JSON.parse(localStorage.getItem('selectedTickets'));
    
    // Get user session
    const session = localStorage.getItem('statarena_session') || sessionStorage.getItem('statarena_session');
    const userData = session ? JSON.parse(session) : null;
    
    if (!userData || !userData.user_id) {
        alert('Please login to complete your purchase');
        window.location.href = '../login/login.html';
        return;
    }
    
    // Create booking record
    const booking = {
        id: 'BOOK-' + Date.now(),
        match: matchData.title,
        stadium: matchData.stadium,
        location: matchData.location,
        dateTime: matchData.dateTime,
        category: ticketData.category,
        quantity: ticketData.quantity,
        pricePerTicket: ticketData.pricePerTicket,
        subtotal: ticketData.subtotal,
        serviceFee: ticketData.serviceFee,
        total: ticketData.total,
        paymentMethod: activePayment.querySelector('span').textContent,
        customerName: fullName,
        customerEmail: emailAddress,
        customerPhone: phoneNumber,
        bookingDate: new Date().toISOString(),
        status: 'confirmed'
    };
    
    try {
        // Save to database
        const response = await fetch('http://localhost:3000/api/tickets/purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userData.token}`
            },
            body: JSON.stringify({
                user_id: userData.user_id,
                match_title: matchData.title,
                match_date: matchData.dateTime,
                stadium: matchData.stadium,
                category: ticketData.category,
                quantity: ticketData.quantity,
                price: ticketData.pricePerTicket,
                total: ticketData.total
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to save ticket purchase');
        }
        
        // Also store booking in localStorage for backward compatibility
        let bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        bookings.push(booking);
        localStorage.setItem('userBookings', JSON.stringify(bookings));
        
        // Clear selection data
        localStorage.removeItem('selectedMatch');
        localStorage.removeItem('selectedTickets');
        
        // Show success message
        alert(`✅ Payment Successful!\n\n📋 Booking ID: ${booking.id}\n👤 Name: ${fullName}\n📧 Email: ${emailAddress}\n🎟️ ${ticketData.quantity} Ticket(s) Confirmed\n🏟️ ${matchData.title}\n📍 ${matchData.stadium}\n📅 ${matchData.dateTime}\n💰 Total: ${ticketData.total.toFixed(2)} SAR\n\n✉️ Confirmation email has been sent to ${emailAddress}!`);
        
        // Redirect to tickets page
        window.location.href = 'tickets.html';
        
    } catch (error) {
        console.error('Error saving ticket:', error);
        alert('❌ Failed to complete purchase. Please try again.');
    }
}

