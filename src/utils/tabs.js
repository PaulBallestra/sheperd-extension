// src/utils/tabs.js
// Cross-Browser Tabs API Utilities with modern async/await patterns

import { SHEPERD_CONFIG, SHEPERD_STORAGE_KEYS } from "./constants.js";
import { unifiedAPI, BROWSER_INFO, browserUtils } from "./browser-compatibility.js";

/**
 * Modern Cross-Browser Tabs API wrapper with error handling
 * Works with both Chrome and Firefox WebExtensions
 */
export class TabsManager {
    constructor() {
        this.browserInfo = BROWSER_INFO;
        this.api = unifiedAPI;

        // Log browser environment for debugging
        browserUtils.logBrowserInfo();
    }

    /**
     * Get all tabs across all windows
     * @returns {Promise<Array>} - Array of tab objects
     */
    async getAllTabs() {
        try {
            return await this.api.tabs.query({});
        } catch (error) {
            console.error("Failed to get all tabs:", error);
            throw new Error(`Failed to retrieve tabs: ${error.message}`);
        }
    }

    /**
     * Get tabs from current window only
     * @returns {Promise<Array>} - Array of tab objects
     */
    async getCurrentWindowTabs() {
        try {
            return await this.api.tabs.query({ currentWindow: true });
        } catch (error) {
            console.error("Failed to get current window tabs:", error);
            throw new Error(
                `Failed to retrieve current window tabs: ${error.message}`
            );
        }
    }

    /**
     * Switch to a specific tab
     * @param {number} tabId - Tab ID
     * @returns {Promise<boolean>} - Success status
     */
    async switchToTab(tabId) {
        try {
            // Update the tab to make it active
            await this.api.tabs.update(tabId, { active: true });

            // Focus the window containing this tab
            const tab = await this.api.tabs.get(tabId);
            await this.api.windows.update(tab.windowId, { focused: true });

            return true;
        } catch (error) {
            console.error("Failed to switch to tab:", tabId, error);
            throw new Error(`Failed to switch to tab: ${error.message}`);
        }
    }

    /**
     * Close multiple tabs by IDs
     * @param {Array<number>} tabIds - Array of tab IDs
     * @returns {Promise<boolean>} - Success status
     */
    async closeTabs(tabIds) {
        if (!Array.isArray(tabIds) || tabIds.length === 0) {
            return false;
        }

        try {
            await this.api.tabs.remove(tabIds);
            return true;
        } catch (error) {
            console.error("Failed to close tabs:", tabIds, error);
            throw new Error(`Failed to close tabs: ${error.message}`);
        }
    }

    /**
     * Close a single tab
     * @param {number} tabId - Tab ID
     * @returns {Promise<boolean>} - Success status
     */
    async closeTab(tabId) {
        return this.closeTabs([tabId]);
    }

    /**
     * Bookmark multiple tabs to a folder
     * @param {Array} tabs - Array of tab objects
     * @param {string} folderName - Bookmark folder name
     * @returns {Promise<Object>} - Bookmark folder object
     */
    async bookmarkTabs(tabs, folderName) {
        if (!Array.isArray(tabs) || tabs.length === 0) {
            throw new Error("No tabs provided for bookmarking");
        }

        try {
            // Create bookmark folder
            const folder = await this.api.bookmarks.create({
                parentId: "1", // Bookmarks bar
                title: `🐑 ${folderName} - ${new Date().toLocaleDateString()}`,
            });

            // Add each tab as a bookmark
            const bookmarkPromises = tabs.map((tab) =>
                this.api.bookmarks.create({
                    parentId: folder.id,
                    title: tab.title || "Untitled",
                    url: tab.url,
                })
            );

            await Promise.all(bookmarkPromises);

            return {
                folder,
                bookmarksCount: tabs.length,
                success: true,
            };
        } catch (error) {
            console.error("Failed to bookmark tabs:", error);
            throw new Error(`Failed to bookmark tabs: ${error.message}`);
        }
    }

    /**
     * Get tab access times from storage
     * @returns {Promise<Object>} - Tab access times object
     */
    async getTabAccessTimes() {
        try {
            const result = await this.api.storage.local.get([
                SHEPERD_STORAGE_KEYS.TAB_ACCESS_TIMES,
            ]);
            return result[SHEPERD_STORAGE_KEYS.TAB_ACCESS_TIMES] || {};
        } catch (error) {
            console.error("Failed to get tab access times:", error);
            return {};
        }
    }

