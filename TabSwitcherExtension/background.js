let switchInterval = 1; // Default interval is 1 minute
let savedWindowId; // ID of the window where the timer was started
let timerRunning = false; // To track the state of the timer

function switchTab() {
    
    chrome.tabs.query({currentWindow: true}, function(tabs) {
        if (tabs.length <= 1) {
            return; // Don't switch if only one tab is open
        }

        chrome.tabs.query({active: true, currentWindow: true}, function(activeTabs) {
            let currentTabIndex = activeTabs[0].index;
            let nextTabIndex = (currentTabIndex + 1) % tabs.length;
            console.log("switch");
            chrome.tabs.update(tabs[nextTabIndex].id, {active: true}, () => {
               // chrome.tabs.reload(tabs[nextTabIndex].id);
            });
        });
    });
}


// Load the saved interval value when the background script starts
chrome.storage.local.get('switchInterval', function(data) {
    if (data.switchInterval) {
        this.switchInterval = data.switchInterval;
      //do persistence stuff for chrome alarm
    }
});


chrome.storage.local.get(['timerRunning'], function(data) {
    timerRunning = data.timerRunning || false;
    if (timerRunning){
        const alarm = chrome.alarms.get('tabswitch-alarm');
        if (!alarm){
            chrome.alarms.create('tabswitch-alarm', {
                delayInMinutes: switchInterval,
                periodInMinutes: switchInterval
            });
        }
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.command === "updateInterval") {
        //update alarm interval of chrome alarm to request.interval
        chrome.storage.local.set({switchInterval: request.interval});
    } else if (request.command === "startTimer") {
        //create chrome alarm
         chrome.alarms.create('tabswitch-alarm', {
            delayInMinutes: switchInterval,
            periodInMinutes: switchInterval
        });
        console.log("alarm created");
        chrome.alarms.onAlarm.addListener((alarm) => {
            if(alarm.name = 'tabswitch-alarm'){
                console.log("tabswitch ringing")
                switchTab();
            }
        })
        chrome.storage.local.set({timerRunning: true});
    } else if (request.command === "stopTimer") {
        //clear chrome alarm
        chrome.alarms.clearAll();
        chrome.storage.local.set({timerRunning: false});
    }
});
