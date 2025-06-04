// Initialize storage with default values
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    stats: {
      unread: 0,
      read: 0
    },
    recentActivity: [],
    emailList: [],
    devices: new Set()
  });
});

// Function to get device identifier
function getDeviceId(deviceInfo) {
  return `${deviceInfo.platform}-${deviceInfo.language}`;
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_STATS') {
    // Update stats in storage
    chrome.storage.local.get(['devices'], (result) => {
      const devices = result.devices || new Set();
      const deviceId = getDeviceId(message.data.deviceInfo);
      devices.add(deviceId);
      
      chrome.storage.local.set({ 
        stats: message.data,
        devices: Array.from(devices)
      });
    });
  } else if (message.type === 'EMAIL_OPENED') {
    // Add new activity to recent activity list
    chrome.storage.local.get(['recentActivity', 'devices'], (result) => {
      const recentActivity = result.recentActivity || [];
      const devices = result.devices || new Set();
      const deviceId = getDeviceId(message.data.deviceInfo);
      devices.add(deviceId);
      
      recentActivity.unshift({
        ...message.data,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 10 activities
      if (recentActivity.length > 10) {
        recentActivity.pop();
      }
      
      chrome.storage.local.set({ 
        recentActivity,
        devices: Array.from(devices)
      });
    });
  } else if (message.type === 'UPDATE_EMAIL_LIST') {
    // Update the email list with current status
    chrome.storage.local.set({ emailList: message.data });
  }
}); 