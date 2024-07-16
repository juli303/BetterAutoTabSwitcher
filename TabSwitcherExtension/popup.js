let timerRunning = false;



document.addEventListener('DOMContentLoaded', function() {
    // Retrieve stored states for timer running, badge visibility, switch interval, and badge color
    chrome.storage.local.get(['timerRunning', 'switchInterval'], function(data) {
        // Update the state of timerRunning and badgeVisible
        timerRunning = data.timerRunning || false;

        // Set the interval in the UI
        let interval = data.switchInterval || 1; // Default to 30 seconds if not set
        document.getElementById('interval').value = interval;


        // Update the button states
        updateButtonState();
    });
});

function updateButtonState() {
    document.getElementById('toggleTimer').textContent = timerRunning ? "Stop Timer" : "Start Timer";
}


document.getElementById('save').addEventListener('click', () => {
    let interval = document.getElementById('interval').value;
    chrome.storage.local.set({switchInterval: interval}, function() {
        document.getElementById('status').textContent = 'The tabs will switch every ' + interval + ' minutes and refresh.';
        chrome.runtime.sendMessage({command: "updateInterval", interval: parseInt(interval, 10)});
    });
});

document.getElementById('toggleTimer').addEventListener('click', () => {
    timerRunning = !timerRunning;
    updateButtonState();
    chrome.runtime.sendMessage({command: timerRunning ? "startTimer" : "stopTimer"});
});

