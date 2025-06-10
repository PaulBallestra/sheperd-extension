// src/popup/components/categories.js
// Categories Component - Manages tab category display and interactions

import { SHEPERD_EVENTS, SHEPERD_ACTIONS } from "../../utils/constants.js";
import { tabCategorizer } from "../../utils/categorizer.js";
import { tabsManager } from "../../utils/tabs.js";

/**
 * Categories Component
 * Handles the display and management of categorized tabs
 */
export class CategoriesComponent {
    constructor() {
        this.element = null;
        this.categorizedTabs = {};
        this.expandedCategories = new Set();

        this.init();
    }

    /**
     * Initialize the categories component
     */
    init() {
        this.createElement();
        this.bindEvents();
    }

    /**
     * Create the categories container DOM structure
     */
    createElement() {
        this.element = document.createElement("div");
        this.element.className = "categories-container";
        this.element.id = "categories-container";
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Category header clicks (expand/collapse)
        this.element.addEventListener("click", (e) => {
            if (
                e.target.closest(".category-header") &&
                !e.target.closest(".category-actions")
            ) {
                const categoryName =
                    e.target.closest(".category-header").dataset.category;
                this.toggleCategory(categoryName);
            }
        });

        // Category action buttons
        this.element.addEventListener("click", (e) => {
            const actionBtn = e.target.closest(".category-btn");
            if (actionBtn) {
                e.stopPropagation();
                const action = actionBtn.dataset.action;
                const category = actionBtn.dataset.category;

                this.handleCategoryAction(action, category);
            }
        });

        // Tab close button clicks
        this.element.addEventListener("click", (e) => {
            const closeBtn = e.target.closest(".tab-close-btn");
            if (closeBtn) {
                e.stopPropagation();
                const tabId = parseInt(closeBtn.dataset.tabId);
                this.handleTabAction(SHEPERD_ACTIONS.CLOSE_TAB, tabId);
            }
        });

        // Tab item clicks (switch to tab)
        this.element.addEventListener("click", (e) => {
            const tabItem = e.target.closest(".tab-item");
            if (tabItem && !e.target.closest(".tab-close-btn")) {
                const tabId = parseInt(tabItem.dataset.tabId);
                this.handleTabAction(SHEPERD_ACTIONS.SWITCH_TO_TAB, tabId);
            }
        });

        // Favicon error handling
        this.element.addEventListener(
            "error",
            (e) => {
                if (e.target.classList.contains("tab-favicon")) {
                    const defaultFavicon = e.target.dataset.defaultFavicon;
                    if (defaultFavicon) {
                        e.target.src = defaultFavicon;
                    }
                }
            },
            true
        ); // Use capture phase for error events

        // Listen for tabs updates
        document.addEventListener(SHEPERD_EVENTS.TABS_UPDATED, (event) => {
            this.updateCategories(event.detail.categorizedTabs);
        });
    }

    /**
     * Handle category actions (close, bookmark)
     * @param {string} action - Action type
     * @param {string} categoryName - Category name
     */
    async handleCategoryAction(action, categoryName) {
        const tabs = this.categorizedTabs[categoryName];
        if (!tabs || tabs.length === 0) return;

        try {
            switch (action) {
                case "close":
                    await this.closeCategoryTabs(categoryName, tabs);
                    break;
                case "bookmark":
                    await this.bookmarkCategoryTabs(categoryName, tabs);
                    break;
                default:
                    console.warn("Unknown category action:", action);
            }
        } catch (error) {
            console.error("Category action failed:", error);
            this.dispatchEvent(SHEPERD_EVENTS.ERROR_OCCURRED, {
                error: error.message,
                action,
                category: categoryName,
            });
        }
    }

    /**
     * Handle individual tab actions
     * @param {string} action - Action type
     * @param {number} tabId - Tab ID
     */
    async handleTabAction(action, tabId) {
        try {
            switch (action) {
                case SHEPERD_ACTIONS.SWITCH_TO_TAB:
                    await tabsManager.switchToTab(tabId);
                    // Close popup after switching
                    window.close();
                    break;
                case SHEPERD_ACTIONS.CLOSE_TAB:
                    await tabsManager.closeTabs([tabId]);
                    // Update badge and refresh categories
                    await tabsManager.requestBadgeUpdate();
                    this.dispatchEvent(SHEPERD_EVENTS.TABS_UPDATED, {
                        action: "tab_closed",
                        tabId: tabId,
                    });
                    break;
                default:
                    console.warn("Unknown tab action:", action);
            }
        } catch (error) {
            console.error("Tab action failed:", error);
            this.dispatchEvent(SHEPERD_EVENTS.ERROR_OCCURRED, {
                error: error.message,
                action,
                tabId,
            });
        }
    }

