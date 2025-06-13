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
    resourceMonitoring: true,
    resourceScanInterval: 3, // seconds
};

const CLEANUP_ALARM_NAME = "cleanupAccessTimes";
const RESOURCE_SCAN_ALARM_NAME = "resourceScan";
const CLEANUP_INTERVAL_MINUTES = 1440; // 24 hours
const RESOURCE_SCAN_INTERVAL_SECONDS = 5; // Optimized resource scanning (was 3, increased for performance)

// Resource monitoring configuration
const RESOURCE_CONFIG = {
    // Heavy domains for heuristic analysis (Firefox)
    HEAVY_DOMAINS: new Set([
        "youtube.com", "netflix.com", "figma.com", "canva.com",
        "docs.google.com", "sheets.google.com", "slides.google.com",
        "facebook.com", "instagram.com", "twitter.com", "x.com",
        "discord.com", "twitch.tv", "spotify.com", "soundcloud.com",
        "github.com", "gitlab.com", "codesandbox.io", "replit.com"
    ]),

    // Memory estimation coefficients (Firefox)
    MEMORY_ESTIMATES: {
        base: 50, // Base memory per tab (MB)
        heavyDomain: 80, // Additional for heavy domains
        loaded: 30, // Additional for loaded tabs
        video: 100, // Additional for video sites
        complex: 40 // Additional for complex sites
    },

    // CPU estimation factors (Firefox)
    CPU_ESTIMATES: {
        base: 0.5, // Base CPU per tab (%)
        loading: 5, // Additional while loading
        heavy: 3, // Additional for heavy domains
        active: 2 // Additional for active tab
    }
};

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

        // 🔥 NEW: Initialize creation times for existing tabs
        await initializeExistingTabCreationTimes();

        // Set up cleanup alarm
        await setupCleanupAlarm();

        // Initialize resource monitoring
        await initializeResourceMonitoring();

        console.log("Extension initialized successfully");
    } catch (error) {
        console.error("Initialization error:", error);
    }
}

// 🔥 NEW: Initialize creation times for tabs that were already open
async function initializeExistingTabCreationTimes() {
    try {
        const tabs = await api.tabs.query({});
        const result = await api.storage.local.get(["tabCreationTimes"]);
        const creationTimes = result.tabCreationTimes || {};

        let newTabsTracked = 0;
        const currentTime = Date.now();

        for (const tab of tabs) {
            if (!creationTimes[tab.id]) {
                // Estimate creation time based on tab ID (heuristic)
                // Chrome assigns sequential IDs, so lower IDs = older tabs
                const minTabId = Math.min(...tabs.map(t => t.id));
                const maxTabId = Math.max(...tabs.map(t => t.id));
                const tabIdRange = maxTabId - minTabId;

                // Estimate age based on position in ID range (max 24 hours ago)
                const relativePosition = (tab.id - minTabId) / (tabIdRange || 1);
                const estimatedAge = Math.min(24 * 60 * 60 * 1000, (1 - relativePosition) * 6 * 60 * 60 * 1000); // Max 6 hours spread
                const estimatedCreationTime = currentTime - estimatedAge;

                creationTimes[tab.id] = estimatedCreationTime;
                newTabsTracked++;
            }
        }

        if (newTabsTracked > 0) {
            await api.storage.local.set({ tabCreationTimes: creationTimes });
            console.log(`📅 Initialized creation times for ${newTabsTracked} existing tabs`);
        }
    } catch (error) {
        console.error("Error initializing existing tab creation times:", error);
    }
}

