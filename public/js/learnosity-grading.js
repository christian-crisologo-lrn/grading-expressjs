// Learnosity Grading Integration Module
(function() {
    // UI Component Factory
    const UI = {
        showSpinner: function(message = '') {
            
            const spinnerHtml = `
                <div class="flex justify-center items-center h-40">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    ${message ? `<span class="ml-3">${message}</span>` : ''}
                </div>
            `;

            document.getElementById('loader').innerHTML = spinnerHtml;
        },

        hideSpinner: function() {
            document.getElementById('loader').innerHTML = '';
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

            const notificationElement = document.createElement('div');
            notificationElement.innerHTML = htmlString;
            
            container.insertBefore(notificationElement, container.firstChild);
            
            setTimeout(() => {
                notificationElement.remove();
            }, 5000);
        },
        
        togglePanel: function(content, toggleBtn) {
            if (!content || !toggleBtn) return;
            
            const isVisible = content.style.display !== 'none';
            
            if (isVisible) {
                // Hide the content
                content.style.display = 'none';
                // Change the icon to "show"
                toggleBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                `;
            } else {
                // Show the content
                content.style.display = 'block';
                // Change the icon to "hide"
                toggleBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                `;
            }
        }
        
    };
    
    // Learnosity Integration Module
    const LearnosityIntegration = {
        initialized: false,
        app: null,
        
        // Load the Learnosity script
        loadScript: function() {
            const script = document.createElement('script');
            script.src = 'https://grading.learnosity.com/';
            script.async = true;
            script.onload = this.initialize.bind(this);
            script.onerror = (e) => {
                console.error('Script failed to load', e);

                UI.showError('Failed to load Learnosity Grading script.');
            };
            document.head.appendChild(script);
        },
        
        // Initialize Learnosity Grading
        initialize: async function() {
            // Check if the Learnosity script has loaded
            if (typeof LearnosityGrading === 'undefined') {
                console.error('Learnosity Grading script not loaded');
                UI.showError('Learnosity Grading script failed to load.');
                
                return;
            }
            
            try {
                // Get the signed request using the current configuration
                const signedRequest = await window.getSignedRequest();

                // Initialize the grading app
                LearnosityGrading.init(signedRequest)
                .then((app) => {
                    this.app = app;
                    window.gradingApp = app; // For backward compatibility
                    this.initialized = true;
                    console.log('Learnosity Grading initialized');
                    UI.showNotification('Learnosity Grading initialized successfully!');

                    UI.hideSpinner();

                })
                .catch((error) => {
                    console.error('Error initializing Learnosity Grading:', error);
                    UI.EL.wrapper.innerHTML = UI.showError(`Failed to initialize Learnosity Grading: ${error.message}`);

                    UI.hideSpinner();
                });
            } catch (error) {
                console.error('Error initializing Learnosity Grading:', error);
                UI.EL.wrapper.innerHTML = UI.showError(`Failed to initialize Learnosity Grading: ${error.message}`);

                UI.hideSpinner();
            }
        },
        
        // Save grading data
        save: function() {
            const submitButton = document.getElementById('submit-btn');
            if (!submitButton) return;
            
            if (!this.app) {
                console.error('Grading app not initialized');
                UI.showNotification('Grading app not initialized. Please initialize configuration first.', 'error');
                
                return;
            }
            
            // Show loading state
            submitButton.textContent = 'Submitting...';
            submitButton.disabled = true;
            submitButton.classList.add('bg-gray-400');
            submitButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');
            
            this.app.save()
                .then((response) => {
                    console.log('save response', response);
                    UI.showNotification('Grading saved successfully!');
                    
                    // Reset button state
                    this._resetButtonState(submitButton);
                })
                .catch((error) => {
                    console.error('save error', error);
                    UI.showNotification('Error saving grading: ' + error.message, 'error');
                    
                    // Reset button state
                    this._resetButtonState(submitButton);
                });
        },
        
        // Reset button state (private helper)
        _resetButtonState: function(button) {
            button.textContent = 'Submit';
            button.disabled = false;
            button.classList.remove('bg-gray-400');
            button.classList.add('bg-blue-600', 'hover:bg-blue-700');
        }
    };
    
    // Event Handlers
    const EventHandlers = {
        // Initialize configuration
        initConfig: function() {
            UI.showSpinner('Loading Learnosity Grading...');
            // Update the configuration with form values
            window.updateConfig();
            
            // If already initialized, we need to reinitialize
            if (LearnosityIntegration.initialized) {
                // Clear the wrapper element
                const wrapperElement = document.getElementById('inline-items-wrapper');
                if (wrapperElement) {
                    wrapperElement.innerHTML = '';
                }
                
                // Reinitialize Learnosity
                LearnosityIntegration.initialize();
            } else {
                // First time initialization
                LearnosityIntegration.loadScript();
            }
        },
        
        // Submit grading
        submitGrading: function() {
            LearnosityIntegration.save();
        },
        
        // Toggle configuration panel
        toggleConfig: function() {
            const content = document.getElementById('config-content');
            const toggleBtn = document.getElementById('toggle-config-btn');
            UI.togglePanel(content, toggleBtn);
        },

         // Toggle attach item
         toggleAttachItem: function() {
            const content = document.getElementById('attach-item-content');
            const toggleBtn = document.getElementById('toggle-attach-item-btn');
            UI.togglePanel(content, toggleBtn);
        }
    };
    
    // Initialize the application when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize form fields with default values
        if (typeof window.initFormFields === 'function') {
            window.initFormFields();
        }
        
        // Set up event listeners
        const initConfigButton = document.getElementById('init-config-btn');
        const submitButton = document.getElementById('submit-btn');
        const toggleConfigButton = document.getElementById('toggle-config-btn');
        const toggleAttachItemButton = document.getElementById('toggle-attach-item-btn');
        
        if (initConfigButton) {
            initConfigButton.addEventListener('click', EventHandlers.initConfig);
        }
        
        if (submitButton) {
            submitButton.addEventListener('click', EventHandlers.submitGrading);
        }
        
        if (toggleConfigButton) {
            toggleConfigButton.addEventListener('click', EventHandlers.toggleConfig);
        }

        if (toggleAttachItemButton) {
            toggleAttachItemButton.addEventListener('click', EventHandlers.toggleAttachItem);
        }
    });
    
    // Expose public API
    window.LearnosityGradingApp = {
        initialize: LearnosityIntegration.initialize.bind(LearnosityIntegration),
        save: LearnosityIntegration.save.bind(LearnosityIntegration),
        showNotification: UI.showNotification.bind(UI),
        toggleConfig: UI.toggleConfig.bind(UI)
    };
})();