    /**
     * Close all tabs in a category
     * @param {string} categoryName - Category name
     * @param {Array} tabs - Category tabs
     */
    async closeCategoryTabs(categoryName, tabs) {
        const confirmed = confirm(
            `Close all ${tabs.length} tabs in "${categoryName}"?`
        );
        if (!confirmed) return;

        this.dispatchEvent(SHEPERD_EVENTS.LOADING_STARTED, {
            action: "closing_category",
        });

        try {
            const tabIds = tabs.map((tab) => tab.id);
            await tabsManager.closeTabs(tabIds);

            // Update badge
            await tabsManager.requestBadgeUpdate();

            this.dispatchEvent(SHEPERD_EVENTS.TABS_UPDATED, {
                action: "category_closed",
                category: categoryName,
                count: tabs.length,
            });
        } finally {
            this.dispatchEvent(SHEPERD_EVENTS.LOADING_FINISHED);
        }
    }

    /**
     * Bookmark all tabs in a category
     * @param {string} categoryName - Category name
     * @param {Array} tabs - Category tabs
     */
    async bookmarkCategoryTabs(categoryName, tabs) {
        this.dispatchEvent(SHEPERD_EVENTS.LOADING_STARTED, {
            action: "bookmarking_category",
        });

        try {
            const result = await tabsManager.bookmarkTabs(tabs, categoryName);

            if (result.success) {
                // Show success feedback
                this.showCategoryFeedback(
                    categoryName,
                    `✅ ${result.bookmarksCount} tabs bookmarked!`
                );
            }
        } finally {
            this.dispatchEvent(SHEPERD_EVENTS.LOADING_FINISHED);
        }
    }

    /**
     * Toggle category expansion with smooth animation
     * @param {string} categoryName - Category name
     */
    toggleCategory(categoryName) {
        const categoryEl = this.element.querySelector(
            `[data-category="${categoryName}"]`
        );
        if (!categoryEl) return;

        const content = categoryEl.querySelector(".category-content");
        const toggleIcon = categoryEl.querySelector(".toggle-icon");
        const isExpanded = this.expandedCategories.has(categoryName);

        if (isExpanded) {
            // Collapse
            content.style.maxHeight = '0px';
            content.classList.remove("expanded");
            categoryEl.classList.remove("expanded");
            this.expandedCategories.delete(categoryName);

            this.dispatchEvent(SHEPERD_EVENTS.CATEGORY_COLLAPSED, {
                category: categoryName,
            });
        } else {
            // Expand with dynamic height
            const dynamicHeight = this.calculateCategoryHeight(categoryName);
            content.style.maxHeight = `${dynamicHeight}px`;
            content.classList.add("expanded");
            categoryEl.classList.add("expanded");
            this.expandedCategories.add(categoryName);

            this.dispatchEvent(SHEPERD_EVENTS.CATEGORY_EXPANDED, {
                category: categoryName,
            });
        }
    }

    /**
     * Calculate the appropriate height for a category based on its content
     * @param {string} categoryName - Category name
     * @returns {number} - Calculated height in pixels
     */
    calculateCategoryHeight(categoryName) {
        const tabs = this.categorizedTabs[categoryName] || [];
        const tabCount = tabs.length;

        // Base padding and border height
        const baseHeight = 24; // padding top + bottom (12px each)

        // Each tab item height (approximately 44px including margins)
        const tabHeight = 44;

        // Calculate total height with a small buffer
        const totalHeight = baseHeight + (tabCount * tabHeight) + 8; // 8px buffer

        // No height limit - let it expand for infinite tabs!
        return totalHeight;
    }

    /**
     * Update categories display
     * @param {Object} categorizedTabs - Categorized tabs object
     */
    updateCategories(categorizedTabs) {
        this.categorizedTabs = categorizedTabs || {};
        this.renderCategories();
    }

