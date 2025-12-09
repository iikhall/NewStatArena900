// Step 2: Select Tickets

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadMatchData();
    setupCustomSelects();
    setupActionButtons();
});

// Load selected match data
function loadMatchData() {
    const matchData = JSON.parse(localStorage.getItem('selectedMatch'));
    
    if (!matchData) {
        // If no match selected, redirect to step 1
        alert('Please select a match first');
        window.location.href = 'tickets.html';
        return;
    }
    
    console.log('Selected Match:', matchData);
}

// Setup custom select dropdowns
function setupCustomSelects() {
    const selects = document.querySelectorAll('.custom-select');
    console.log('Found selects:', selects.length);
    
    selects.forEach(select => {
        const trigger = select.querySelector('.select-trigger');
        const options = select.querySelector('.select-options');
        const optionItems = select.querySelectorAll('.option');
        
        console.log('Setting up select:', select.id, 'Options:', optionItems.length);
        
        // Remove any existing listeners by cloning
        const newTrigger = trigger.cloneNode(true);
        trigger.parentNode.replaceChild(newTrigger, trigger);
        
        newTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Trigger clicked:', select.id);
            
            // Close other dropdowns
            selects.forEach(s => {
                if (s !== select) {
                    s.classList.remove('open');
                }
            });
            
            // Toggle this dropdown
            select.classList.toggle('open');
            console.log('Dropdown open:', select.classList.contains('open'));
        });
        
        // Setup option clicks
        optionItems.forEach((option, index) => {
            const newOption = option.cloneNode(true);
            option.parentNode.replaceChild(newOption, option);
            
            newOption.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = newOption.getAttribute('data-value');
                console.log('Option clicked:', value);
                
                if (value) {
                    const span = select.querySelector('.select-trigger span');
                    span.textContent = newOption.textContent;
                    select.classList.remove('open');
                    select.setAttribute('data-selected', value);
                    
                    console.log('Selected:', value);
                    
                    // Update order summary when both selections are made
                    updateOrderSummary();
                }
            });
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select')) {
            selects.forEach(select => {
                select.classList.remove('open');
            });
        }
    });
}

// Update order summary display
function updateOrderSummary() {
    const categorySelect = document.getElementById('categorySelect');
    const quantitySelect = document.getElementById('quantitySelect');
    const matchData = JSON.parse(localStorage.getItem('selectedMatch'));
    
    const categoryValue = categorySelect?.getAttribute('data-selected');
    const quantityValue = quantitySelect?.getAttribute('data-selected');
    
    if (categoryValue && quantityValue && matchData) {
        const categoryText = categorySelect.querySelector('.select-trigger span').textContent;
        const quantity = parseInt(quantityValue);
        
        // Calculate prices based on category
        const categoryPrices = {
            'cat1-first': 50,
            'cat1-second': 50,
            'cat2-first': 60,
            'cat2-second': 60,
            'cat3': 70,
            'cat4': 80,
            'cat5': 100
        };
        
        const pricePerTicket = categoryPrices[categoryValue] || 50;
        const subtotal = pricePerTicket * quantity;
        const serviceFee = subtotal * 0.08;
        const total = subtotal + serviceFee;
        
        // Update summary display
        const summaryRows = document.querySelectorAll('.summary-row .summary-value');
        if (summaryRows.length >= 5) {
            summaryRows[0].textContent = categoryText;
            summaryRows[1].textContent = `${quantity} ticket${quantity > 1 ? 's' : ''}`;
            summaryRows[2].textContent = `${pricePerTicket}.00 SAR`;
            summaryRows[3].textContent = `${subtotal}.00 SAR`;
            summaryRows[4].textContent = `${serviceFee.toFixed(2)} SAR`;
            
            const totalElement = document.querySelector('.summary-row.total .summary-value');
            if (totalElement) {
                totalElement.textContent = `${total.toFixed(2)} SAR`;
            }
        }
        
        // Show order summary
        const orderSummary = document.querySelector('.order-summary');
        if (orderSummary) {
            orderSummary.style.display = 'block';
        }
    }
}

// Setup action buttons
function setupActionButtons() {
    const backBtn = document.querySelector('.btn-back');
    const continueBtn = document.querySelector('.btn-continue-checkout');
    
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            // Clear selection and go back
            localStorage.removeItem('selectedMatch');
            window.location.href = 'tickets.html';
        });
    }
    
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            // Validate selections
            const categorySelect = document.getElementById('categorySelect');
            const quantitySelect = document.getElementById('quantitySelect');
            
            const categoryValue = categorySelect?.getAttribute('data-selected');
            const quantityValue = quantitySelect?.getAttribute('data-selected');
            
            if (!categoryValue) {
                alert('Please select a ticket category');
                return;
            }
            
            if (!quantityValue) {
                alert('Please select the number of tickets');
                return;
            }
            
            // Get match data
            const matchData = JSON.parse(localStorage.getItem('selectedMatch'));
            
            // Calculate final prices
            const categoryPrices = {
                'cat1-first': 50,
                'cat1-second': 50,
                'cat2-first': 60,
                'cat2-second': 60,
                'cat3': 70,
                'cat4': 80,
                'cat5': 100
            };
            
            const pricePerTicket = categoryPrices[categoryValue] || 50;
            const quantity = parseInt(quantityValue);
            const subtotal = pricePerTicket * quantity;
            const serviceFee = subtotal * 0.08;
            const total = subtotal + serviceFee;
            
            // Store ticket selection data
            const ticketData = {
                category: categorySelect.querySelector('.select-trigger span').textContent,
                categoryValue: categoryValue,
                quantity: quantity,
                pricePerTicket: pricePerTicket,
                subtotal: subtotal,
                serviceFee: serviceFee,
                total: total,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('selectedTickets', JSON.stringify(ticketData));
            
            // Navigate to checkout
            window.location.href = 'step3.html';
        });
    }
}
