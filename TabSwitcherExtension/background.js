let switchInterval = 1; // Default interval is 1 minute
let reloadInterval = 30; //minutes
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

function reloadTabs() {
    chrome.tabs.query({currentWindow: true}, function(tabs) {
        console.log(tabs);
        tabs.forEach(tab => {
            chrome.tabs.reload(tab.id);
            console.log(tab.id);
        });
    })
}

async function checkAlarmState() {
    const { alarmEnabled } = await chrome.storage.local.get('timerRunning');
    console.log("check if alarm is enabled");
    if (timerRunning){
        console.log("alarm is enabled, check for existence next");
        const alarm = await chrome.alarms.get('tabswitch-alarm');
        if (!alarm){
            await chrome.alarms.create('tabswitch-alarm', {
                delayInMinutes: switchInterval,
                periodInMinutes: switchInterval
            });
            console.log("new alarm created");
        } 
    }
}
chrome.storage.local.get(['timerRunning'], function(data) {
    timerRunning = data.timerRunning || false;
    
});

// Load the saved interval value when the background script starts
chrome.storage.local.get('switchInterval', function(data) {
    if (data.switchInterval) {
        this.switchInterval = data.switchInterval;
      //do persistence stuff for chrome alarm
    }
});
chrome.storage.local.get('reloadInterval', function(data) {
    if (data.reloadInterval) {
        this.reloadInterval = data.reloadInterval;
      //do persistence stuff for chrome alarm
    }
});




checkAlarmState();

chrome.alarms.onAlarm.addListener((alarm) => {
    if(alarm.name == 'tabswitch-alarm'){
        console.log("tabswitch ringing")
        switchTab();
    } if (alarm.name == 'reload-alarm'){
        console.log("reload ringing");
        reloadTabs();
    }
})
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.command === "updateInterval") {
        //update alarm interval of chrome alarm to request.interval
        chrome.alarms.get('tabswitch-alarm').periodInMinutes = request.interval;
        chrome.storage.local.set({switchInterval: request.interval});
        console.log("stored new intervall");
    } else if (request.command === "updateInterval_reload"){
        //update alarm interval of chrome alarm to request.interval
        chrome.alarms.get('reload-alarm').periodInMinutes = request.interval_reload;
        chrome.storage.local.set({reloadInterval: request.interval_reload});
        reloadInterval = request.interval_reload;
        console.log("stored new reload intervall");
    } else if (request.command === "startTimer") {
        //create chrome alarm for switching
         chrome.alarms.create('tabswitch-alarm', {
            delayInMinutes: switchInterval,
            periodInMinutes: switchInterval
        });
        //create chrome alarm for reloading
        chrome.alarms.create('reload-alarm', {
            delayInMinutes: reloadInterval,
            periodInMinutes: reloadInterval
        });
        console.log(reloadInterval);
        console.log("alarms created");
        
        chrome.storage.local.set({timerRunning: true});
    } else if (request.command === "stopTimer") {
        //clear chrome alarm
        chrome.alarms.clearAll();
        console.log("alarms cleared");
        chrome.storage.local.set({timerRunning: false});
    }
});
