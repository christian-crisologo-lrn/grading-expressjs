// Panel Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all toggle panels
    initTogglePanels();
    
    // Add event listeners to toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const contentElement = document.querySelector(targetId);
            
            if (contentElement) {
                togglePanel(contentElement, this);
            }
        });
    });
});

// Initialize panels based on their data-toggle-initial attribute
function initTogglePanels() {
    // Handle specific panels with predefined states
    initSpecificToggle('toggle-config-btn', 'config-content', true);
    initSpecificToggle('toggle-attach-btn', 'attach-content', false);
    
    // Handle other toggle buttons - default to visible
    document.querySelectorAll('.panel-header .toggle-btn').forEach(btn => {
        if (!['toggle-config-btn', 'toggle-attach-btn', 'toggle-items-btn'].includes(btn.id)) {
            const targetId = btn.getAttribute('data-target');
            if (targetId) {
                const contentElement = document.querySelector(targetId);
                if (contentElement) {
                    contentElement.style.display = 'block';
                }
            }
        }
    });
}

// Initialize a specific toggle button and its content
function initSpecificToggle(btnId, contentId, isVisible = true) {
    const toggleBtn = document.getElementById(btnId);
    const contentElement = document.getElementById(contentId);
    
    if (!toggleBtn || !contentElement) return;
    
    // Set initial visibility
    contentElement.style.display = isVisible ? 'block' : 'none';
    
    // Update arrow direction
    updateArrowDirection(toggleBtn, isVisible);
}

// Toggle panel visibility
function togglePanel(content, toggleBtn) {
    if (!content || !toggleBtn) return;
    
    const isVisible = content.style.display !== 'none';
    
    // Toggle visibility
    content.style.display = isVisible ? 'none' : 'block';
    
    // Update arrow direction
    updateArrowDirection(toggleBtn, !isVisible);
}

// Update arrow direction based on panel state
function updateArrowDirection(toggleBtn, isOpen) {
    const svg = toggleBtn.querySelector('svg');
    if (!svg) return;
    
    svg.innerHTML = isOpen 
        ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />' // Down arrow
        : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />'; // Up arrow
}

// Make these functions globally available
window.togglePanel = togglePanel;
window.updateArrowDirection = updateArrowDirection;
window.initSpecificToggle = initSpecificToggle;
