// src/utils/browser-compatibility.js
// Browser Compatibility Layer for Chrome & Firefox

/**
 * Browser Detection and API Normalization
 * Provides unified API access for Chrome and Firefox WebExtensions
 */

// Detect browser environment
const isFirefox = typeof browser !== 'undefined' && browser.runtime;
const isChrome = typeof chrome !== 'undefined' && chrome.runtime;

/**
 * Create unified browser API interface
 * Firefox uses 'browser' namespace, Chrome uses 'chrome'
 * Firefox APIs return promises, Chrome uses callbacks (but newer versions support promises)
 */
const browserAPI = (() => {
    if (isFirefox) {
        return browser;
    } else if (isChrome) {
        return chrome;
    } else {
        throw new Error('Unsupported browser environment');
    }
})();

/**
 * Browser-specific action API (chrome.action vs browserAction)
 * Chrome MV3 uses chrome.action, Firefox MV2 uses browserAction
 */
const getActionAPI = () => {
    if (isFirefox) {
        return browserAPI.browserAction;
    } else if (isChrome) {
        // Chrome MV3 uses action, fallback to browserAction for older versions
        return browserAPI.action || browserAPI.browserAction;
    }
    throw new Error('Action API not available');
};

/**
 * Browser Information
 */
export const BROWSER_INFO = {
    isFirefox,
    isChrome,
    name: isFirefox ? 'firefox' : isChrome ? 'chrome' : 'unknown',
    manifestVersion: isFirefox ? 2 : 3,
    supportsServiceWorkers: isChrome && !isFirefox
};

/**
 * Unified Browser API
 * All methods return promises and handle browser differences internally
 */
export const unifiedAPI = {
    // Runtime API
    runtime: {
        onInstalled: browserAPI.runtime.onInstalled,
        onStartup: browserAPI.runtime.onStartup,
        onMessage: browserAPI.runtime.onMessage,
        sendMessage: browserAPI.runtime.sendMessage.bind(browserAPI.runtime),
        lastError: browserAPI.runtime.lastError
    },

    // Tabs API
    tabs: {
        query: browserAPI.tabs.query.bind(browserAPI.tabs),
        get: browserAPI.tabs.get.bind(browserAPI.tabs),
        update: browserAPI.tabs.update.bind(browserAPI.tabs),
        remove: browserAPI.tabs.remove.bind(browserAPI.tabs),
        create: browserAPI.tabs.create.bind(browserAPI.tabs),
        onCreated: browserAPI.tabs.onCreated,
        onRemoved: browserAPI.tabs.onRemoved,
        onUpdated: browserAPI.tabs.onUpdated,
        onMoved: browserAPI.tabs.onMoved,
        onActivated: browserAPI.tabs.onActivated
    },

    // Windows API
    windows: {
        update: browserAPI.windows.update.bind(browserAPI.windows),
        onCreated: browserAPI.windows.onCreated,
        onRemoved: browserAPI.windows.onRemoved
    },

    // Storage API
    storage: {
        local: {
            get: browserAPI.storage.local.get.bind(browserAPI.storage.local),
            set: browserAPI.storage.local.set.bind(browserAPI.storage.local)
        },
        sync: {
            get: browserAPI.storage.sync.get.bind(browserAPI.storage.sync),
            set: browserAPI.storage.sync.set.bind(browserAPI.storage.sync)
        }
    },

    // Bookmarks API
    bookmarks: {
        create: browserAPI.bookmarks.create.bind(browserAPI.bookmarks)
    },

    // Alarms API
    alarms: {
        create: browserAPI.alarms.create.bind(browserAPI.alarms),
        clear: browserAPI.alarms.clear.bind(browserAPI.alarms),
        onAlarm: browserAPI.alarms.onAlarm
    },

    // Action API (unified for badge management)
    action: {
        setBadgeText: (details) => {
            const actionAPI = getActionAPI();
            return actionAPI.setBadgeText(details);
        },
        setBadgeBackgroundColor: (details) => {
            const actionAPI = getActionAPI();
            return actionAPI.setBadgeBackgroundColor(details);
        }
    }
};

/**
 * Promise wrapper for callback-based APIs
 * Firefox already returns promises, Chrome might use callbacks
 */
export const promisify = (fn, context) => {
    return (...args) => {
        return new Promise((resolve, reject) => {
            // If the function already returns a promise (Firefox), use it directly
            const result = fn.apply(context, args);
            if (result && typeof result.then === 'function') {
                result.then(resolve).catch(reject);
            } else {
                // Handle callback-based APIs (older Chrome)
                fn.apply(context, [...args, (result) => {
                    if (browserAPI.runtime.lastError) {
                        reject(new Error(browserAPI.runtime.lastError.message));
                    } else {
                        resolve(result);
                    }
                }]);
            }
        });
    };
};

/**
 * Browser-specific utilities
 */
export const browserUtils = {
    /**
     * Check if current environment supports ES modules
     */
    supportsESModules: () => {
        return isChrome || (isFirefox && BROWSER_INFO.manifestVersion >= 3);
    },

    /**
     * Get appropriate manifest version for current browser
     */
    getManifestVersion: () => {
        return BROWSER_INFO.manifestVersion;
    },

    /**
     * Check if browser supports service workers
     */
    supportsServiceWorkers: () => {
        return BROWSER_INFO.supportsServiceWorkers;
    },

    /**
     * Log browser-specific debug information
     */
    logBrowserInfo: () => {
        console.log('🌐 Browser Environment:', {
            name: BROWSER_INFO.name,
            manifestVersion: BROWSER_INFO.manifestVersion,
            supportsServiceWorkers: BROWSER_INFO.supportsServiceWorkers,
            isFirefox,
            isChrome
        });
    }
};

// Export default unified API
export default unifiedAPI;