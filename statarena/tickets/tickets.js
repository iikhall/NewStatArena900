// Tickets Page - Step 1: Select Match

let selectedMatchCard = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    setupMatchCardListeners();
    setupContinueButton();
    updateSelectedEventDisplay();
});

// Setup click listeners for match cards
function setupMatchCardListeners() {
    const matchCards = document.querySelectorAll('.match-card');
    
    matchCards.forEach(card => {
        card.style.cursor = 'pointer';
        
        card.addEventListener('click', function() {
            // Remove selection from previous card
            if (selectedMatchCard) {
                selectedMatchCard.style.border = '';
                selectedMatchCard.style.boxShadow = '';
            }
            
            // Select this card
            selectedMatchCard = card;
            card.style.border = '3px solid #7c3aed';
            card.style.boxShadow = '0 8px 25px rgba(124, 58, 237, 0.3)';
            
            // Update the right side "Selected Event" section
            updateSelectedEventDisplay();
        });
        
        // Add hover effect
        card.addEventListener('mouseenter', function() {
            if (this !== selectedMatchCard) {
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (this !== selectedMatchCard) {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
            }
        });
    });
}

// Update the "Selected Event" section on the right
function updateSelectedEventDisplay() {
    if (!selectedMatchCard) {
        // Show default selection (first match)
        selectedMatchCard = document.querySelector('.match-card');
    }
    
    if (selectedMatchCard) {
        const matchTitle = selectedMatchCard.querySelector('.match-title').textContent;
        const location = selectedMatchCard.querySelector('.detail-item i.fa-location-dot').nextElementSibling.textContent;
        const dateTime = selectedMatchCard.querySelector('.detail-item i.fa-clock').nextElementSibling.textContent;
        const stadium = getStadiumName(matchTitle);
        
        // Update the displayed values in the right section
        const eventRows = document.querySelectorAll('.event-row .value');
        if (eventRows.length >= 3) {
            eventRows[0].textContent = matchTitle;
            eventRows[1].textContent = stadium;
            eventRows[2].textContent = dateTime;
        }
    }
}

// Setup continue button
function setupContinueButton() {
    const continueBtn = document.querySelector('.btn-continue');
    
    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            if (!selectedMatchCard) {
                alert('Please select a match first');
                return;
            }
            
            // Get match details from the selected card
            const matchTitle = selectedMatchCard.querySelector('.match-title').textContent;
            const location = selectedMatchCard.querySelector('.detail-item i.fa-location-dot').nextElementSibling.textContent;
            const dateTime = selectedMatchCard.querySelector('.detail-item i.fa-clock').nextElementSibling.textContent;
            const price = selectedMatchCard.querySelector('.price').textContent;
            const stadiumImage = selectedMatchCard.querySelector('.stadium-image').src;
            const league = selectedMatchCard.querySelector('.league-tag').textContent;
            
            // Store match data in localStorage
            const matchData = {
                title: matchTitle,
                location: location,
                dateTime: dateTime,
                price: price,
                stadiumImage: stadiumImage,
                league: league,
                stadium: getStadiumName(matchTitle)
            };
            
            localStorage.setItem('selectedMatch', JSON.stringify(matchData));
            
            // Navigate to step 2
            window.location.href = 'step2.html';
        });
    }
}

// Helper function to determine stadium based on match
function getStadiumName(matchTitle) {
    if (matchTitle.includes('Paris Saint-Germain vs Olympique Marseille')) {
        return 'Parc des Princes';
    } else if (matchTitle.includes('Lyon vs Monaco')) {
        return 'Groupama Stadium';
    } else if (matchTitle.includes('Paris Saint-Germain vs Lille')) {
        return 'Parc des Princes';
    }
    return 'Stadium';
}
