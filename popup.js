// Function to format timestamp
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

// Function to update stats display
function updateStatsDisplay(stats) {
  document.getElementById('unread-count').textContent = stats.unread;
  document.getElementById('read-count').textContent = stats.read;
}

// Function to update device list
function updateDeviceList(devices) {
  const deviceList = document.getElementById('devices-list');
  const deviceCount = document.getElementById('device-count');
  deviceList.innerHTML = '';
  
  deviceCount.textContent = devices.length;
  
  devices.forEach(device => {
    const deviceItem = document.createElement('div');
    deviceItem.className = 'device-item';
    deviceItem.textContent = device;
    deviceList.appendChild(deviceItem);
  });
}

// Function to update email list
function updateEmailList(emails, filter = 'all') {
  const emailList = document.getElementById('email-list');
  emailList.innerHTML = '';
  
  const filteredEmails = filter === 'all' 
    ? emails 
    : emails.filter(email => email.status === filter);
  
  filteredEmails.forEach(email => {
    const emailItem = document.createElement('div');
    emailItem.className = `email-item ${email.status}`;
    emailItem.innerHTML = `
      <strong>${email.subject}</strong>
      <span class="status ${email.status}">${email.status}</span><br>
      From: ${email.sender}<br>
      Time: ${formatTimestamp(email.timestamp)}
    `;
    emailList.appendChild(emailItem);
  });
}

// Function to update activity list
function updateActivityList(activities) {
  const activityList = document.getElementById('activity-list');
  activityList.innerHTML = '';
  
  activities.forEach(activity => {
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
      <strong>${activity.subject}</strong><br>
      From: ${activity.sender}<br>
      Device: ${activity.deviceInfo.platform}<br>
      Time: ${formatTimestamp(activity.timestamp)}
    `;
    activityList.appendChild(activityItem);
  });
}

// Function to initialize popup
function initializePopup() {
  // Get all data from storage
  chrome.storage.local.get(['stats', 'recentActivity', 'emailList', 'devices'], (result) => {
    const stats = result.stats || { unread: 0, read: 0 };
    const recentActivity = result.recentActivity || [];
    const emailList = result.emailList || [];
    const devices = result.devices || [];
    
    updateStatsDisplay(stats);
    updateDeviceList(devices);
    updateEmailList(emailList);
    updateActivityList(recentActivity);
  });
}

// Initialize popup when it opens
document.addEventListener('DOMContentLoaded', initializePopup);

// Set up filter buttons
document.querySelectorAll('.filter-btn').forEach(button => {
  button.addEventListener('click', () => {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    // Update email list with filter
    chrome.storage.local.get(['emailList'], (result) => {
      updateEmailList(result.emailList || [], button.dataset.filter);
    });
  });
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.stats) {
    updateStatsDisplay(changes.stats.newValue);
  }
  if (changes.recentActivity) {
    updateActivityList(changes.recentActivity.newValue);
  }
  if (changes.emailList) {
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
    updateEmailList(changes.emailList.newValue, activeFilter);
  }
  if (changes.devices) {
    updateDeviceList(changes.devices.newValue);
  }
}); 