// Tab event listeners for tracking and analytics
api.tabs.onCreated.addListener(async(tab) => {
    try {
        console.log("New tab created:", tab.url || "about:blank");
        await updateTabCountBadge();
        await updateTabAccessTime(tab.id);

        // 🔥 NEW: Track actual creation time
        await trackTabCreationTime(tab.id);

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

// 🔥 NEW: Enhanced tab creation time tracking
async function trackTabCreationTime(tabId) {
    try {
        const result = await api.storage.local.get(["tabCreationTimes"]);
        const creationTimes = result.tabCreationTimes || {};

        // Only set creation time if not already tracked
        if (!creationTimes[tabId]) {
            creationTimes[tabId] = Date.now();
            await api.storage.local.set({ tabCreationTimes: creationTimes });
            console.log(`📅 Tracked creation time for tab ${tabId}`);
        }
    } catch (error) {
        console.error("Error tracking tab creation time:", error);
    }
}

// 🔥 NEW: Get tab creation time (with fallbacks)
async function getTabCreationTime(tabId) {
    try {
        const result = await api.storage.local.get(["tabCreationTimes", "tabAccessTimes"]);
        const creationTimes = result.tabCreationTimes || {};
        const accessTimes = result.tabAccessTimes || {};

        // Priority 1: Actual creation time (if we tracked it)
        if (creationTimes[tabId]) {
            return creationTimes[tabId];
        }

        // Priority 2: First access time (fallback)
        if (accessTimes[tabId]) {
            return accessTimes[tabId];
        }

        // Priority 3: Estimate based on tab ID (Chrome assigns sequential IDs)
        // This is a heuristic - newer tabs have higher IDs
        const currentTime = Date.now();
        const estimatedAge = Math.min(tabId * 1000, 24 * 60 * 60 * 1000); // Max 24 hours
        return currentTime - estimatedAge;

    } catch (error) {
        console.error("Error getting tab creation time:", error);
        return Date.now(); // Fallback to current time
    }
}

// Clean up specific tab access time
async function cleanupTabAccessTime(tabId) {
    try {
        const result = await api.storage.local.get(["tabAccessTimes", "tabCreationTimes"]);
        const accessTimes = result.tabAccessTimes || {};
        const creationTimes = result.tabCreationTimes || {};

        if (accessTimes[tabId]) {
            delete accessTimes[tabId];
        }

        // 🔥 NEW: Also cleanup creation times
        if (creationTimes[tabId]) {
            delete creationTimes[tabId];
        }

        await api.storage.local.set({
            tabAccessTimes: accessTimes,
            tabCreationTimes: creationTimes
        });
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
        } else if (alarm.name === RESOURCE_SCAN_ALARM_NAME) {
            // Real-time resource monitoring scan
            await performResourceScan();
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
        const result = await api.storage.local.get(["tabAccessTimes", "tabCreationTimes"]);
        const accessTimes = result.tabAccessTimes || {};
        const creationTimes = result.tabCreationTimes || {};

        // Get current tab IDs
        const currentTabs = await api.tabs.query({});
        const currentTabIds = new Set(currentTabs.map(tab => tab.id));

        // Remove access times for closed tabs
        const cleanedAccessTimes = {};
        const cleanedCreationTimes = {};

        Object.keys(accessTimes).forEach(tabId => {
            const id = parseInt(tabId);
            if (currentTabIds.has(id)) {
                cleanedAccessTimes[tabId] = accessTimes[tabId];
            }
        });

        // 🔥 NEW: Also clean creation times
        Object.keys(creationTimes).forEach(tabId => {
            const id = parseInt(tabId);
            if (currentTabIds.has(id)) {
                cleanedCreationTimes[tabId] = creationTimes[tabId];
            }
        });

        await api.storage.local.set({
            tabAccessTimes: cleanedAccessTimes,
            tabCreationTimes: cleanedCreationTimes
        });

        const removedAccessCount = Object.keys(accessTimes).length - Object.keys(cleanedAccessTimes).length;
        const removedCreationCount = Object.keys(creationTimes).length - Object.keys(cleanedCreationTimes).length;
        console.log(`Cleaned up ${removedAccessCount} old tab access times and ${removedCreationCount} creation times`);
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
            } else if (message.action === "getResourceData") {
                // Get comprehensive resource data
                const resourceData = await getResourceData();
                sendResponse({
                    success: true,
                    data: resourceData
                });
            } else if (message.action === "getTabResourceData") {
                // Get resource data for specific tab
                const tabResourceData = await getTabResourceData(message.tabId);
                sendResponse({
                    success: true,
                    data: tabResourceData
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

// ================================
// 🔥 ADVANCED RESOURCE MONITORING SYSTEM
// Cross-browser resource tracking with Chrome precision & Firefox intelligence
// ================================

/**
 * Initialize resource monitoring system
 */
async function initializeResourceMonitoring() {
    try {
        console.log("🔄 Initializing resource monitoring system...");

        // Check if resource monitoring is enabled in settings
        const settingsData = await api.storage.sync.get(["settings"]);
        const settings = settingsData.settings || DEFAULT_SETTINGS;

        if (!settings.resourceMonitoring) {
            console.log("📊 Resource monitoring disabled in settings");
            return;
        }

        // Set up resource scanning alarm
        await setupResourceScanAlarm();

        // Perform initial resource scan
        await performResourceScan();

        console.log("✅ Resource monitoring system initialized");
    } catch (error) {
        console.error("❌ Failed to initialize resource monitoring:", error);
    }
}

/**
 * Setup periodic resource scanning alarm
 */
async function setupResourceScanAlarm() {
    try {
        // Clear existing alarm
        await api.alarms.clear(RESOURCE_SCAN_ALARM_NAME);

        // Create new periodic alarm for real-time monitoring
        await api.alarms.create(RESOURCE_SCAN_ALARM_NAME, {
            delayInMinutes: RESOURCE_SCAN_INTERVAL_SECONDS / 60, // Convert seconds to minutes
            periodInMinutes: RESOURCE_SCAN_INTERVAL_SECONDS / 60,
        });

        console.log(`🕒 Resource scan alarm set for every ${RESOURCE_SCAN_INTERVAL_SECONDS} seconds`);
    } catch (error) {
        console.error("Failed to setup resource scan alarm:", error);
    }
}

// 🚀 PERFORMANCE OPTIMIZATION: Rate limiting and scan control
let lastScanTime = 0;
let scanInProgress = false;
let scanCount = 0;
const SCAN_COOLDOWN_MS = 2000; // Minimum 2 seconds between scans
const MAX_TABS_PER_SCAN = 50; // Limit tabs processed per scan to prevent performance issues

/**
 * Perform comprehensive resource scan with performance optimizations
 */
async function performResourceScan() {
    // 🛡️ PERFORMANCE GUARD: Prevent resource monitoring from being a resource killer
    const now = Date.now();

    if (scanInProgress) {
        console.log("⏸️ Resource scan already in progress - skipping");
        return;
    }

    if (now - lastScanTime < SCAN_COOLDOWN_MS) {
        console.log(`⏸️ Resource scan cooldown active - ${SCAN_COOLDOWN_MS - (now - lastScanTime)}ms remaining`);
        return;
    }

    scanInProgress = true;
    lastScanTime = now;
    scanCount++;

    const scanStartTime = Date.now();

    try {
        console.log(`🔍 Starting resource scan #${scanCount}`);

        // Get all tabs
        const tabs = await api.tabs.query({});

        // 🚀 OPTIMIZATION: Only scan loaded tabs (not just tab headers)
        const loadedTabs = tabs.filter(tab => {
            // Basic requirements
            if (!tab.url || tab.discarded) return false;

            // Skip internal browser pages but allow some useful ones
            if (tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome://extensions')) return false;
            if (tab.url.startsWith('chrome-extension://') && !tab.url.includes('popup.html')) return false;
            if (tab.url.startsWith('moz-extension://')) return false;
            if (tab.url.startsWith('about:') && tab.url !== 'about:blank') return false;
            if (tab.url.startsWith('edge://')) return false;
            if (tab.url.startsWith('brave://')) return false;

            // Include tabs that are either complete or loading (to catch active usage)
            return tab.status === "complete" || tab.status === "loading";
        });

        // 🚀 OPTIMIZATION: Limit tabs per scan to prevent performance issues
        const tabsToScan = loadedTabs.slice(0, MAX_TABS_PER_SCAN);

        if (loadedTabs.length > MAX_TABS_PER_SCAN) {
            console.log(`⚡ Performance optimization: Scanning ${MAX_TABS_PER_SCAN}/${loadedTabs.length} loaded tabs`);
        } else {
            console.log(`🔍 Scanning resources for ${tabsToScan.length}/${tabs.length} loaded tabs`);
        }

        let resourceData = {};
        let systemData = {};

        if (isChrome) {
            // Chrome: Enhanced resource monitoring with fallbacks
            resourceData = await getChromeResourceData(tabsToScan);
            systemData = await getChromeSystemData();
        } else if (isFirefox) {
            // Firefox: Intelligent heuristic monitoring
            resourceData = await getFirefoxResourceData(tabsToScan);
            systemData = await getFirefoxSystemData();
        }

        // 🚀 OPTIMIZATION: Only store if we have meaningful data
        if (Object.keys(resourceData).length > 0) {
            await api.storage.local.set({
                'SHEPERD_TAB_RESOURCE_DATA': resourceData,
                'SHEPERD_SYSTEM_RESOURCE_DATA': systemData,
                'SHEPERD_RESOURCE_LAST_UPDATE': Date.now(),
                'SHEPERD_RESOURCE_SCAN_COUNT': scanCount
            });

            // Notify popup about resource updates (async, non-blocking)
            notifyPopupOfResourceUpdate(resourceData, systemData);
        }

        const scanDuration = Date.now() - scanStartTime;
        console.log(`📊 Resource scan #${scanCount} completed: ${Object.keys(resourceData).length} tabs monitored in ${scanDuration}ms`);

        // 🚀 PERFORMANCE WARNING: If scan takes too long, increase cooldown
        if (scanDuration > 1000) {
            console.warn(`⚠️ Resource scan took ${scanDuration}ms - consider reducing scan frequency`);
        }

    } catch (error) {
        console.error("❌ Resource scan failed:", error.message);
    } finally {
        scanInProgress = false;
    }
}

/**
 * Chrome: Get resource data with intelligent fallbacks for stable channel
 */
async function getChromeResourceData(tabs) {
    try {
        const resourceData = {};
        let useProcessesAPI = false;
        let processes = null;

        // 🔍 STEP 1: Check if processes API is available (Dev/Canary only)
        try {
            if (api.processes && typeof api.processes.getProcessInfo === 'function') {
                console.log("🔍 Chrome processes API detected - attempting precise monitoring");
                processes = await api.processes.getProcessInfo();
                useProcessesAPI = true;
                console.log(`✅ Chrome processes API working - monitoring ${Object.keys(processes).length} processes`);
            } else {
                console.log("⚠️ Chrome processes API not available (stable channel) - using intelligent fallbacks");
            }
        } catch (processError) {
            console.log("⚠️ Chrome processes API failed - falling back to heuristic analysis:", processError.message);
            useProcessesAPI = false;
        }

        // 🚀 STEP 2: Process tabs (optimized for performance)
        const startTime = Date.now();

        for (const tab of tabs) {
            try {
                if (useProcessesAPI && processes) {
                    // Chrome Dev/Canary: Use precise API data
                    const process = Object.values(processes).find(proc =>
                        proc.tabs && proc.tabs.includes(tab.id)
                    );

                    if (process) {
                        resourceData[tab.id] = await createChromeResourceData(tab, process, 'precise');
                    } else {
                        resourceData[tab.id] = await createChromeHeuristicData(tab);
                    }
                } else {
                    // Chrome Stable: Use enhanced heuristics (better than basic fallback)
                    resourceData[tab.id] = await createChromeHeuristicData(tab);
                }
            } catch (tabError) {
                console.warn(`⚠️ Failed to process tab ${tab.id}: ${tabError.message}`);
                resourceData[tab.id] = await createFallbackResourceData(tab, 'chrome');
            }
        }

        const processingTime = Date.now() - startTime;
        console.log(`📊 Chrome resource scan: ${tabs.length} tabs in ${processingTime}ms (${useProcessesAPI ? 'precise' : 'heuristic'} mode)`);

        return resourceData;
    } catch (error) {
        console.error("❌ Chrome resource monitoring failed:", error.message);
        return {};
    }
}

/**
 * Firefox: Get intelligent resource estimates using heuristics
 */
async function getFirefoxResourceData(tabs) {
    try {
        const resourceData = {};

        for (const tab of tabs) {
            try {
                const estimates = calculateFirefoxResourceEstimates(tab);

                // 🔥 NEW: Get actual tab creation time for accurate age
                const creationTime = await getTabCreationTime(tab.id);

                resourceData[tab.id] = {
                    tabId: tab.id,
                    url: tab.url,
                    title: tab.title,
                    timestamp: creationTime, // 🔥 FIXED: Use actual creation time, not scan time
                    scanTime: Date.now(), // When we scanned this data
                    browser: 'firefox',
                    resources: {
                        memoryEstimateMB: estimates.memory,
                        cpuEstimatePercent: estimates.cpu,
                        networkEstimate: estimates.network,
                        resourceScore: estimates.score
                    },
                    heuristics: {
                        domainType: estimates.domainType,
                        isHeavyDomain: estimates.isHeavy,
                        complexityScore: estimates.complexity,
                        activityLevel: estimates.activity
                    },
                    performance: {
                        loadState: tab.status,
                        isActive: tab.active,
                        isAudible: tab.audible || false,
                        windowId: tab.windowId
                    },
                    scoring: calculateFirefoxResourceScore(estimates, tab)
                };
            } catch (error) {
                console.warn(`Failed to estimate resources for tab ${tab.id}:`, error);
                resourceData[tab.id] = await createFallbackResourceData(tab, 'firefox');
            }
        }

        return resourceData;
    } catch (error) {
        console.error("Firefox resource estimation failed:", error);
        return {};
    }
}

/**
 * Create Chrome resource data from processes API (Dev/Canary only)
 */
async function createChromeResourceData(tab, process, mode) {
    const memoryMB = Math.round((process.privateMemory || 0) / (1024 * 1024));
    const cpuPercent = process.cpu || 0;

    // 🔥 NEW: Get actual tab creation time for accurate age
    const creationTime = await getTabCreationTime(tab.id);

    return {
        tabId: tab.id,
        url: tab.url,
        title: tab.title,
        timestamp: creationTime, // 🔥 FIXED: Use actual creation time, not scan time
        scanTime: Date.now(), // When we scanned this data
        browser: 'chrome',
        mode: mode, // 'precise' or 'heuristic'
        resources: {
            memoryBytes: process.privateMemory || 0,
            memoryMB: memoryMB,
            cpuPercent: cpuPercent,
            networkBytes: 0, // Future enhancement
        },
        performance: {
            loadState: tab.status,
            isActive: tab.active,
            isAudible: tab.audible || false,
            windowId: tab.windowId
        },
        scoring: calculateResourceScore(memoryMB, cpuPercent, tab, mode)
    };
}

/**
 * Create Chrome heuristic data (Stable channel fallback)
 */
async function createChromeHeuristicData(tab) {
    // Enhanced Chrome heuristics (better than Firefox since we know it's Chrome)
    const estimates = calculateChromeHeuristicEstimates(tab);

    // 🔥 NEW: Get actual tab creation time for accurate age
    const creationTime = await getTabCreationTime(tab.id);

    return {
        tabId: tab.id,
        url: tab.url,
        title: tab.title,
        timestamp: creationTime, // 🔥 FIXED: Use actual creation time, not scan time
        scanTime: Date.now(), // When we scanned this data
        browser: 'chrome',
        mode: 'heuristic',
        resources: {
            memoryEstimateMB: estimates.memory,
            cpuEstimatePercent: estimates.cpu,
            networkEstimate: estimates.network,
            resourceScore: estimates.score
        },
        heuristics: {
            domainType: estimates.domainType,
            isHeavyDomain: estimates.isHeavy,
            complexityScore: estimates.complexity,
            chromeOptimized: true // Chrome-specific optimizations
        },
        performance: {
            loadState: tab.status,
            isActive: tab.active,
            isAudible: tab.audible || false,
            windowId: tab.windowId
        },
        scoring: calculateResourceScore(estimates.memory, estimates.cpu, tab, 'heuristic')
    };
}

/**
 * Calculate Chrome-specific heuristic estimates (optimized for Chrome behavior)
 */
function calculateChromeHeuristicEstimates(tab) {
    const url = new URL(tab.url);
    const domain = url.hostname.toLowerCase();

    // Chrome-specific base estimates (higher than Firefox due to Chrome's architecture)
    let memoryEstimate = 60; // Chrome uses more memory
    let cpuEstimate = 0.8;
    let complexity = 1;

    // Chrome heavy domain detection
    const isHeavyDomain = RESOURCE_CONFIG.HEAVY_DOMAINS.has(domain);
    if (isHeavyDomain) {
        memoryEstimate += 100; // Chrome heavy sites use more memory
        cpuEstimate += 4;
        complexity += 2;
    }

    // Chrome-specific optimizations
    if (domain.includes('google.com')) {
        memoryEstimate += 40; // Google sites are optimized for Chrome
        cpuEstimate += 1;
    }

    // Video sites in Chrome
    const videoSites = ['youtube.com', 'netflix.com', 'twitch.tv'];
    if (videoSites.some(site => domain.includes(site))) {
        memoryEstimate += 120; // Chrome video uses more memory
        cpuEstimate += 3;
    }

    // Chrome tab state optimizations
    if (tab.active) {
        cpuEstimate += 1; // Active tab in Chrome
    }

    if (tab.audible) {
        memoryEstimate += 50; // Audio in Chrome
        cpuEstimate += 2.5;
    }

    // Chrome discarded tabs optimization
    if (tab.discarded) {
        memoryEstimate = 10; // Chrome discarded tabs use minimal memory
        cpuEstimate = 0.1;
    }

    // Calculate score
    const overallScore = (memoryEstimate / 80) + (cpuEstimate * 1.5);
    let resourceScore = "light";
    if (overallScore >= 8) resourceScore = "heavy";
    else if (overallScore >= 4) resourceScore = "medium";

    return {
        memory: Math.round(memoryEstimate),
        cpu: Math.round(cpuEstimate * 10) / 10,
        network: Math.round(memoryEstimate * 0.12),
        score: resourceScore,
        domainType: isHeavyDomain ? 'heavy' : 'light',
        isHeavy: isHeavyDomain,
        complexity: Math.round(complexity * 10) / 10
    };
}

/**
 * Universal resource scoring function (works for both precise and heuristic data)
 */
function calculateResourceScore(memoryMB, cpuPercent, tab, mode) {
    let impact = "light";
    let score = 0;

    // Memory scoring (adjusted for mode)
    const memoryThresholds = mode === 'precise' ? [300, 150, 75] : [200, 100, 50];
    if (memoryMB > memoryThresholds[0]) score += 3;
    else if (memoryMB > memoryThresholds[1]) score += 2;
    else if (memoryMB > memoryThresholds[2]) score += 1;

    // CPU scoring
    if (cpuPercent > 10) score += 3;
    else if (cpuPercent > 5) score += 2;
    else if (cpuPercent > 1) score += 1;

    // Tab state scoring
    if (tab.audible) score += 1;
    if (tab.active) score += 0.5;

    // Determine impact level
    if (score >= 5) impact = "heavy";
    else if (score >= 3) impact = "medium";
    else impact = "light";

    const modeLabel = mode === 'precise' ? '' : '~';

    return {
        impact,
        score: Math.round(score * 10) / 10,
        details: `${modeLabel}${memoryMB}MB RAM, ${modeLabel}${cpuPercent.toFixed(1)}% CPU`,
        mode
    };
}

/**
 * Calculate Firefox resource estimates using intelligent heuristics
 */
function calculateFirefoxResourceEstimates(tab) {
    const url = new URL(tab.url);
    const domain = url.hostname.toLowerCase();

    // Base estimates
    let memoryEstimate = RESOURCE_CONFIG.MEMORY_ESTIMATES.base;
    let cpuEstimate = RESOURCE_CONFIG.CPU_ESTIMATES.base;
    let complexity = 1;
    let activity = 1;

    // Domain-based estimates
    const isHeavyDomain = RESOURCE_CONFIG.HEAVY_DOMAINS.has(domain);
    if (isHeavyDomain) {
        memoryEstimate += RESOURCE_CONFIG.MEMORY_ESTIMATES.heavyDomain;
        cpuEstimate += RESOURCE_CONFIG.CPU_ESTIMATES.heavy;
        complexity += 2;
    }

    // Video/media sites (higher resource usage)
    const videoSites = ['youtube.com', 'netflix.com', 'twitch.tv', 'vimeo.com'];
    if (videoSites.some(site => domain.includes(site))) {
        memoryEstimate += RESOURCE_CONFIG.MEMORY_ESTIMATES.video;
        cpuEstimate += 2;
        activity += 2;
    }

    // Complex web apps
    const complexSites = ['figma.com', 'canva.com', 'docs.google.com', 'sheets.google.com'];
    if (complexSites.some(site => domain.includes(site))) {
        memoryEstimate += RESOURCE_CONFIG.MEMORY_ESTIMATES.complex;
        cpuEstimate += 1.5;
        complexity += 1.5;
    }

    // Tab state adjustments
    if (tab.status === 'loading') {
        cpuEstimate += RESOURCE_CONFIG.CPU_ESTIMATES.loading;
        activity += 1;
    }

    if (tab.active) {
        cpuEstimate += RESOURCE_CONFIG.CPU_ESTIMATES.active;
        activity += 0.5;
    }

    if (tab.audible) {
        memoryEstimate += 30; // Audio/video content
        cpuEstimate += 2;
        activity += 1.5;
    }

    // Calculate overall resource score
    const memoryScore = memoryEstimate / 100; // Normalize
    const cpuScore = cpuEstimate * 2; // Weight CPU higher
    const overallScore = Math.min(10, memoryScore + cpuScore);

    let resourceScore = "light";
    if (overallScore >= 7) resourceScore = "heavy";
    else if (overallScore >= 4) resourceScore = "medium";

    return {
        memory: Math.round(memoryEstimate),
        cpu: Math.round(cpuEstimate * 10) / 10,
        network: Math.round(memoryEstimate * 0.1), // Estimate network based on memory
        score: resourceScore,
        domainType: isHeavyDomain ? 'heavy' : 'light',
        isHeavy: isHeavyDomain,
        complexity: Math.round(complexity * 10) / 10,
        activity: Math.round(activity * 10) / 10
    };
}

/**
 * Calculate Firefox resource scoring
 */
function calculateFirefoxResourceScore(estimates, tab) {
    return {
        impact: estimates.score,
        score: estimates.complexity + estimates.activity,
        details: `~${estimates.memory}MB RAM, ~${estimates.cpu}% CPU (estimated)`
    };
}

/**
 * Create fallback resource data when monitoring fails
 */
async function createFallbackResourceData(tab, browser) {
    // 🔥 NEW: Get actual tab creation time for accurate age
    const creationTime = await getTabCreationTime(tab.id);

    return {
        tabId: tab.id,
        url: tab.url,
        title: tab.title,
        timestamp: creationTime, // 🔥 FIXED: Use actual creation time, not scan time
        scanTime: Date.now(), // When we scanned this data
        browser,
        resources: browser === 'chrome' ? {
            memoryBytes: 0,
            memoryMB: 0,
            cpuPercent: 0
        } : {
            memoryEstimateMB: 50,
            cpuEstimatePercent: 1,
            resourceScore: "light"
        },
        performance: {
            loadState: tab.status,
            isActive: tab.active,
            isAudible: tab.audible || false,
            windowId: tab.windowId
        },
        scoring: {
            impact: "light",
            score: 0,
            details: "Resource monitoring unavailable"
        },
        error: "Monitoring failed"
    };
}

/**
 * Get Chrome system resource data with intelligent fallbacks
 */
async function getChromeSystemData() {
    try {
        const systemData = {
            browser: 'chrome',
            timestamp: Date.now(),
            memory: {},
            processes: {}
        };

        // 🔍 Try system.memory API (might not be available on all Chrome versions)
        try {
            if (api.system && api.system.memory && typeof api.system.memory.getInfo === 'function') {
                console.log("🔍 Chrome system.memory API detected");
                const memoryInfo = await api.system.memory.getInfo();

                systemData.memory = {
                    totalBytes: memoryInfo.capacity,
                    totalMB: Math.round(memoryInfo.capacity / (1024 * 1024)),
                    availableBytes: memoryInfo.availableCapacity,
                    availableMB: Math.round(memoryInfo.availableCapacity / (1024 * 1024)),
                    usedPercent: Math.round(((memoryInfo.capacity - memoryInfo.availableCapacity) / memoryInfo.capacity) * 100),
                    source: 'system_api'
                };
                console.log(`✅ System memory: ${systemData.memory.totalMB}MB total, ${systemData.memory.usedPercent}% used`);
            } else {
                throw new Error("system.memory API not available");
            }
        } catch (memoryError) {
            console.log("⚠️ Chrome system.memory API not available - using estimates");
            systemData.memory = {
                estimated: true,
                source: 'estimated',
                note: 'System memory API not available in stable Chrome'
            };
        }

        // 🔍 Try processes API for process counting
        try {
            if (api.processes && typeof api.processes.getProcessInfo === 'function') {
                const totalProcesses = await api.processes.getProcessInfo();
                systemData.processes = {
                    total: Object.keys(totalProcesses).length,
                    browserProcesses: Object.values(totalProcesses).filter(p => p.type === 'browser').length,
                    tabProcesses: Object.values(totalProcesses).filter(p => p.type === 'tab').length,
                    source: 'processes_api'
                };
            } else {
                throw new Error("processes API not available");
            }
        } catch (processError) {
            console.log("⚠️ Chrome processes API not available - using tab counting");
            const tabs = await api.tabs.query({});
            systemData.processes = {
                estimated: true,
                tabCount: tabs.length,
                source: 'tab_count',
                note: 'Processes API not available in stable Chrome'
            };
        }

        return systemData;
    } catch (error) {
        console.error("❌ Failed to get Chrome system data:", error.message);
        return {
            browser: 'chrome',
            error: error.message,
            fallback: true
        };
    }
}

/**
 * Get Firefox system estimates
 */
async function getFirefoxSystemData() {
    try {
        // Firefox doesn't have system API, so we estimate
        const tabs = await api.tabs.query({});
        const totalTabs = tabs.length;

        return {
            browser: 'firefox',
            timestamp: Date.now(),
            memory: {
                estimatedBrowserUsageMB: Math.round(totalTabs * 60), // Rough estimate
                tabCount: totalTabs,
                estimatedTotalMB: Math.round(totalTabs * 60 + 200) // Browser + tabs
            },
            processes: {
                estimated: true,
                tabCount: totalTabs
            }
        };
    } catch (error) {
        console.error("Failed to get Firefox system data:", error);
        return { browser: 'firefox', error: error.message };
    }
}

/**
 * Get comprehensive resource data for popup
 */
async function getResourceData() {
    try {
        const result = await api.storage.local.get([
            'SHEPERD_TAB_RESOURCE_DATA',
            'SHEPERD_SYSTEM_RESOURCE_DATA',
            'SHEPERD_RESOURCE_LAST_UPDATE'
        ]);

        return {
            tabResources: result.SHEPERD_TAB_RESOURCE_DATA || {},
            systemResources: result.SHEPERD_SYSTEM_RESOURCE_DATA || {},
            lastUpdate: result.SHEPERD_RESOURCE_LAST_UPDATE || 0,
            browser: isChrome ? 'chrome' : 'firefox'
        };
    } catch (error) {
        console.error("Failed to get resource data:", error);
        return { error: error.message };
    }
}

/**
 * Get resource data for specific tab
 */
async function getTabResourceData(tabId) {
    try {
        const result = await api.storage.local.get(['SHEPERD_TAB_RESOURCE_DATA']);
        const tabResources = result.SHEPERD_TAB_RESOURCE_DATA || {};

        return tabResources[tabId] || null;
    } catch (error) {
        console.error("Failed to get tab resource data:", error);
        return null;
    }
}

/**
 * Notify popup about resource updates
 */
async function notifyPopupOfResourceUpdate(tabResources, systemResources) {
    try {
        api.runtime.sendMessage({
            type: 'RESOURCE_UPDATE',
            data: {
                tabResources,
                systemResources,
                timestamp: Date.now(),
                browser: isChrome ? 'chrome' : 'firefox'
            }
        }).catch(() => {
            // Popup might not be open, ignore the error
        });
    } catch (error) {
        // Ignore messaging errors when popup is closed
    }
}