// Btoa App V2 - Main JavaScript File

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log('Btoa App V2 initialized');
    initializeEventListeners();
});

// Initialize all event listeners
function initializeEventListeners() {
    const myButton = document.getElementById('myButton');
    
    if (myButton) {
        myButton.addEventListener('click', handleButtonClick);
    }
}

// Handle button click event
function handleButtonClick() {
    console.log('Button clicked!');
    showAlert('Tombol berhasil diklik!');
}

// Show alert function
function showAlert(message) {
    alert(message);
}

// Utility function to log messages
function log(message) {
    console.log(`[Btoa App] ${message}`);
}

// Example function for API calls (if needed in the future)
function fetchData(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleButtonClick,
        showAlert,
        log,
        fetchData
    };
}
