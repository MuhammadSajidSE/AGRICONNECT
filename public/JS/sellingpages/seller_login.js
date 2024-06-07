const urlParams = new URLSearchParams(window.location.search);
const errorMessage = urlParams.get('error');
if (errorMessage) {
    document.querySelector('.error-message').textContent = errorMessage;
}

function resetFormFields() {
    document.querySelector('form').reset();
}

window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        resetFormFields();
        fetch('/clearsellersession', {
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