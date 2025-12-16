// Resell Tickets Page

// Get current user session
function getCurrentSession() {
    const session = localStorage.getItem('statarena_session') || sessionStorage.getItem('statarena_session');
    return session ? JSON.parse(session) : null;
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    const session = getCurrentSession();
    if (!session) {
        alert('Please login to access the resale marketplace');
        window.location.href = '../login/login.html';
        return;
    }
    
    loadMyTickets();
    loadResaleTickets();
    setupModal();
});

// Load user's tickets available to resell
async function loadMyTickets() {
    const session = getCurrentSession();
    const container = document.getElementById('myTicketsContainer');
    
    try {
        console.log('Fetching user tickets from API...');
        const response = await fetch(`http://localhost:3000/api/tickets/user/${session.user_id}`, {
            headers: {
                'Authorization': `Bearer ${session.token}`
            }
        });
        
        console.log('My tickets response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API error:', errorData);
            throw new Error(errorData.error || 'Failed to fetch tickets');
        }
        
        const tickets = await response.json();
        console.log('Loaded user tickets:', tickets);
        
        // Filter only tickets not yet listed for resale
        const availableTickets = tickets.filter(ticket => !ticket.resale_listed);
        
        if (availableTickets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-ticket" style="font-size: 48px; color: #cbd5e1; margin-bottom: 15px;"></i>
                    <p style="color: #94a3b8;">No tickets available to resell.</p>
                    <p style="color: #94a3b8; font-size: 14px;">Purchase tickets to list them here.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = availableTickets.map(ticket => `
            <div class="ticket-card">
                <div class="ticket-header">
                    <h3>${ticket.match_title || 'Match'}</h3>
                    <span class="ticket-badge">${ticket.category || 'Standard'}</span>
                </div>
                <div class="ticket-details">
                    <p><i class="fa-solid fa-calendar"></i> ${ticket.match_date || 'TBD'}</p>
                    <p><i class="fa-solid fa-location-dot"></i> ${ticket.stadium || 'Stadium'}</p>
                    <p><i class="fa-solid fa-users"></i> Quantity: ${ticket.quantity || 1}</p>
                    <p><i class="fa-solid fa-money-bill"></i> Original Price: ${parseFloat(ticket.price || 0).toFixed(2)} SAR</p>
                </div>
                <button class="btn-list-resale" onclick="openResellModal(${ticket.user_ticket_id}, '${ticket.match_title}', ${parseFloat(ticket.price || 0)}, ${ticket.quantity})">
                    <i class="fa-solid fa-tags"></i> List for Resale
                </button>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading tickets:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-exclamation-triangle" style="font-size: 48px; color: #f59e0b; margin-bottom: 15px;"></i>
                <p style="color: #94a3b8;">Failed to load tickets. Please try again.</p>
            </div>
        `;
    }
}

// Load available resale tickets from other users
async function loadResaleTickets() {
    const session = getCurrentSession();
    const container = document.getElementById('resaleTicketsContainer');
    
    try {
        console.log('Fetching resale tickets from API...');
        const response = await fetch('http://localhost:3000/api/tickets/resale', {
            headers: {
                'Authorization': `Bearer ${session.token}`
            }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API error:', errorData);
            throw new Error(errorData.error || 'Failed to fetch resale tickets');
        }
        
        const tickets = await response.json();
        console.log('Loaded resale tickets:', tickets);
        
        if (tickets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-store" style="font-size: 48px; color: #cbd5e1; margin-bottom: 15px;"></i>
                    <p style="color: #94a3b8;">No resale tickets available at the moment.</p>
                    <p style="color: #94a3b8; font-size: 14px;">Check back later for deals!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = tickets.map(ticket => {
            const isOwnListing = ticket.seller_id === session.user_id;
            return `
            <div class="ticket-card resale ${isOwnListing ? 'own-listing' : ''}">
                <div class="ticket-header">
                    <h3>${ticket.match_title || 'Match'}</h3>
                    <span class="ticket-badge resale-badge">${isOwnListing ? 'Your Listing' : 'For Sale'}</span>
                </div>
                <div class="ticket-details">
                    <p><i class="fa-solid fa-calendar"></i> ${ticket.match_date || 'TBD'}</p>
                    <p><i class="fa-solid fa-location-dot"></i> ${ticket.stadium || 'Stadium'}</p>
                    <p><i class="fa-solid fa-users"></i> Quantity: ${ticket.quantity || 1}</p>
                    <p><i class="fa-solid fa-tag"></i> Resale Price: ${parseFloat(ticket.resale_price || 0).toFixed(2)} SAR</p>
                    <p class="original-price"><small>Original: ${parseFloat(ticket.original_price || 0).toFixed(2)} SAR</small></p>
                    ${ticket.notes ? `<p class="ticket-notes"><i class="fa-solid fa-note-sticky"></i> ${ticket.notes}</p>` : ''}
                </div>
                ${isOwnListing ? 
                    `<button class="btn-manage-listing" onclick="cancelListing(${ticket.resale_id})">
                        <i class="fa-solid fa-times-circle"></i> Cancel Listing
                    </button>` :
                    `<button class="btn-buy-resale" onclick="buyResaleTicket(${ticket.resale_id})">
                        <i class="fa-solid fa-shopping-cart"></i> Buy Now
                    </button>`
                }
            </div>
        `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading resale tickets:', error);
        console.error('Error details:', error.message);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-exclamation-triangle" style="font-size: 48px; color: #f59e0b; margin-bottom: 15px;"></i>
                <p style="color: #94a3b8;">Failed to load resale tickets. Please try again.</p>
                <p style="color: #64748b; font-size: 12px; margin-top: 10px;">Error: ${error.message}</p>
                <p style="color: #64748b; font-size: 12px;">Make sure the backend server is running on port 3000.</p>
            </div>
        `;
    }
}

// Setup modal functionality
function setupModal() {
    const modal = document.getElementById('resellModal');
    const closeBtn = document.querySelector('.close-modal');
    
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        };
    }
    
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// Open resell modal
let currentTicketId = null;

function openResellModal(ticketId, matchTitle, originalPrice, quantity) {
    currentTicketId = ticketId;
    const modal = document.getElementById('resellModal');
    const summary = document.getElementById('modalTicketSummary');
    const originalPriceSpan = document.getElementById('originalPrice');
    
    summary.innerHTML = `
        <p><strong>Match:</strong> ${matchTitle}</p>
        <p><strong>Quantity:</strong> ${quantity}</p>
    `;
    
    originalPriceSpan.textContent = originalPrice.toFixed(2);
    document.getElementById('resellPrice').value = originalPrice.toFixed(2);
    document.getElementById('resellNotes').value = '';
    
    modal.style.display = 'block';
}

// Confirm resell listing
async function confirmResell() {
    const session = getCurrentSession();
    const price = parseFloat(document.getElementById('resellPrice').value);
    const notes = document.getElementById('resellNotes').value.trim();
    
    if (!price || price <= 0) {
        alert('Please enter a valid resale price');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/tickets/resale', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.token}`
            },
            body: JSON.stringify({
                user_ticket_id: currentTicketId,
                resale_price: price,
                notes: notes
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to list ticket');
        }
        
        alert('✅ Ticket successfully listed for resale!');
        document.getElementById('resellModal').style.display = 'none';
        
        // Reload both sections
        loadMyTickets();
        loadResaleTickets();
        
    } catch (error) {
        console.error('Error listing ticket:', error);
        alert('❌ Failed to list ticket: ' + error.message);
    }
}

// Buy resale ticket
async function buyResaleTicket(resaleId) {
    const session = getCurrentSession();
    
    if (!confirm('Are you sure you want to purchase this ticket?')) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/tickets/resale/${resaleId}/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.token}`
            },
            body: JSON.stringify({
                buyer_id: session.user_id
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to purchase ticket');
        }
        
        alert('✅ Ticket purchased successfully!');
        
        // Reload both sections
        loadMyTickets();
        loadResaleTickets();
        
    } catch (error) {
        console.error('Error purchasing ticket:', error);
        alert('❌ Failed to purchase ticket: ' + error.message);
    }
}

// Cancel resale listing
async function cancelListing(resaleId) {
    const session = getCurrentSession();
    
    if (!confirm('Are you sure you want to cancel this listing?')) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/tickets/resale/${resaleId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session.token}`
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to cancel listing');
        }
        
        alert('✅ Listing cancelled successfully!');
        
        // Reload both sections
        loadMyTickets();
        loadResaleTickets();
        
    } catch (error) {
        console.error('Error cancelling listing:', error);
        alert('❌ Failed to cancel listing: ' + error.message);
    }
}
