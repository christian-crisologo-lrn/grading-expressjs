// Default configuration
let config = {
    consumerKey: 'yis0TYCu7U9V4o7M',
    consumerSecret: '74c5fd430cf1242a527f6223aebd42d30464be22',
    sessionId: 'b70cc674-9e06-4405-b326-3de3fd9450b3',
    userId: '5b2c168d-6873-434b-9cd4-d4cb97e287b2',
};

// Function to initialize form fields with config values
window.initFormFields = function() {
    document.getElementById('consumer-key').value = config.consumerKey;
    document.getElementById('consumer-secret').value = config.consumerSecret;
    document.getElementById('user-id').value = config.userId;
    document.getElementById('session-id').value = config.sessionId;
};

// Function to update configuration from form inputs
window.updateConfig = function() {
    config = {
        consumerKey: document.getElementById('consumer-key').value,
        consumerSecret: document.getElementById('consumer-secret').value,
        userId: document.getElementById('user-id').value,
        sessionId: document.getElementById('session-id').value
    };
    console.log('Configuration updated:', config);
    return config;
};

// Expose getSignedRequest globally
window.getSignedRequest = async function() {
    try {
        // Show loading state
        const initButton = document.getElementById('init-config-btn');
        const originalText = initButton.textContent;
        initButton.textContent = 'Loading...';
        initButton.disabled = true;
        initButton.classList.add('bg-gray-400');
        initButton.classList.remove('bg-green-600', 'hover:bg-green-700');
        
        const response = await fetch('/api/init', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                consumerKey: config.consumerKey,
                consumerSecret: config.consumerSecret,
                userId: config.userId,
                sessionId: config.sessionId,
                items: ["MANGA-DEMO-1","MANGA-DEMO-2","MANGA-DEMO-4","MANGA-DEMO-5"]
            }),
        });
        
        // Reset button state
        initButton.textContent = originalText;
        initButton.disabled = false;
        initButton.classList.remove('bg-gray-400');
        initButton.classList.add('bg-green-600', 'hover:bg-green-700');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to generate signed request');
        }
        
        return data.signedRequest;
        
    } catch (error) {
        console.error('Error getting signed request:', error);
        // Show error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4';
        errorDiv.innerHTML = `<strong class="font-bold">Error!</strong> <span class="block sm:inline">${error.message}</span>`;
        
        const configSection = document.querySelector('.bg-white');
        configSection.appendChild(errorDiv);
        
        // Remove error after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
        
        throw error;
    }
};

// Initialize form fields when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.initFormFields();
});
