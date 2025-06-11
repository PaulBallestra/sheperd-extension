// src/utils/categorizer.js
// Modern ES6 Tab Categorization Engine

import {
    TAB_CATEGORIES,
    SHEPERD_METER_LEVELS,
    SHEPERD_CONFIG,
} from "./constants.js";

/**
 * Advanced Tab Categorization Engine
 * Intelligently categorizes browser tabs based on URL and title analysis
 */
export class TabCategorizer {
    constructor() {
        this.categories = TAB_CATEGORIES;
        this.meterLevels = SHEPERD_METER_LEVELS;
    }

    /**
     * Categorize a single tab based on URL and title analysis
     * @param {Object} tab - Chrome tab object
     * @returns {string} - Category name
     */
    categorizeTab(tab) {
        if (!tab.url || !tab.title) {
            return "Uncategorized";
        }

        const url = tab.url.toLowerCase();
        const title = tab.title.toLowerCase();

        // Check each category for matches
        for (const [categoryName, config] of Object.entries(this.categories)) {
            if (this._matchesCategory(url, title, config)) {
                return categoryName;
            }
        }

        return "Uncategorized";
    }

    /**
     * Categorize multiple tabs and detect duplicates
     * @param {Array} tabs - Array of Chrome tab objects
     * @returns {Object} - Categorized tabs with duplicate detection
     */
    categorizeTabs(tabs) {
        if (!Array.isArray(tabs)) {
            return {};
        }

        const categorized = {};
        const duplicates = this.findDuplicates(tabs);

        // Initialize categories
        Object.keys(this.categories).forEach((category) => {
            categorized[category] = [];
        });
        categorized["Uncategorized"] = [];

        // Categorize each tab
        tabs.forEach((tab) => {
            const category = this.categorizeTab(tab);
            const isDuplicate = duplicates.includes(tab.id);

            categorized[category].push({
                ...tab,
                isDuplicate,
                category,
                lastAccessed: Date.now(), // For future "old tabs" detection
            });
        });

        // Remove empty categories for cleaner UI
        Object.keys(categorized).forEach((category) => {
            if (categorized[category].length === 0) {
                delete categorized[category];
            }
        });

        return categorized;
    }

    /**
     * Find duplicate tabs based on normalized URLs
     * @param {Array} tabs - Array of Chrome tab objects
     * @returns {Array} - Array of duplicate tab IDs
     */
    findDuplicates(tabs) {
        const urlMap = new Map();
        const duplicatesToRemove = [];

        tabs.forEach((tab) => {
            // Skip tabs with invalid or special URLs
            if (!this.isValidUrlForDuplicateCheck(tab.url)) {
                return; // Skip this tab - can't normalize invalid URLs
            }

            const normalizedUrl = this.normalizeUrl(tab.url);

            if (urlMap.has(normalizedUrl)) {
                // This is a duplicate - mark for removal (keep the original)
                duplicatesToRemove.push(tab.id);
            } else {
                // This is the first occurrence - keep it as the original
                urlMap.set(normalizedUrl, tab.id);
            }
        });

        return duplicatesToRemove;
    }

    /**
     * Check if URL is valid for duplicate detection
     * @param {string} url - URL to check
     * @returns {boolean} - True if URL is valid for duplicate checking
     */
    isValidUrlForDuplicateCheck(url) {
        if (!url || typeof url !== 'string') {
            return false;
        }

        // Skip Chrome internal URLs and special schemes
        const invalidPrefixes = [
            'chrome://',
            'chrome-extension://',
            'chrome-search://',
            'chrome-devtools://',
            'about:',
            'moz-extension://',
            'safari-extension://',
            'data:',
            'blob:',
            'javascript:',
            'file://'
        ];

        return !invalidPrefixes.some(prefix => url.toLowerCase().startsWith(prefix.toLowerCase()));
    }

    /**
     * Normalize URL for duplicate detection
     * @param {string} url - Raw URL
     * @returns {string} - Normalized URL
     */
    normalizeUrl(url) {
        try {
            const urlObj = new URL(url);
            const cleanPath = urlObj.pathname.replace(/\/$/, ""); // Remove trailing slash

            // For search engines and other sites where query params matter for content,
            // preserve important query parameters
            const preservedParams = this.getPreservedQueryParams(urlObj);

            let normalizedUrl = `${urlObj.protocol}//${urlObj.hostname}${cleanPath}`;

            if (preservedParams.length > 0) {
                normalizedUrl += `?${preservedParams.join("&")}`;
            }

            return normalizedUrl;
        } catch (error) {
            // Only log warnings for URLs that should be valid (not Chrome internal pages)
            if (this.isValidUrlForDuplicateCheck(url)) {
                console.warn("Failed to normalize URL:", url);
            }
            return url;
        }
    }