    /**
     * Render all categories
     */
    renderCategories() {
        if (!this.element) return;

        this.element.innerHTML = "";

        // Sort categories by tab count (descending)
        const sortedCategories = Object.entries(this.categorizedTabs).sort(
            ([, a], [, b]) => b.length - a.length
        );

        if (sortedCategories.length === 0) {
            this.renderEmptyState();
            return;
        }

        sortedCategories.forEach(([categoryName, tabs]) => {
            const categoryEl = this.createCategoryElement(categoryName, tabs);
            this.element.appendChild(categoryEl);
        });
    }

    /**
     * Create a single category element
     * @param {string} categoryName - Category name
     * @param {Array} tabs - Category tabs
     * @returns {HTMLElement} - Category DOM element
     */
    createCategoryElement(categoryName, tabs) {
            const categoryDiv = document.createElement("div");
            categoryDiv.className = "category";
            categoryDiv.dataset.category = categoryName;

            const icon = tabCategorizer.getCategoryIcon(categoryName);
            const color = tabCategorizer.getCategoryColor(categoryName);
            const duplicateCount = tabs.filter((tab) => tab.isDuplicate).length;
            const isExpanded = this.expandedCategories.has(categoryName);

            // Restore expanded state
            if (isExpanded) {
                categoryDiv.classList.add("expanded");
            }

            categoryDiv.innerHTML = `
        <div class="category-header" data-category="${categoryName}" ${color ? `data-category-color="${color}"` : ''}>
          <div class="category-title">
            <span class="category-icon">${icon}</span>
            <span class="category-name">${categoryName}</span>
            
            ${
              duplicateCount > 0
                ? `<span class="tab-duplicate">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L13.09 8.26L19 7L17.74 13.26L22 15L15.74 16.09L17 22L10.74 20.74L9 25L7.91 18.74L2 20L3.26 13.74L-1 12L5.26 10.91L4 5L10.26 6.26L12 2Z" fill="currentColor"/>
                    </svg>
                    ${duplicateCount}
                  </span>`
                : ""
            }
          </div>
          <div class="category-actions">
            <button class="category-btn" data-action="bookmark" data-category="${categoryName}" title="Bookmark all tabs">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="category-btn danger" data-action="close" data-category="${categoryName}" title="Close all tabs">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="category-toggle">
            <span class="category-count">${tabs.length}</span>
            <span class="toggle-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </div>
        </div>
        <div class="category-content ${isExpanded ? "expanded" : ""}">
          <div class="tab-list">
            ${tabs.map((tab) => this.createTabElement(tab)).join("")}
          </div>
        </div>
    `;

    // Apply category color without inline styles (CSP-compliant)
    const header = categoryDiv.querySelector(".category-header");
    if (header && color) {
      header.style.borderLeftColor = color;
      header.style.setProperty('--category-color', color);
    }

    return categoryDiv;
  }

  /**
   * Create a single tab element
   * @param {Object} tab - Tab object
   * @returns {string} - Tab HTML string
   */
  createTabElement(tab) {
    const favicon = this.getTabFavicon(tab);
    const title = this.getTabTitle(tab);
    const altTitle = tab.title || "Untitled";
    const url = this.escapeHtml(tab.url || "");

    return `
      <div class="tab-item ${
        tab.isDuplicate ? "duplicate" : ""
      }" data-tab-id="${tab.id}" title="${url}">
        <div class="tab-title-container">
          <img width="12" height="12" class="tab-favicon" src="${favicon}" alt="${altTitle}" data-default-favicon="${favicon}" onerror="this.src='${favicon}'">
          <span class="tab-title">${title}</span>
        </div>
        <div class="tab-actions">
          ${tab.isDuplicate ? `<span class="tab-duplicate" title="Duplicate tab">
            <svg width="12" height="12" max-width="12" max-height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L19 7L17.74 13.26L22 15L15.74 16.09L17 22L10.74 20.74L9 25L7.91 18.74L2 20L3.26 13.74L-1 12L5.26 10.91L4 5L10.26 6.26L12 2Z" fill="currentColor"/>
            </svg>
          </span>` : ""}
          <button class="tab-close-btn" title="Close this tab" data-tab-id="${
            tab.id
          }">
            <svg width="12" height="12" max-width="12" max-height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Render empty state when no tabs
   */
  renderEmptyState() {
    this.element.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🐑</div>
        <h3>No tabs to organize!</h3>
        <p>Open some tabs and Sheperd will categorize them for you.</p>
      </div>
    `;
  }

