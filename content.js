// Function to get unread count
function getUnreadCount() {
  // More specific selector for unread emails
  const unreadElements = document.querySelectorAll('.zA.zE, .zA.zE.zE');
  return unreadElements.length;
}

// Function to get read count
function getReadCount() {
  // More specific selector for read emails
  const readElements = document.querySelectorAll('.zA.yO, .zA.yO.yO');
  return readElements.length;
}

// Function to get email details
function getEmailDetails(element) {
  const subject = element.querySelector('.hP')?.textContent || 'Unknown Subject';
  const sender = element.querySelector('.gD')?.getAttribute('email') || 'Unknown Sender';
  const emailId = element.getAttribute('data-legacy-message-id') || Date.now().toString();
  const timestamp = new Date().toISOString();
  const isUnread = element.classList.contains('zE');
  
  return {
    subject,
    sender,
    emailId,
    timestamp,
    status: isUnread ? 'unread' : 'read'
  };
}

// Function to track email opens
function trackEmailOpens() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          // Check for both new emails and opened emails
          if (node.classList && (node.classList.contains('adn') || node.classList.contains('zA'))) {
            const emailDetails = getEmailDetails(node);
            
            chrome.runtime.sendMessage({
              type: 'EMAIL_OPENED',
              data: {
                ...emailDetails,
                deviceInfo: {
                  userAgent: navigator.userAgent,
                  platform: navigator.platform,
                  language: navigator.language
                }
              }
            });
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Function to track email list changes
function trackEmailList() {
  const observer = new MutationObserver(() => {
    const emailList = document.querySelectorAll('.zA');
    const emails = Array.from(emailList).map(getEmailDetails);
    
    chrome.runtime.sendMessage({
      type: 'UPDATE_EMAIL_LIST',
      data: emails
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Function to send stats to background script
function sendStats() {
  const stats = {
    unread: getUnreadCount(),
    read: getReadCount(),
    deviceInfo: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language
    }
  };
  
  chrome.runtime.sendMessage({
    type: 'UPDATE_STATS',
    data: stats
  });
}

// Initialize tracking
function initialize() {
  // Send initial stats
  sendStats();
  
  // Set up periodic stats update
  setInterval(sendStats, 2000); // Reduced interval for more frequent updates
  
  // Start tracking email opens
  trackEmailOpens();
  
  // Start tracking email list
  trackEmailList();
  
  // Listen for DOM changes to update stats
  const observer = new MutationObserver(() => {
    sendStats();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Start the extension
initialize(); 