    /**
     * Update tab access time
     * @param {number} tabId - Tab ID
     * @param {number} timestamp - Access timestamp (defaults to now)
     * @returns {Promise<boolean>} - Success status
     */
    async updateTabAccessTime(tabId, timestamp = Date.now()) {
        try {
            const accessTimes = await this.getTabAccessTimes();
            accessTimes[tabId] = timestamp;

            await this.api.storage.local.set({
                [SHEPERD_STORAGE_KEYS.TAB_ACCESS_TIMES]: accessTimes,
            });

            return true;
        } catch (error) {
            console.error("Failed to update tab access time:", error);
            return false;
        }
    }

    /**
     * Find old tabs based on access time
     * @param {Array} tabs - Array of tab objects
     * @param {number} daysThreshold - Days to consider a tab old
     * @returns {Promise<Array>} - Array of old tabs
     */
    async findOldTabs(
        tabs,
        daysThreshold = SHEPERD_CONFIG.OLD_TAB_THRESHOLD_DAYS
    ) {
        if (!Array.isArray(tabs)) {
            return [];
        }

        try {
            const accessTimes = await this.getTabAccessTimes();
            const cutoffTime = Date.now() - daysThreshold * 24 * 60 * 60 * 1000;

            return tabs.filter((tab) => {
                const lastAccessed = accessTimes[tab.id];
                return lastAccessed && lastAccessed < cutoffTime;
            });
        } catch (error) {
            console.error("Failed to find old tabs:", error);
            return [];
        }
    }

    /**
     * Send message to background script
     * @param {Object} message - Message object
     * @returns {Promise<Object>} - Response from background script
     */
    async sendMessageToBackground(message) {
        try {
            return await this.api.runtime.sendMessage(message);
        } catch (error) {
            console.error("Failed to send message to background:", error);
            throw new Error(
                `Failed to communicate with background script: ${error.message}`
            );
        }
    }

    /**
     * Request badge update from background script
     * @returns {Promise<boolean>} - Success status
     */
    async requestBadgeUpdate() {
        try {
            const response = await this.sendMessageToBackground({
                action: "updateBadge",
            });
            return response && response.success || false;
        } catch (error) {
            console.warn("Failed to request badge update:", error);
            return false;
        }
    }

    /**
     * Get comprehensive tab statistics from background script
     * @returns {Promise<Object>} - Tab statistics
     */
    async getTabStatistics() {
        try {
            const response = await this.sendMessageToBackground({
                action: "getTabStats",
            });
            return response && response.data || { totalTabs: 0, accessTimes: {} };
        } catch (error) {
            console.warn("Failed to get tab statistics:", error);
            return { totalTabs: 0, accessTimes: {} };
        }
    }

    /**
     * Validate that tabs array contains valid tab objects
     * @param {Array} tabs - Array to validate
     * @returns {boolean} - True if valid
     */
    validateTabs(tabs) {
        if (!Array.isArray(tabs)) {
            return false;
        }

        return tabs.every(
            (tab) =>
            tab &&
            typeof tab === "object" &&
            typeof tab.id === "number" &&
            typeof tab.url === "string"
        );
    }

    /**
     * Filter tabs by URL pattern
     * @param {Array} tabs - Array of tab objects
     * @param {RegExp|string} pattern - Pattern to match
     * @returns {Array} - Filtered tabs
     */
    filterTabsByPattern(tabs, pattern) {
        if (!this.validateTabs(tabs)) {
            return [];
        }

        const regex =
            pattern instanceof RegExp ? pattern : new RegExp(pattern, "i");

        return tabs.filter(
            (tab) => regex.test(tab.url) || regex.test(tab.title || "")
        );
    }

    /**
     * Get unique tabs by URL (removes duplicates)
     * @param {Array} tabs - Array of tab objects
     * @returns {Array} - Unique tabs
     */
    getUniqueTabs(tabs) {
        if (!this.validateTabs(tabs)) {
            return [];
        }

        const seen = new Set();
        return tabs.filter((tab) => {
            const normalizedUrl = this._normalizeUrl(tab.url);
            if (seen.has(normalizedUrl)) {
                return false;
            }
            seen.add(normalizedUrl);
            return true;
        });
    }

    /**
     * Private method to normalize URL for comparison
     * @param {string} url - Raw URL
     * @returns {string} - Normalized URL
     */
    _normalizeUrl(url) {
        try {
            const urlObj = new URL(url);
            return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
        } catch (error) {
            return url;
        }
    }
}

// Create and export singleton instance
export const tabsManager = new TabsManager();

// Legacy support for global usage
if (typeof window !== "undefined") {
    window.TabsManager = TabsManager;
    window.tabsManager = tabsManager;
}