  /**
   * Show feedback message for a category
   * @param {string} categoryName - Category name
   * @param {string} message - Feedback message
   */
  showCategoryFeedback(categoryName, message) {
    const categoryEl = this.element.querySelector(
      `[data-category="${categoryName}"]`
    );
    if (!categoryEl) return;

    const feedback = document.createElement("div");
    feedback.className = "category-feedback";
    feedback.textContent = message;

    categoryEl.appendChild(feedback);

    setTimeout(() => {
      feedback.remove();
    }, 3000);
  }

  /**
   * Get appropriate favicon for a tab
   * @param {Object} tab - Tab object
   * @returns {string} - Favicon URL or data URL
   */
  getTabFavicon(tab) {
    const url = tab.url || '';
    
    // Handle browser internal pages
    if (this.isBrowserInternalUrl(url)) {
      return this.getBrowserInternalFavicon(url);
    }
    
    return tab.favIconUrl || this.getDefaultFavicon();
  }

  /**
   * Get clean title for a tab
   * @param {Object} tab - Tab object
   * @returns {string} - Clean, truncated title
   */
  getTabTitle(tab) {
    const url = tab.url || '';
    const rawTitle = tab.title || "Untitled";
    
    // Handle browser internal pages
    if (this.isBrowserInternalUrl(url)) {
      return this.getBrowserInternalTitle(url, rawTitle);
    }
    
    // Clean and truncate regular titles
    const cleanTitle = this.escapeHtml(rawTitle);
    return this.truncateTitle(cleanTitle);
  }

  /**
   * Check if URL is a browser internal page
   * @param {string} url - Tab URL
   * @returns {boolean} - True if internal browser page
   */
  isBrowserInternalUrl(url) {
    const internalProtocols = [
      'chrome://',
      'chrome-extension://',
      'edge://',
      'moz-extension://',
      'about:',
      'opera://',
      'vivaldi://',
      'brave://'
    ];
    
    return internalProtocols.some(protocol => url.startsWith(protocol));
  }

  /**
   * Get clean title for browser internal pages
   * @param {string} url - Tab URL
   * @param {string} rawTitle - Original title
   * @returns {string} - Clean title
   */
  getBrowserInternalTitle(url, rawTitle) {
    const titleMappings = {
      // Chrome
      'chrome://extensions/': 'Extensions',
      'chrome://bookmarks/': 'Bookmarks Manager',
      'chrome://history/': 'History',
      'chrome://settings/': 'Settings',
      'chrome://newtab/': 'New Tab',
      'chrome://downloads/': 'Downloads',
      'chrome://flags/': 'Chrome Flags',
      'chrome://version/': 'About Chrome',
      'chrome://inspect/': 'DevTools',
      'chrome://chrome-urls/': 'Chrome URLs',
      
      // Edge
      'edge://extensions/': 'Extensions',
      'edge://settings/': 'Settings',
      'edge://history/': 'History',
      'edge://downloads/': 'Downloads',
      'edge://newtab/': 'New Tab',
      'edge://flags/': 'Edge Flags',
      
      // Firefox
      'about:preferences': 'Preferences',
      'about:addons': 'Add-ons Manager',
      'about:downloads': 'Downloads',
      'about:history': 'History',
      'about:newtab': 'New Tab',
      'about:blank': 'Blank Page',
      
      // Opera/Vivaldi/Brave
      'opera://settings/': 'Settings',
      'vivaldi://settings/': 'Settings',
      'brave://settings/': 'Settings'
    };

    // Try exact match first
    if (titleMappings[url]) {
      return titleMappings[url];
    }

    // Try partial matches for URLs with parameters
    for (const [pattern, title] of Object.entries(titleMappings)) {
      if (url.startsWith(pattern)) {
        return title;
      }
    }

    // Fallback: extract meaningful part from URL
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(part => part);
      if (pathParts.length > 0) {
        const lastPart = pathParts[pathParts.length - 1];
        return this.capitalizeFirstLetter(lastPart.replace(/[-_]/g, ' '));
      }
    } catch (e) {
      // Invalid URL, use raw title
    }

