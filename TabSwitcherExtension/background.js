let tabSwitcherInterval;
let countdownInterval;
let switchInterval = 30000; // Default interval is 30 seconds
let savedWindowId; // ID of the window where the timer was started
let badgeVisible = true; // To track if the badge should be shown
let timerRunning = false; // To track the state of the timer


function startCountdown() {
    let secondsLeft = switchInterval / 1000;

    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        secondsLeft--;
        if (secondsLeft <= 0) {
            secondsLeft = switchInterval / 1000;
            switchTab();
        }
    }, 1000);
}

function switchTab() {
    if (savedWindowId === undefined) {
        return;
    }

    chrome.tabs.query({windowId: savedWindowId}, function(tabs) {
        if (tabs.length <= 1) {
            return; // Don't switch if only one tab is open
        }

        chrome.tabs.query({active: true, windowId: savedWindowId}, function(activeTabs) {
            let currentTabIndex = activeTabs[0].index;
            let nextTabIndex = (currentTabIndex + 1) % tabs.length;

            chrome.tabs.update(tabs[nextTabIndex].id, {active: true}, () => {
                chrome.tabs.reload(tabs[nextTabIndex].id);
            });
        });
    });
}

function startTabSwitching() {
    clearInterval(tabSwitcherInterval);
    chrome.windows.getCurrent({}, (currentWindow) => {
        savedWindowId = currentWindow.id;
        tabSwitcherInterval = setInterval(switchTab, switchInterval);
        if (!timerRunning) {
            startCountdown();
            timerRunning = true;
        }
    });
}

function stopTabSwitching() {
    clearInterval(tabSwitcherInterval);
    clearInterval(countdownInterval);
    timerRunning = false;
}


function updateSwitchInterval(newInterval) {
    switchInterval = newInterval;
    if (timerRunning) {
        // Restart tab switching with new interval
        startTabSwitching();
    }
}

// Load the saved interval value when the background script starts
chrome.storage.local.get('switchInterval', function(data) {
    if (data.switchInterval) {
        updateSwitchInterval(parseInt(data.switchInterval, 10) * 1000); // Convert to milliseconds
    }
});


chrome.storage.local.get(['timerRunning'], function(data) {
    timerRunning = data.timerRunning || false;
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.command === "updateInterval") {
        updateSwitchInterval(parseInt(request.interval, 10) * 1000); // Convert to milliseconds
        chrome.storage.local.set({switchInterval: request.interval});
    } else if (request.command === "startTimer") {
        startTabSwitching();
        chrome.storage.local.set({timerRunning: true});
    } else if (request.command === "stopTimer") {
        stopTabSwitching();
        chrome.storage.local.set({timerRunning: false});
    }
});

