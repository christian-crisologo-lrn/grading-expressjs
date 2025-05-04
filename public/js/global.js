// Configuration object with default empty values
window.gradingConfig = {
    consumerKey: '',
    consumerSecret: '',
    graderId: '',
    gradeSessionId: '',
    studentId: '',
    assessSessionId: '',
    items: ''
};

// Load configuration from server if available
window.loadServerConfig = function() {
    const serverConfig = document.getElementById('server-config');
    if (!serverConfig?.textContent) return;
    
    try {
        const parsedConfig = JSON.parse(serverConfig.textContent);
        window.gradingConfig = { ...window.gradingConfig, ...parsedConfig };
        console.log('Loaded configuration from server:', window.gradingConfig);
    } catch (error) {
        console.error('Error parsing server config:', error);
    }
};

// Update configuration from form inputs
window.updateConfig = function() {
    return {
        consumerKey: document.getElementById('consumer-key').value,
        consumerSecret: document.getElementById('consumer-secret').value,
        userId: document.getElementById('grader-id').value,
        sessionId: document.getElementById('grade-session-id').value
    };
};

// Get signed request from server
window.getSignedRequest = async function() {
    try {
        const config = window.updateConfig();
        
        const response = await fetch('/api/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                consumerKey: config.consumerKey,
                consumerSecret: config.consumerSecret,
                userId: config.userId,
                sessionId: config.sessionId,
                items: ["MANGA-DEMO-1","MANGA-DEMO-2","MANGA-DEMO-4","MANGA-DEMO-5"]
            }),
        });
        
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
        showErrorNotification(error.message);
        throw error;
    }
};