        // Function to reset form fields
        function resetFormFields() {
            document.getElementById('registration-form').reset();
        }

        // Check if there's an error message in the URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const errorMessage = urlParams.get('error');
    
        // If there's an error message, display it
        if (errorMessage) {
            const errorDiv = document.getElementById('error-message');
            errorDiv.textContent = errorMessage;
            errorDiv.style.display = 'block'; // Ensure error message is displayed
        }

        // Event listener for pageshow to clear session on back navigation
        window.addEventListener('pageshow', function(event) {
            if (event.persisted) {
                resetFormFields();
                fetch('/clearbuyersession', {
                    method: 'POST'
                }).then(response => {
                    if (!response.ok) {
                        console.error('Failed to clear session');
                    }
                }).catch(error => {
                    console.error('Error:', error);
                });
            }
        });