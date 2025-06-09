// src/utils/categorizer.js
// Modern ES6 Tab Categorization Engine

import { TAB_CATEGORIES, SHEPHERD_METER_LEVELS, SHEPHERD_CONFIG } from './constants.js';

/**
 * Advanced Tab Categorization Engine
 * Intelligently categorizes browser tabs based on URL and title analysis
 */
export class TabCategorizer {
  constructor() {
    this.categories = TAB_CATEGORIES;
    this.meterLevels = SHEPHERD_METER_LEVELS;
  }

  /**
   * Categorize a single tab based on URL and title analysis
   * @param {Object} tab - Chrome tab object
   * @returns {string} - Category name
   */
  categorizeTab(tab) {
    if (!tab?.url || !tab?.title) {
      return 'Uncategorized';
    }

    const url = tab.url.toLowerCase();
    const title = tab.title.toLowerCase();
    
    // Check each category for matches
    for (const [categoryName, config] of Object.entries(this.categories)) {
      if (this._matchesCategory(url, title, config)) {
        return categoryName;
      }
    }
    
    return 'Uncategorized';
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
    Object.keys(this.categories).forEach(category => {
      categorized[category] = [];
    });
    categorized['Uncategorized'] = [];
    
    // Categorize each tab
    tabs.forEach(tab => {
      const category = this.categorizeTab(tab);
      const isDuplicate = duplicates.includes(tab.id);
      
      categorized[category].push({
        ...tab,
        isDuplicate,
        category,
        lastAccessed: Date.now() // For future "old tabs" detection
      });
    });
    
    // Remove empty categories for cleaner UI
    Object.keys(categorized).forEach(category => {
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
    const duplicates = new Set();
    
    tabs.forEach(tab => {
      const normalizedUrl = this.normalizeUrl(tab.url);
      
      if (urlMap.has(normalizedUrl)) {
        // Mark both tabs as duplicates
        duplicates.add(tab.id);
        duplicates.add(urlMap.get(normalizedUrl));
      } else {
        urlMap.set(normalizedUrl, tab.id);
      }
    });
    
    return Array.from(duplicates);
  }

  /**
   * Normalize URL for duplicate detection
   * @param {string} url - Raw URL
   * @returns {string} - Normalized URL
   */
  normalizeUrl(url) {
    try {
      const urlObj = new URL(url);
      // Remove query params, fragments, and common tracking parameters
      const cleanPath = urlObj.pathname.replace(/\/$/, ''); // Remove trailing slash
      return `${urlObj.protocol}//${urlObj.hostname}${cleanPath}`;
    } catch (error) {
      console.warn('Failed to normalize URL:', url, error);
      return url;
    }
  }

  /**
   * Get category icon
   * @param {string} categoryName - Category name
   * @returns {string} - Unicode emoji icon
   */
  getCategoryIcon(categoryName) {
    return this.categories[categoryName]?.icon || '📋';
  }

  /**
   * Get category color
   * @param {string} categoryName - Category name
   * @returns {string} - Hex color code
   */
  getCategoryColor(categoryName) {
    return this.categories[categoryName]?.color || '#6B7280';
  }

  /**
   * Calculate Shepherd Meter level based on tab count
   * @param {number} tabCount - Number of open tabs
   * @returns {Object} - Shepherd meter data
   */
  getShepherdLevel(tabCount) {
    for (const [levelName, levelData] of Object.entries(this.meterLevels)) {
      const [min, max] = levelData.range;
      if (tabCount >= min && tabCount <= max) {
        return {
          ...levelData,
          levelName,
          tabCount
        };
      }
    }
    
    // Fallback to apocalyptic if somehow nothing matches
    return {
      ...this.meterLevels.APOCALYPTIC,
      levelName: 'APOCALYPTIC',
      tabCount
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
    const shepherdLevel = this.getShepherdLevel(tabs.length);
    
    const stats = {
      total: tabs.length,
      duplicates: duplicates.length,
      categories: Object.keys(categorized).length,
      shepherdLevel,
      categoryBreakdown: {}
    };

    // Category breakdown
    Object.entries(categorized).forEach(([category, categoryTabs]) => {
      stats.categoryBreakdown[category] = {
        count: categoryTabs.length,
        percentage: Math.round((categoryTabs.length / tabs.length) * 100),
        duplicates: categoryTabs.filter(tab => tab.isDuplicate).length
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
  findOldTabs(tabs, daysThreshold = SHEPHERD_CONFIG.OLD_TAB_THRESHOLD_DAYS) {
    const cutoffTime = Date.now() - (daysThreshold * 24 * 60 * 60 * 1000);
    
    return tabs
      .filter(tab => {
        // For now, consider tabs old if they haven't been accessed recently
        // In the future, this could use stored access times from background script
        return tab.lastAccessed && tab.lastAccessed < cutoffTime;
      })
      .map(tab => tab.id);
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
    const hasKeyword = config.keywords.some(keyword => 
      url.includes(keyword.toLowerCase()) || title.includes(keyword.toLowerCase())
    );
    
    if (hasKeyword) {
      return true;
    }
    
    // Check regex patterns if they exist
    if (config.patterns) {
      const hasPattern = config.patterns.some(pattern =>
        pattern.test(url) || pattern.test(title)
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
if (typeof window !== 'undefined') {
  window.TabCategorizer = TabCategorizer;
  window.tabCategorizer = tabCategorizer;
} 