    /**
     * Get query parameters that should be preserved for duplicate detection
     * @param {URL} urlObj - URL object
     * @returns {Array} - Array of preserved query parameter strings
     */
    getPreservedQueryParams(urlObj) {
        const hostname = urlObj.hostname.toLowerCase();
        const searchParams = urlObj.searchParams;
        const preservedParams = [];

        // Define which query parameters are content-defining for different sites
        const contentParams = {
            // Google Search
            "google.com": ["q"],
            "google.co.uk": ["q"],
            "google.ca": ["q"],
            "google.fr": ["q"],
            "google.de": ["q"],

            // Other search engines
            "bing.com": ["q"],
            "duckduckgo.com": ["q"],
            "yahoo.com": ["p"],
            "yandex.com": ["text"],
            "baidu.com": ["wd"],

            // YouTube
            "youtube.com": ["v", "list"],
            "youtu.be": ["v"],

            // Social media
            "twitter.com": ["q"],
            "x.com": ["q"],
            "reddit.com": ["q"],

            // Shopping
            "amazon.com": ["k", "s"],
            "ebay.com": ["_nkw"],
            "etsy.com": ["search_query"],

            // Documentation/Stack Overflow
            "stackoverflow.com": ["q"],
            "github.com": ["q"],

            // News sites
            "news.google.com": ["q"],
            "bbc.com": ["q"],
            "cnn.com": ["q"],
        };

        // Find matching content parameters for this hostname
        let relevantParams = [];
        for (const [domain, params] of Object.entries(contentParams)) {
            if (hostname.includes(domain)) {
                relevantParams = params;
                break;
            }
        }

        // If no specific rules found, preserve common search parameters
        if (relevantParams.length === 0) {
            relevantParams = ["q", "query", "search", "term", "keyword"];
        }

        // Extract and preserve relevant parameters
        relevantParams.forEach((param) => {
            const value = searchParams.get(param);
            if (value) {
                preservedParams.push(`${param}=${encodeURIComponent(value)}`);
            }
        });

        return preservedParams;
    }

    /**
     * Get category icon
     * @param {string} categoryName - Category name
     * @returns {string} - Unicode emoji icon
     */
    getCategoryIcon(categoryName) {
        return this.categories[categoryName] ?
            this.categories[categoryName].icon || "📋" :
            "📋";
    }

    /**
     * Get category color
     * @param {string} categoryName - Category name
     * @returns {string} - Hex color code
     */
    getCategoryColor(categoryName) {
        return this.categories[categoryName] ?
            this.categories[categoryName].color || "#6B7280" :
            "#6B7280";
    }

    /**
     * Calculate Sheperd Meter level based on tab count
     * @param {number} tabCount - Number of open tabs
     * @returns {Object} - Sheperd meter data
     */
    getSheperdLevel(tabCount) {
        for (const [levelName, levelData] of Object.entries(this.meterLevels)) {
            const [min, max] = levelData.range;
            if (tabCount >= min && tabCount <= max) {
                return {
                    ...levelData,
                    levelName,
                    tabCount,
                };
            }
        }

        // Fallback to apocalyptic if somehow nothing matches
        return {
            ...this.meterLevels.APOCALYPTIC,
            levelName: "APOCALYPTIC",
            tabCount,
        };
    }

    /**
     * Get detailed tab statistics
     * @param {Array} tabs - Array of Chrome tab objects
     * @returns {Object} - Comprehensive tab statistics
     */
    getTabStatistics(tabs) {
        const categorized = this.categorizeTabs(tabs);
        const duplicates = this.findDuplicates(tabs);
        const SheperdLevel = this.getSheperdLevel(tabs.length);

        const stats = {
            total: tabs.length,
            duplicates: duplicates.length,
            categories: Object.keys(categorized).length,
            SheperdLevel,
            categoryBreakdown: {},
        };

        // Category breakdown
        Object.entries(categorized).forEach(([category, categoryTabs]) => {
            stats.categoryBreakdown[category] = {
                count: categoryTabs.length,
                percentage: Math.round((categoryTabs.length / tabs.length) * 100),
                duplicates: categoryTabs.filter((tab) => tab.isDuplicate).length,
            };
        });

        return stats;
    }

    /**
     * Find old tabs based on access time
     * @param {Array} tabs - Array of Chrome tab objects
     * @param {number} daysThreshold - Days to consider a tab old
     * @returns {Array} - Array of old tab IDs
     */
    findOldTabs(tabs, daysThreshold = SHEPERD_CONFIG.OLD_TAB_THRESHOLD_DAYS) {
        const cutoffTime = Date.now() - daysThreshold * 24 * 60 * 60 * 1000;

        return tabs
            .filter((tab) => {
                // For now, consider tabs old if they haven't been accessed recently
                // In the future, this could use stored access times from background script
                return tab.lastAccessed && tab.lastAccessed < cutoffTime;
            })
            .map((tab) => tab.id);
    }

    /**
     * Private method to check if a tab matches a category
     * @param {string} url - Normalized URL
     * @param {string} title - Normalized title
     * @param {Object} config - Category configuration
     * @returns {boolean} - True if matches
     */
    _matchesCategory(url, title, config) {
        // Check keywords
        const hasKeyword = config.keywords.some(
            (keyword) =>
            url.includes(keyword.toLowerCase()) ||
            title.includes(keyword.toLowerCase())
        );

        if (hasKeyword) {
            return true;
        }

        // Check regex patterns if they exist
        if (config.patterns) {
            const hasPattern = config.patterns.some(
                (pattern) => pattern.test(url) || pattern.test(title)
            );

            if (hasPattern) {
                return true;
            }
        }

        return false;
    }
}

// Create and export singleton instance for convenience
export const tabCategorizer = new TabCategorizer();

// Legacy support for global usage (backward compatibility)
if (typeof window !== "undefined") {
    window.TabCategorizer = TabCategorizer;
    window.tabCategorizer = tabCategorizer;
}