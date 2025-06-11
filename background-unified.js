// background-unified.js - Unified Background Script for Chrome & Firefox
// Works with both Manifest V3 (Chrome) and Manifest V2 (Firefox)

"use strict";

// Browser detection and API unification
const isFirefox = typeof browser !== 'undefined' && browser.runtime;
const isChrome = typeof chrome !== 'undefined' && chrome.runtime;

// Unified browser API
const api = (() => {
    if (isFirefox) {
        return browser;
    } else if (isChrome) {
        return chrome;
    } else {
        throw new Error('Unsupported browser environment');
    }
})();

// Browser-specific action API
const getActionAPI = () => {
    if (isFirefox) {
        return api.browserAction;
    } else if (isChrome) {
        return api.action || api.browserAction;
    }
    throw new Error('Action API not available');
};

// Log browser environment
console.log('🐑 Sheperd Background Script - Browser:', isFirefox ? 'Firefox' : 'Chrome');

// Constants
const DEFAULT_SETTINGS = {
    autoClose: false,
    duplicateThreshold: 2,
    oldTabDays: 7,
    enableNotifications: true,
    badgeEnabled: true,
};

const CLEANUP_ALARM_NAME = "cleanupAccessTimes";
const CLEANUP_INTERVAL_MINUTES = 1440; // 24 hours

// Installation and startup handlers
api.runtime.onInstalled.addListener(async(details) => {
    console.log("Sheperd extension installed/updated");

    try {
        if (details.reason === "install") {
            // Set default settings on first install
            await api.storage.sync.set({ settings: DEFAULT_SETTINGS });
            console.log("Default settings initialized");
        }

        // Initialize badge and cleanup alarm
        await initializeExtension();
    } catch (error) {
        console.error("Installation error:", error);
    }
});

api.runtime.onStartup.addListener(async() => {
    console.log("Sheperd extension started");
    await initializeExtension();
});

// Initialize extension features
async function initializeExtension() {
    try {
        // Update tab count badge
        await updateTabCountBadge();

        // Set up cleanup alarm
        await setupCleanupAlarm();

        console.log("Extension initialized successfully");
    } catch (error) {
        console.error("Initialization error:", error);
    }
}

// Tab event listeners for tracking and analytics
api.tabs.onCreated.addListener(async(tab) => {
    try {
        console.log("New tab created:", tab.url || "about:blank");
        await updateTabCountBadge();
        await updateTabAccessTime(tab.id);

        // Notify popup about tab changes
        await notifyPopupOfTabChanges('tab_created', { tab });
    } catch (error) {
        console.error("Tab creation handler error:", error);
    }
});

api.tabs.onRemoved.addListener(async(tabId, removeInfo) => {
    try {
        console.log("Tab closed:", tabId);
        await updateTabCountBadge();
        await cleanupTabAccessTime(tabId);

        // Notify popup about tab changes
        await notifyPopupOfTabChanges('tab_removed', { tabId });
    } catch (error) {
        console.error("Tab removal handler error:", error);
    }
});

api.tabs.onUpdated.addListener(async(tabId, changeInfo, tab) => {
    try {
        if (changeInfo.status === "complete" && tab.url) {
            // Track tab access time for "old tabs" feature
            await updateTabAccessTime(tabId);

            // Notify popup about tab changes
            await notifyPopupOfTabChanges('tab_updated', { tab, changeInfo });
        }
    } catch (error) {
        console.error("Tab update handler error:", error);
    }
});

api.tabs.onMoved.addListener(async(tabId, moveInfo) => {
    try {
        // Notify popup about tab changes
        await notifyPopupOfTabChanges('tab_moved', { tabId, moveInfo });
    } catch (error) {
        console.error("Tab move handler error:", error);
    }
});

api.tabs.onActivated.addListener(async(activeInfo) => {
    try {
        await updateTabAccessTime(activeInfo.tabId);

        // Notify popup about tab changes
        await notifyPopupOfTabChanges('tab_activated', { activeInfo });
    } catch (error) {
        console.error("Tab activation handler error:", error);
    }
});

// Window event listeners for badge updates
api.windows.onCreated.addListener(async() => {
    try {
        await updateTabCountBadge();
    } catch (error) {
        console.error("Window creation handler error:", error);
    }
});

api.windows.onRemoved.addListener(async() => {
    try {
        await updateTabCountBadge();
    } catch (error) {
        console.error("Window removal handler error:", error);
    }
});

// Tab access time tracking
async function updateTabAccessTime(tabId) {
    try {
        const result = await api.storage.local.get(["tabAccessTimes"]);
        const accessTimes = result.tabAccessTimes || {};

        accessTimes[tabId] = Date.now();

        await api.storage.local.set({ tabAccessTimes: accessTimes });
    } catch (error) {
        console.error("Error updating tab access time:", error);
    }
}

