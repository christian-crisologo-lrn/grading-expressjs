const gradingApp = {
    attachItem: async ( sessionId, userId, item, wrapper ) => {
        const hookElement = document.createElement('DIV');
        const payload = {
            sessionId,
            userId,
            item
        };
    
        wrapper.appendChild(hookElement);
    
        return window.gradingApp.attachItem(payload, hookElement)
    },
    save: async function() {
        return await window.gradingApp.save();
    }
};

const renderItems = async (activity, wrapper) => {
    let ctr = 0;
    const { items, sessionId, userId } = activity;

    while( ctr < items.length ) {
        const itemRef = items[ctr];

        await gradingApp.attachItem(sessionId, userId, itemRef, wrapper)
            .then((attachedItems) => {
                ctr++;
                return attachedItems;
            }).catch( (error) => {
                console.error(`attach item error userId : ${userId} : sessionId ${sessionId} : itemRef ${itemRef}`, error);
                ctr++;
            });
    }

    return true;
}

// Learnosity Grading Integration Module
(function() {
    // UI Component Factory
    const UI = {
        // Show spinner in a button
        showButtonSpinner: function(buttonId, message = '') {
            const button = document.getElementById(buttonId);
            if (!button) return;
            
            // Store original text
            button.dataset.originalText = button.textContent;
            
            // Show spinner in button
            button.innerHTML = `
                <svg class="animate-spin -ml-1 mr-1.5 h-3 w-3 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                ${message || 'Loading...'}
            `;
            
            // Disable button
            button.disabled = true;
            
            // Add gray background
            if (button.classList.contains('bg-green-600')) {
                button.classList.remove('bg-green-600', 'hover:bg-green-700');
                button.classList.add('bg-gray-400');
            } else if (button.classList.contains('bg-blue-600')) {
                button.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                button.classList.add('bg-gray-400');
            }
        },
        
        // Hide spinner from button
        hideButtonSpinner: function(buttonId) {
            const button = document.getElementById(buttonId);
            if (!button) return;
            
            // Restore original text
            if (button.dataset.originalText) {
                button.textContent = button.dataset.originalText;
                delete button.dataset.originalText;
            }
            
            // Enable button
            button.disabled = false;
            
            // Restore original background
            if (button.classList.contains('bg-gray-400')) {
                button.classList.remove('bg-gray-400');
                
                // Determine which color to restore based on button type
                if (buttonId === 'init-config-btn') {
                    button.classList.add('bg-green-600', 'hover:bg-green-700');
                } else {
                    button.classList.add('bg-blue-600', 'hover:bg-blue-700');
                }
            }
        },
        
        // Create error message
        showError: function(message) {
            const htmlString = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <strong class="font-bold">Error!</strong>
                    <span class="block sm:inline">${message}</span>
                </div>
            `;

            document.getElementById('inline-items-wrapper').innerHTML = htmlString;
        },

        hideError: function() {
            document.getElementById('inline-items-wrapper').innerHTML = '';
        },
        
        // Show notification
        showNotification: function(message, type = 'success') {
            const container = document.getElementById('notification');

            if (!container) return;
            
            const bgColor = type === 'success' 
            ? 'bg-green-100 border-green-400 text-green-700' 
            : 'bg-red-100 border-red-400 text-red-700';
            
            const htmlString = `
                <div class="${bgColor} border px-4 py-3 rounded relative mb-4">
                    <span class="block sm:inline">${message}</span>
                </div>
            `;

            // Create a new notification element
            const notificationElement = document.createElement('div');
            notificationElement.innerHTML = htmlString;
            
            if (container.firstChild) {
                container.firstChild.remove();
            }
            
            // Add the new notification
            container.appendChild(notificationElement);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                const currentNotification = container.querySelector('div');
                if (currentNotification) {
                    notificationElement.remove();
                }
            }, 2000);
        },

        initForm: function() {
            window.loadServerConfig();

            const config = window.gradingConfig;
    
            // Then populate form fields
            document.getElementById('consumer-key').value = config.consumerKey;
            document.getElementById('consumer-secret').value = config.consumerSecret;
            document.getElementById('grader-id').value = config.graderId;
            document.getElementById('grade-session-id').value = config.gradeSessionId;
            //
            document.getElementById('items').value = config.items;
            document.getElementById('student-id').value = config.studentId;
            document.getElementById('assess-session-id').value = config.assessSessionId;
        
        }
    };
    
    // Learnosity Integration Module
    const LearnosityIntegration = {
        // Load the Learnosity script
        loadScript: function() {
            UI.showButtonSpinner('init-config-btn', 'Loading script...');
            
            const script = document.createElement('script');
            script.src = 'https://grading.learnosity.com/';
            script.async = true;
            script.onload = this.loadConfig.bind(this);
            script.onerror = (e) => {
                console.error('Script failed to load', e);
                UI.hideButtonSpinner('init-config-btn');
                UI.showError('Failed to load Learnosity Grading script.');
            };
            document.head.appendChild(script);
        },
        
        // Initialize Learnosity Grading
        loadConfig: async function() {
            // Check if the Learnosity script has loaded
            if (typeof LearnosityGrading === 'undefined') {
                console.error('Learnosity Grading script not loaded');
                UI.hideButtonSpinner('init-config-btn');
                UI.showError('Learnosity Grading script failed to load.');
                return;
            }
            
            try {

                initSpecificToggle('toggle-config-btn', 'config-content', false);
                initSpecificToggle('toggle-attach-btn', 'attach-content', true);


                // Get the signed request using the current configuration
                const signedRequest = await window.getSignedRequest();

                // Initialize the grading app
                LearnosityGrading.init(signedRequest)
                .then((app) => {
                    window.gradingApp = app;
                    console.log('Learnosity Grading initialized');
                    UI.showNotification('Learnosity Grading initialized successfully!');
                    UI.hideButtonSpinner('init-config-btn');
                    
                    // Open the attach item panel after successful initialization
                    const attachContent = document.getElementById('attach-content');
                    const toggleAttachBtn = document.getElementById('toggle-attach-btn');
                    if (attachContent && toggleAttachBtn && attachContent.style.display === 'none') {
                        togglePanel(attachContent, toggleAttachBtn);
                    }
                })
                .catch((error) => {
                    console.error('Error initializing Learnosity Grading:', error);
                    UI.showError(`Failed to initialize Learnosity Grading: ${error.message}`);
                    UI.hideButtonSpinner('init-config-btn');
                });
            } catch (error) {
                console.error('Error initializing Learnosity Grading:', error);
                UI.showError(`Failed to initialize Learnosity Grading: ${error.message}`);
                UI.hideButtonSpinner('init-config-btn');
            }
        },
        
        // Save grading data
        save: function() {
            const submitButton = document.getElementById('submit-btn');
            if (!submitButton) return;
            
            if (!window.gradingApp) {
                console.error('Grading app not initialized');
                UI.showNotification('Grading app not initialized. Please initialize configuration first.', 'error');
                return;
            }
            
            // Show loading state in button
            UI.showButtonSpinner('submit-btn', 'Submitting...');
            
            gradingApp.save()
                .then((response) => {
                    console.log('save response', response);
                    UI.showNotification('Grading saved successfully!');
                    UI.hideButtonSpinner('submit-btn');
                })
                .catch((error) => {
                    console.error('save error', error);
                    UI.showNotification('Error saving grading: ' + error.message, 'error');
                    UI.hideButtonSpinner('submit-btn');
                });
        }
    };
    
    // Event Handlers
    const EventHandlers = {
        loadConfig: function() {
            // Update the configuration with form values
            window.updateConfig();
            
            // If already initialized, we need to reinitialize
            if (window.gradingApp) {
                // Clear the wrapper element
                const wrapperElement = document.getElementById('inline-items-wrapper');
                if (wrapperElement) {
                    wrapperElement.innerHTML = '';
                }
                
                // Reinitialize Learnosity
                LearnosityIntegration.loadConfig();
            } else {
                // First time initialization
                UI.initForm();
                //
                LearnosityIntegration.loadScript();
            }
        },
        
        // Submit grading
        submitGrading: function() {
            LearnosityIntegration.save();
        },

        attachIems: async function() {
            UI.showButtonSpinner('attach-item-btn', 'Attaching...');

            const itemsInput = document.getElementById('items');
            const studentIdInput = document.getElementById('student-id');
            const sessionIdInput = document.getElementById('assess-session-id');
            const wrapper = document.getElementById('inline-items-wrapper');

            if (!itemsInput || !studentIdInput || !sessionIdInput || !wrapper) {
                console.error('Missing required inputs');
                UI.showError('Missing required inputs');
                UI.hideButtonSpinner('attach-item-btn');
                return;
            }

            const items = itemsInput.value.split(',').map(item => item.trim());
            const studentId = studentIdInput.value;
            const sessionId = sessionIdInput.value;

            const payload ={
                items,
                sessionId,
                userId: studentId
            };

            await renderItems(payload, wrapper);

            UI.hideButtonSpinner('attach-item-btn');
        }
    };
    
    // Initialize the application when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        // Set up event listeners
        const loadConfigBtn = document.getElementById('init-config-btn');
        const submitButton = document.getElementById('submit-btn');
        const attachItemButton = document.getElementById('attach-item-btn');

        if (loadConfigBtn) {
            loadConfigBtn.addEventListener('click', EventHandlers.loadConfig);
        }
        
        if (submitButton) {
            submitButton.addEventListener('click', EventHandlers.submitGrading);
        }

        if (attachItemButton) {
            attachItemButton.addEventListener('click', EventHandlers.attachIems);
        }
    });
})();
