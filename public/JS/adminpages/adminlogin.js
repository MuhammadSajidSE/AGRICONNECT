const urlParams = new URLSearchParams(window.location.search);
const errorMessage = urlParams.get('error');
if (errorMessage) {
    document.querySelector('.error-message').textContent = errorMessage;
}
function resetFormFields() {
    document.getElementById('loginForm').reset();
}

window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        resetFormFields();
        fetch('/clearAdminSession', {
        method: 'POST'
});
    }
});