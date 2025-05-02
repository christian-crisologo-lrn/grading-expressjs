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
    
    // Initialize panels based on their data-toggle-initial attribute
    function initTogglePanels() {
        // Handle the config form toggle button - always visible initially
        initSpecificToggle('toggle-config-btn', 'config-content', true);
        
        // Handle the attach form toggle button - hidden initially
        initSpecificToggle('toggle-attach-btn', 'attach-content', false);
        
        // Handle other toggle buttons
        document.querySelectorAll('.panel-header .toggle-btn').forEach(btn => {
            if (btn.id !== 'toggle-config-btn' && btn.id !== 'toggle-attach-btn' && btn.id !== 'toggle-items-btn') {
                const targetId = btn.getAttribute('data-target');
                if (targetId) {
                    const contentElement = document.querySelector(targetId);
                    if (contentElement) {
                        // Initialize as visible by default
                        contentElement.style.display = 'block';
                    }
                }
            }
        });
    }
    

});

// Initialize a specific toggle button and its content
function initSpecificToggle(btnId, contentId, isVisible = true) {
    const toggleBtn = document.getElementById(btnId);
    if (toggleBtn) {
        const contentElement = document.getElementById(contentId);
        if (contentElement) {
            // Set initial visibility
            contentElement.style.display = isVisible ? 'block' : 'none';
            
            // Update arrow direction
            updateArrowDirection(toggleBtn, isVisible);
        }
    }
}

// Toggle panel visibility - make this function global so it can be called from other scripts
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
    if (svg) {
        if (isOpen) {
            // Panel is open, arrow points down
            svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />';
        } else {
            // Panel is closed, arrow points right
            svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />';
        }
    }
}

// Make these functions globally available
window.togglePanel = togglePanel;
window.updateArrowDirection = updateArrowDirection;
