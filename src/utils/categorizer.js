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
            // Search engines - brand-based matching will handle international versions
            "google": ["q"],
            "bing": ["q"],
            "duckduckgo": ["q"],
            "yahoo": ["p"],
            "yandex": ["text"],
            "baidu": ["wd"],

            // Video platforms
            "youtube": ["v", "list"],
            "youtu.be": ["v"],

            // Social media
            "twitter": ["q"],
            "x.com": ["q"],
            "reddit": ["q"],

            // Shopping platforms - brand-based matching will handle international versions
            "amazon": ["k", "s"],
            "ebay": ["_nkw"],
            "etsy": ["search_query"],

            // Documentation/Development
            "stackoverflow": ["q"],
            "github": ["q"],

            // News sites
            "bbc": ["q"],
            "cnn": ["q"],
        };

        // Find matching content parameters using intelligent brand matching
        let relevantParams = [];
        for (const [brandOrDomain, params] of Object.entries(contentParams)) {
            // If the key contains a dot, it's a full domain - use exact matching
            if (brandOrDomain.includes('.')) {
                if (hostname.includes(brandOrDomain)) {
                    relevantParams = params;
                    break;
                }
            } else {
                // If the key doesn't contain a dot, it's a brand - use brand matching
                const domainBrand = this.extractBrandFromDomain(hostname);
                if (domainBrand === brandOrDomain.toLowerCase()) {
                    relevantParams = params;
                    console.log(`🌍 International query params match: ${hostname} -> ${brandOrDomain} (params: ${params.join(', ')})`);
                    break;
                }
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
     * Extract the brand name from a domain (removes TLD and country codes)
     * @param {string} domain - Domain to extract brand from (e.g., 'amazon.fr' -> 'amazon')
     * @returns {string} - Brand name
     */
    extractBrandFromDomain(domain) {
        // Remove protocol and www prefix
        let cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/i, '');

        // Split by dots
        const parts = cleanDomain.split('.');

        // If only one part, return it
        if (parts.length === 1) {
            return parts[0].toLowerCase();
        }

        // Common international TLD patterns to ignore
        const ignoredSuffixes = [
            // Generic TLDs
            'com', 'org', 'net', 'edu', 'gov', 'mil', 'int',

            // Country code TLDs  
            'co.uk', 'co.jp', 'co.kr', 'co.za', 'co.nz', 'co.in',
            'com.au', 'com.br', 'com.mx', 'com.ar', 'com.tr', 'com.sg',

            // European TLDs
            'fr', 'de', 'it', 'es', 'nl', 'be', 'at', 'ch', 'se', 'no', 'dk', 'fi',
            'pl', 'cz', 'sk', 'hu', 'ro', 'bg', 'hr', 'si', 'lt', 'lv', 'ee',
            'pt', 'gr', 'ie', 'lu', 'mt', 'cy',

            // Asian TLDs
            'jp', 'kr', 'cn', 'tw', 'hk', 'sg', 'my', 'th', 'ph', 'vn', 'id', 'in',

            // Other common TLDs
            'ca', 'au', 'nz', 'za', 'br', 'mx', 'ar', 'cl', 'co', 'pe', 'uy',
            'ru', 'ua', 'by', 'kz', 'uz', 'tr', 'il', 'ae', 'sa', 'eg'
        ];

        // Start with the first part as the brand
        let brand = parts[0].toLowerCase();

        // Handle special cases like subdomain brands
        if (parts.length >= 3) {
            // Check if this looks like a subdomain pattern (e.g., fr.amazon.com)
            const possibleBrand = parts[1].toLowerCase();
            const suffix = parts.slice(2).join('.');

            // If the suffix is a known pattern and first part is a country code, use second part
            if (parts[0].length === 2 && ignoredSuffixes.includes(suffix)) {
                brand = possibleBrand;
            }
        }

        return brand;
    }

    /**
     * Check if a domain matches a brand keyword with intelligent international matching
     * @param {string} url - Full URL to check
     * @param {string} keyword - Brand keyword (e.g., 'amazon.com')
     * @returns {boolean} - True if matches
     */
    matchesBrandKeyword(url, keyword) {
        try {
            // Extract domain from URL
            const urlObj = new URL(url);
            const domain = urlObj.hostname.toLowerCase();

            // If exact match, return true immediately
            if (domain.includes(keyword.toLowerCase())) {
                return true;
            }

            // Extract brand from both the keyword and the domain
            const keywordBrand = this.extractBrandFromDomain(keyword);
            const domainBrand = this.extractBrandFromDomain(domain);

            // Check if brands match
            if (keywordBrand === domainBrand && keywordBrand.length > 2) {
                console.log(`🌍 International brand match: ${domain} -> ${keywordBrand} (from keyword ${keyword})`);
                return true;
            }

            return false;
        } catch (error) {
            // If URL parsing fails, fall back to simple includes check
            return url.toLowerCase().includes(keyword.toLowerCase());
        }
    }

    /**
     * Private method to check if a tab matches a category
     * @param {string} url - Normalized URL
     * @param {string} title - Normalized title
     * @param {Object} config - Category configuration
     * @returns {boolean} - True if matches
     */
    _matchesCategory(url, title, config) {
        // Check keywords with intelligent international domain matching
        const hasKeyword = config.keywords.some((keyword) => {
            // For domain-like keywords, use smart brand matching
            if (keyword.includes('.')) {
                return this.matchesBrandKeyword(url, keyword);
            }

            // For non-domain keywords, use traditional includes matching
            return url.includes(keyword.toLowerCase()) ||
                title.includes(keyword.toLowerCase());
        });

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