// Clean up specific tab access time
async function cleanupTabAccessTime(tabId) {
    try {
        const result = await api.storage.local.get(["tabAccessTimes"]);
        const accessTimes = result.tabAccessTimes || {};

        if (accessTimes[tabId]) {
            delete accessTimes[tabId];
            await api.storage.local.set({ tabAccessTimes: accessTimes });
        }
    } catch (error) {
        console.error("Error cleaning up tab access time:", error);
    }
}

// Badge management
async function updateTabCountBadge() {
    try {
        // Check if badge is enabled in settings
        const settingsData = await api.storage.sync.get(["settings"]);
        const settings = settingsData.settings || DEFAULT_SETTINGS;

        const actionAPI = getActionAPI();

        if (!settings.badgeEnabled) {
            await actionAPI.setBadgeText({ text: "" });
            return;
        }

        const tabs = await api.tabs.query({});
        const count = tabs.length;

        // Set badge text
        const badgeText = count > 99 ? "99+" : count.toString();
        await actionAPI.setBadgeText({ text: badgeText });

        // Set badge color based on tab count (Sheperd-o-meter)
        let badgeColor = "#10B981"; // Green for low count
        if (count > 50) badgeColor = "#EF4444"; // Red for high count
        else if (count > 35) badgeColor = "#F59E0B"; // Amber for medium-high
        else if (count > 20) badgeColor = "#3B82F6"; // Blue for medium

        await actionAPI.setBadgeBackgroundColor({ color: badgeColor });
    } catch (error) {
        console.error("Error updating badge:", error);
    }
}

// Alarm handlers
api.alarms.onAlarm.addListener(async(alarm) => {
    try {
        if (alarm.name === CLEANUP_ALARM_NAME) {
            console.log("Running scheduled cleanup");
            await cleanupOldAccessTimes();
        }
    } catch (error) {
        console.error("Alarm handler error:", error);
    }
});

// Setup cleanup alarm
async function setupCleanupAlarm() {
    try {
        // Clear existing alarm
        await api.alarms.clear(CLEANUP_ALARM_NAME);

        // Create new periodic alarm
        await api.alarms.create(CLEANUP_ALARM_NAME, {
            delayInMinutes: CLEANUP_INTERVAL_MINUTES,
            periodInMinutes: CLEANUP_INTERVAL_MINUTES,
        });

        console.log("Cleanup alarm set for every 24 hours");
    } catch (error) {
        console.error("Failed to setup cleanup alarm:", error);
    }
}

// Clean up old access times
async function cleanupOldAccessTimes() {
    try {
        const result = await api.storage.local.get(["tabAccessTimes"]);
        const accessTimes = result.tabAccessTimes || {};

        // Get current tab IDs
        const currentTabs = await api.tabs.query({});
        const currentTabIds = new Set(currentTabs.map(tab => tab.id));

        // Remove access times for closed tabs
        const cleanedTimes = {};
        Object.keys(accessTimes).forEach(tabId => {
            const id = parseInt(tabId);
            if (currentTabIds.has(id)) {
                cleanedTimes[tabId] = accessTimes[tabId];
            }
        });

        await api.storage.local.set({ tabAccessTimes: cleanedTimes });

        const removedCount = Object.keys(accessTimes).length - Object.keys(cleanedTimes).length;
        console.log(`Cleaned up ${removedCount} old tab access times`);
    } catch (error) {
        console.error("Failed to cleanup old access times:", error);
    }
}

// Notify popup of tab changes
async function notifyPopupOfTabChanges(eventType, data) {
    try {
        // Send message to popup if it's open
        api.runtime.sendMessage({
            type: 'TAB_CHANGE',
            eventType,
            data
        }).catch(() => {
            // Popup might not be open, ignore the error
            if (api.runtime.lastError) {
                // Clear the error
            }
        });
    } catch (error) {
        // Ignore messaging errors when popup is closed
    }
}

// Message listener for communication with popup
api.runtime.onMessage.addListener((message, sender, sendResponse) => {
    (async() => {
        try {
            if (message.action === "updateBadge") {
                await updateTabCountBadge();
                sendResponse({ success: true });
            } else if (message.action === "getTabStats") {
                const tabs = await api.tabs.query({});
                const result = await api.storage.local.get(["tabAccessTimes"]);

                sendResponse({
                    success: true,
                    data: {
                        totalTabs: tabs.length,
                        accessTimes: result.tabAccessTimes || {}
                    }
                });
            } else {
                sendResponse({ success: false, error: "Unknown action" });
            }
        } catch (error) {
            console.error("Message handler error:", error);
            sendResponse({ success: false, error: error.message });
        }
    })();

    // Return true to indicate async response
    return true;
});