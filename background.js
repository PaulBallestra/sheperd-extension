// background.js - Service Worker for Shepherd Tab Manager
// Manifest V3 Compatible Service Worker

'use strict';

// Constants
const DEFAULT_SETTINGS = {
  autoClose: false,
  duplicateThreshold: 2,
  oldTabDays: 7,
  enableNotifications: true,
  badgeEnabled: true
};

const CLEANUP_ALARM_NAME = 'cleanupAccessTimes';
const CLEANUP_INTERVAL_MINUTES = 1440; // 24 hours

// Installation and startup handlers
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Shepherd extension installed/updated');
  
  try {
    if (details.reason === 'install') {
      // Set default settings on first install
      await chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
      console.log('Default settings initialized');
    }
    
    // Initialize badge and cleanup alarm
    await initializeExtension();
    
  } catch (error) {
    console.error('Installation error:', error);
  }
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('Shepherd extension started');
  await initializeExtension();
});

// Initialize extension features
async function initializeExtension() {
  try {
    // Update tab count badge
    await updateTabCountBadge();
    
    // Set up cleanup alarm
    await setupCleanupAlarm();
    
    console.log('Extension initialized successfully');
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

// Tab event listeners for tracking and analytics
chrome.tabs.onCreated.addListener(async (tab) => {
  try {
    console.log('New tab created:', tab.url || 'chrome://');
    await updateTabCountBadge();
    await updateTabAccessTime(tab.id);
  } catch (error) {
    console.error('Tab creation handler error:', error);
  }
});

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  try {
    console.log('Tab closed:', tabId);
    await updateTabCountBadge();
    await cleanupTabAccessTime(tabId);
  } catch (error) {
    console.error('Tab removal handler error:', error);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  try {
    if (changeInfo.status === 'complete' && tab.url) {
      // Track tab access time for "old tabs" feature
      await updateTabAccessTime(tabId);
    }
  } catch (error) {
    console.error('Tab update handler error:', error);
  }
});

// Window event listeners for badge updates
chrome.windows.onCreated.addListener(async () => {
  try {
    await updateTabCountBadge();
  } catch (error) {
    console.error('Window creation handler error:', error);
  }
});

chrome.windows.onRemoved.addListener(async () => {
  try {
    await updateTabCountBadge();
  } catch (error) {
    console.error('Window removal handler error:', error);
  }
});

// Tab access time tracking
async function updateTabAccessTime(tabId) {
  try {
    const result = await chrome.storage.local.get(['tabAccessTimes']);
    const accessTimes = result.tabAccessTimes || {};
    
    accessTimes[tabId] = Date.now();
    
    await chrome.storage.local.set({ tabAccessTimes: accessTimes });
  } catch (error) {
    console.error('Error updating tab access time:', error);
  }
}

// Clean up specific tab access time
async function cleanupTabAccessTime(tabId) {
  try {
    const result = await chrome.storage.local.get(['tabAccessTimes']);
    const accessTimes = result.tabAccessTimes || {};
    
    if (accessTimes[tabId]) {
      delete accessTimes[tabId];
      await chrome.storage.local.set({ tabAccessTimes: accessTimes });
    }
  } catch (error) {
    console.error('Error cleaning up tab access time:', error);
  }
}

// Badge management
async function updateTabCountBadge() {
  try {
    // Check if badge is enabled in settings
    const settingsData = await chrome.storage.sync.get(['settings']);
    const settings = settingsData.settings || DEFAULT_SETTINGS;
    
    if (!settings.badgeEnabled) {
      await chrome.action.setBadgeText({ text: '' });
      return;
    }

    const tabs = await chrome.tabs.query({});
    const count = tabs.length;
    
    // Set badge text
    const badgeText = count > 99 ? '99+' : count.toString();
    await chrome.action.setBadgeText({ text: badgeText });
    
    // Set badge color based on tab count (shame-o-meter)
    let badgeColor = '#10B981'; // Green for low count
    if (count > 50) badgeColor = '#EF4444'; // Red for high count
    else if (count > 35) badgeColor = '#F59E0B'; // Amber for medium-high
    else if (count > 20) badgeColor = '#3B82F6'; // Blue for medium
    
    await chrome.action.setBadgeBackgroundColor({ color: badgeColor });
    
  } catch (error) {
    console.error('Error updating badge:', error);
  }
}

// Alarm handlers
chrome.alarms.onAlarm.addListener(async (alarm) => {
  try {
    if (alarm.name === CLEANUP_ALARM_NAME) {
      console.log('Running scheduled cleanup');
      await cleanupOldAccessTimes();
    }
  } catch (error) {
    console.error('Alarm handler error:', error);
  }
});

// Setup cleanup alarm
async function setupCleanupAlarm() {
  try {
    // Clear existing alarm first
    await chrome.alarms.clear(CLEANUP_ALARM_NAME);
    
    // Create new alarm
    await chrome.alarms.create(CLEANUP_ALARM_NAME, {
      delayInMinutes: CLEANUP_INTERVAL_MINUTES,
      periodInMinutes: CLEANUP_INTERVAL_MINUTES
    });
    
    console.log('Cleanup alarm set up successfully');
  } catch (error) {
    console.error('Error setting up cleanup alarm:', error);
  }
}

// Clean up old access times
async function cleanupOldAccessTimes() {
  try {
    const result = await chrome.storage.local.get(['tabAccessTimes']);
    const accessTimes = result.tabAccessTimes || {};
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    // Remove access times older than 7 days
    const cleanedTimes = {};
    let cleanupCount = 0;
    
    Object.entries(accessTimes).forEach(([tabId, time]) => {
      if (time > sevenDaysAgo) {
        cleanedTimes[tabId] = time;
      } else {
        cleanupCount++;
      }
    });
    
    await chrome.storage.local.set({ tabAccessTimes: cleanedTimes });
    console.log(`Cleaned up ${cleanupCount} old tab access records`);
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// Message handler for communication with popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      switch (message.action) {
        case 'updateBadge':
          await updateTabCountBadge();
          sendResponse({ success: true });
          break;
          
        case 'getTabStats':
          const tabs = await chrome.tabs.query({});
          const result = await chrome.storage.local.get(['tabAccessTimes']);
          const accessTimes = result.tabAccessTimes || {};
          
          sendResponse({
            success: true,
            data: {
              totalTabs: tabs.length,
              accessTimes: accessTimes
            }
          });
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Message handler error:', error);
      sendResponse({ success: false, error: error.message });
    }
  })();
  
  // Return true to indicate we'll respond asynchronously
  return true;
});

// Error handling for unhandled promise rejections
self.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection in service worker:', event.reason);
});

console.log('Shepherd background service worker loaded successfully');
  