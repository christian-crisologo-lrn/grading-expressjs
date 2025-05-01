document.addEventListener('DOMContentLoaded', () => {
    // Reference to elements
    const wrapperElement = document.getElementById('inline-items-wrapper');
    const submitButton = document.getElementById('submit-btn');
    const initConfigButton = document.getElementById('init-config-btn');
    
    let learnosityInitialized = false;

    // Function to show a notification
    function showNotification(message, type = 'success') {
        const notificationDiv = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700';
        notificationDiv.className = `${bgColor} border px-4 py-3 rounded relative mt-4`;
        notificationDiv.innerHTML = `<span class="block sm:inline">${message}</span>`;
        
        const container = document.querySelector('.max-w-4xl');
        container.insertBefore(notificationDiv, container.firstChild);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            notificationDiv.remove();
        }, 5000);
    }

    // Function to initialize Learnosity grading
    async function initLearnosity() {
        // Add loading indicator to wrapper
        wrapperElement.innerHTML = `
            <div class="flex justify-center items-center h-40">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        `;
        
        // Check if the Learnosity script has loaded
        if (typeof LearnosityGrading === 'undefined') {
            console.error('Learnosity Grading script not loaded');
            wrapperElement.innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <strong class="font-bold">Error!</strong>
                    <span class="block sm:inline">Learnosity Grading script failed to load.</span>
                </div>
            `;
            return;
        }
        
        try {
            // Get the signed request using the current configuration
            const signedRequest = await window.getSignedRequest();

            // Initialize the grading app
            LearnosityGrading.init(signedRequest)
            .then((app) => {
                window.gradingApp = app;
                learnosityInitialized = true;
                console.log('Learnosity Grading initialized');
                showNotification('Learnosity Grading initialized successfully!');
                 wrapperElement.innerHTML = ``;
            })
            .catch((error) => {
                console.error('Error initializing Learnosity Grading:', error);
                wrapperElement.innerHTML = `
                    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        <strong class="font-bold">Error!</strong>
                        <span class="block sm:inline">Failed to initialize Learnosity Grading: ${error.message}</span>
                    </div>
                `;
            });
        } catch (error) {
            console.error('Error initializing Learnosity Grading:', error);
            wrapperElement.innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <strong class="font-bold">Error!</strong>
                    <span class="block sm:inline">Failed to initialize Learnosity Grading: ${error.message}</span>
                </div>
            `;
        }
    }

    // Add event listener to the init config button
    if (initConfigButton) {
        initConfigButton.addEventListener('click', () => {
            // Update the configuration with form values
            window.updateConfig();
            
            // If already initialized, we need to reinitialize
            if (learnosityInitialized) {
                // Clear the wrapper element
                if (wrapperElement) {
                    wrapperElement.innerHTML = '';
                }
                
                // Reinitialize Learnosity
                initLearnosity();
            } else {
                // First time initialization
                loadLearnosityScript();
            }
        });
    }

    // Add event listener to the submit button
    if (submitButton) {
        submitButton.addEventListener('click', () => {
            if (window.gradingApp) {
                // Show loading state
                submitButton.textContent = 'Submitting...';
                submitButton.disabled = true;
                submitButton.classList.add('bg-gray-400');
                submitButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                
                window.gradingApp.save()
                    .then((response) => {
                        console.log('save response', response);
                        showNotification('Grading saved successfully!');
                        
                        // Reset button state
                        submitButton.textContent = 'Submit';
                        submitButton.disabled = false;
                        submitButton.classList.remove('bg-gray-400');
                        submitButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
                    })
                    .catch((error) => {
                        console.error('save error', error);
                        showNotification('Error saving grading: ' + error.message, 'error');
                        
                        // Reset button state
                        submitButton.textContent = 'Submit';
                        submitButton.disabled = false;
                        submitButton.classList.remove('bg-gray-400');
                        submitButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
                    });
            } else {
                console.error('Grading app not initialized');
                showNotification('Grading app not initialized. Please initialize configuration first.', 'error');
            }
        });
    }

    // Load the Learnosity script
    function loadLearnosityScript() {
        // Show loading indicator
        wrapperElement.innerHTML = `
            <div class="flex justify-center items-center h-40">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span class="ml-3">Loading Learnosity Grading...</span>
            </div>
        `;
        
        const script = document.createElement('script');
        script.src = 'https://grading.learnosity.com/';
        script.async = true;
        script.onload = initLearnosity;
        script.onerror = (e) => {
            console.error('Script failed to load', e);
            wrapperElement.innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <strong class="font-bold">Error!</strong>
                    <span class="block sm:inline">Failed to load Learnosity Grading script.</span>
                </div>
            `;
        };
        document.head.appendChild(script);
    }
});
