let timerRunning = false;



document.addEventListener('DOMContentLoaded', function() {
    // Retrieve stored states for timer running, badge visibility, switch interval, and badge color
    chrome.storage.local.get(['timerRunning', 'switchInterval', 'reloadInterval'], function(data) {
        // Update the state of timerRunning and badgeVisible
        timerRunning = data.timerRunning || false;

        // Set the interval in the UI
        let interval = data.switchInterval || 1; // Default to 1 minute if not set
        let interval_reload = data.reloadInterval || 30;
        document.getElementById('interval').value = interval;
        document.getElementById('interval_reload').value = interval_reload;


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
        document.getElementById('status').textContent = 'The tabs will switch every ' + interval + ' minutes.';
        chrome.runtime.sendMessage({command: "updateInterval", interval: parseInt(interval, 10)});
    });
});

document.getElementById('save_reload').addEventListener('click', () => {
    let interval_reload = document.getElementById('interval_reload').value;
    chrome.storage.local.set({reloadInterval: interval_reload}, function() {
        document.getElementById('status').textContent = 'The tabs will reload every ' + interval_reload + ' minutes.';
        chrome.runtime.sendMessage({command: "updateInterval_reload", interval_reload: parseInt(interval_reload, 10)});
    });
});

document.getElementById('toggleTimer').addEventListener('click', () => {
    timerRunning = !timerRunning;
    updateButtonState();
    chrome.runtime.sendMessage({command: timerRunning ? "startTimer" : "stopTimer"});
});