    // Final fallback: clean the raw title
    return this.truncateTitle(this.escapeHtml(rawTitle));
  }

  /**
   * Get favicon for browser internal pages
   * @param {string} url - Tab URL
   * @returns {string} - Favicon data URL
   */
  getBrowserInternalFavicon(url) {
    // Create properly encoded SVG data URLs
    const createSvgDataUrl = (color, letter) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="${color}"/><text x="8" y="12" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${letter}</text></svg>`;
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    };
    
    // Browser-specific favicons
    if (url.startsWith('chrome://')) {
      return createSvgDataUrl('#4285f4', 'C');
    }
    
    if (url.startsWith('edge://')) {
      return createSvgDataUrl('#0078d4', 'E');
    }
    
    if (url.startsWith('about:') || url.startsWith('moz-extension://')) {
      return createSvgDataUrl('#ff9500', 'F');
    }
    
    if (url.startsWith('opera://')) {
      return createSvgDataUrl('#ff1b2d', 'O');
    }
    
    if (url.startsWith('vivaldi://')) {
      return createSvgDataUrl('#ef3939', 'V');
    }
    
    if (url.startsWith('brave://')) {
      return createSvgDataUrl('#fb542b', 'B');
    }

    // Default browser icon for unknown internal pages
    return createSvgDataUrl('#666', '?');
  }

  /**
   * Truncate title to reasonable length
   * @param {string} title - Title to truncate
   * @param {number} maxLength - Maximum length (default: 50)
   * @returns {string} - Truncated title
   */
  truncateTitle(title, maxLength = 50) {
    if (!title || title.length <= maxLength) {
      return title;
    }
    
    return title.substring(0, maxLength - 3) + '...';
  }

  /**
   * Capitalize first letter of a string
   * @param {string} str - String to capitalize
   * @returns {string} - Capitalized string
   */
  capitalizeFirstLetter(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Get default favicon for tabs without one
   * @returns {string} - Default favicon data URL
   */
  getDefaultFavicon() {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="#ddd" rx="2"/><text x="8" y="12" text-anchor="middle" fill="#999" font-size="10">📄</text></svg>';
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Clean and escape HTML to prevent XSS while improving readability
   * @param {string} text - Text to clean and escape
   * @returns {string} - Cleaned and escaped text
   */
  escapeHtml(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    // Remove HTML tags and decode HTML entities for a cleaner display
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    const cleanText = tempDiv.textContent || tempDiv.innerText || '';
    
    // Escape the cleaned text for safe display
    const div = document.createElement("div");
    div.textContent = cleanText;
    return div.innerHTML;
  }

  /**
   * Dispatch custom event
   * @param {string} eventType - Event type
   * @param {Object} detail - Event detail data
   */
  dispatchEvent(eventType, detail = {}) {
    const event = new CustomEvent(eventType, { detail });
    document.dispatchEvent(event);
  }

  /**
   * Get expanded categories
   * @returns {Set} - Set of expanded category names
   */
  getExpandedCategories() {
    return new Set(this.expandedCategories);
  }

  /**
   * Set expanded categories
   * @param {Array|Set} categories - Categories to expand
   */
  setExpandedCategories(categories) {
    this.expandedCategories = new Set(categories);
    // Re-render to apply expanded state
    this.renderCategories();
  }

  /**
   * Render the component to a target container
   * @param {HTMLElement} container - Target container element
   */
  render(container) {
    if (!container || !(container instanceof HTMLElement)) {
      throw new Error(
        "Valid container element required for categories rendering"
      );
    }

    if (this.element) {
      container.appendChild(this.element);
    }
  }

  /**
   * Update the component state
   * @param {Object} state - Component state data
   */
  updateState(state) {
    if (state.categorizedTabs) {
      this.updateCategories(state.categorizedTabs);
    }

    if (state.expandedCategories) {
      this.setExpandedCategories(state.expandedCategories);
    }
  }

  /**
   * Destroy the component and clean up
   */
  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
      this.categorizedTabs = {};
      this.expandedCategories.clear();
    }
  }

  /**
   * Get the component's DOM element
   * @returns {HTMLElement} - Component DOM element
   */
  getElement() {
    return this.element;
  }
}

// Export singleton instance for convenience
export const categoriesComponent = new CategoriesComponent();