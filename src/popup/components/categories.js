// src/popup/components/categories.js
// Categories Component - Manages tab category display and interactions

import { SHEPHERD_EVENTS, SHEPHERD_ACTIONS } from '../../utils/constants.js';
import { tabCategorizer } from '../../utils/categorizer.js';
import { tabsManager } from '../../utils/tabs.js';

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
    this.element = document.createElement('div');
    this.element.className = 'categories-container';
    this.element.id = 'categories-container';
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Category header clicks (expand/collapse)
    this.element.addEventListener('click', (e) => {
      if (e.target.closest('.category-header') && !e.target.closest('.category-actions')) {
        const categoryName = e.target.closest('.category-header').dataset.category;
        this.toggleCategory(categoryName);
      }
    });

    // Category action buttons
    this.element.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('.category-btn');
      if (actionBtn) {
        e.stopPropagation();
        const action = actionBtn.dataset.action;
        const category = actionBtn.dataset.category;
        
        this.handleCategoryAction(action, category);
      }
    });

    // Tab item clicks (switch to tab)
    this.element.addEventListener('click', (e) => {
      const tabItem = e.target.closest('.tab-item');
      if (tabItem) {
        const tabId = parseInt(tabItem.dataset.tabId);
        this.handleTabAction(SHEPHERD_ACTIONS.SWITCH_TO_TAB, tabId);
      }
    });

    // Listen for tabs updates
    document.addEventListener(SHEPHERD_EVENTS.TABS_UPDATED, (event) => {
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
        case 'close':
          await this.closeCategoryTabs(categoryName, tabs);
          break;
        case 'bookmark':
          await this.bookmarkCategoryTabs(categoryName, tabs);
          break;
        default:
          console.warn('Unknown category action:', action);
      }
    } catch (error) {
      console.error('Category action failed:', error);
      this.dispatchEvent(SHEPHERD_EVENTS.ERROR_OCCURRED, { 
        error: error.message,
        action,
        category: categoryName 
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
        case SHEPHERD_ACTIONS.SWITCH_TO_TAB:
          await tabsManager.switchToTab(tabId);
          // Close popup after switching
          window.close();
          break;
        default:
          console.warn('Unknown tab action:', action);
      }
    } catch (error) {
      console.error('Tab action failed:', error);
      this.dispatchEvent(SHEPHERD_EVENTS.ERROR_OCCURRED, { 
        error: error.message,
        action,
        tabId 
      });
    }
  }

  /**
   * Close all tabs in a category
   * @param {string} categoryName - Category name
   * @param {Array} tabs - Category tabs
   */
  async closeCategoryTabs(categoryName, tabs) {
    const confirmed = confirm(`Close all ${tabs.length} tabs in "${categoryName}"?`);
    if (!confirmed) return;

    this.dispatchEvent(SHEPHERD_EVENTS.LOADING_STARTED, { action: 'closing_category' });

    try {
      const tabIds = tabs.map(tab => tab.id);
      await tabsManager.closeTabs(tabIds);

      // Update badge
      await tabsManager.requestBadgeUpdate();

      this.dispatchEvent(SHEPHERD_EVENTS.TABS_UPDATED, { 
        action: 'category_closed',
        category: categoryName,
        count: tabs.length
      });

    } finally {
      this.dispatchEvent(SHEPHERD_EVENTS.LOADING_FINISHED);
    }
  }

  /**
   * Bookmark all tabs in a category
   * @param {string} categoryName - Category name
   * @param {Array} tabs - Category tabs
   */
  async bookmarkCategoryTabs(categoryName, tabs) {
    this.dispatchEvent(SHEPHERD_EVENTS.LOADING_STARTED, { action: 'bookmarking_category' });

    try {
      const result = await tabsManager.bookmarkTabs(tabs, categoryName);
      
      if (result.success) {
        // Show success feedback
        this.showCategoryFeedback(categoryName, `✅ ${result.bookmarksCount} tabs bookmarked!`);
      }

    } finally {
      this.dispatchEvent(SHEPHERD_EVENTS.LOADING_FINISHED);
    }
  }

  /**
   * Toggle category expansion
   * @param {string} categoryName - Category name
   */
  toggleCategory(categoryName) {
    const categoryEl = this.element.querySelector(`[data-category="${categoryName}"]`);
    if (!categoryEl) return;

    const isExpanded = this.expandedCategories.has(categoryName);
    
    if (isExpanded) {
      categoryEl.classList.remove('expanded');
      this.expandedCategories.delete(categoryName);
      this.dispatchEvent(SHEPHERD_EVENTS.CATEGORY_COLLAPSED, { category: categoryName });
    } else {
      categoryEl.classList.add('expanded');
      this.expandedCategories.add(categoryName);
      this.dispatchEvent(SHEPHERD_EVENTS.CATEGORY_EXPANDED, { category: categoryName });
    }
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

    this.element.innerHTML = '';
    
    // Sort categories by tab count (descending)
    const sortedCategories = Object.entries(this.categorizedTabs)
      .sort(([,a], [,b]) => b.length - a.length);

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
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category';
    categoryDiv.dataset.category = categoryName;
    
    const icon = tabCategorizer.getCategoryIcon(categoryName);
    const color = tabCategorizer.getCategoryColor(categoryName);
    const duplicateCount = tabs.filter(tab => tab.isDuplicate).length;
    
    // Restore expanded state
    if (this.expandedCategories.has(categoryName)) {
      categoryDiv.classList.add('expanded');
    }

    categoryDiv.innerHTML = `
      <div class="category-header" data-category="${categoryName}" style="border-left: 4px solid ${color}">
        <div class="category-title">
          <span class="category-icon">${icon}</span>
          <span class="category-name">${categoryName}</span>
          <span class="category-count">${tabs.length}</span>
          ${duplicateCount > 0 ? `<span class="tab-duplicate">🔄 ${duplicateCount}</span>` : ''}
        </div>
        <div class="category-actions">
          <button class="category-btn" data-action="bookmark" data-category="${categoryName}" title="Bookmark all tabs">
            📁 Bookmark
          </button>
          <button class="category-btn danger" data-action="close" data-category="${categoryName}" title="Close all tabs">
            ✖️ Close
          </button>
        </div>
      </div>
      <div class="tab-list">
        ${tabs.map(tab => this.createTabElement(tab)).join('')}
      </div>
    `;
    
    return categoryDiv;
  }

  /**
   * Create a single tab element
   * @param {Object} tab - Tab object
   * @returns {string} - Tab HTML string
   */
  createTabElement(tab) {
    const favicon = tab.favIconUrl || this.getDefaultFavicon();
    const title = this.escapeHtml(tab.title || 'Untitled');
    const url = this.escapeHtml(tab.url || '');
    
    return `
      <div class="tab-item ${tab.isDuplicate ? 'duplicate' : ''}" data-tab-id="${tab.id}" title="${url}">
        <img class="tab-favicon" src="${favicon}" alt="${title}" onerror="this.src='${this.getDefaultFavicon()}'">
        <span class="tab-title">${title}</span>
        ${tab.isDuplicate ? '<span class="tab-duplicate">🔄</span>' : ''}
        <span class="tab-actions">
          <button class="tab-close-btn" title="Close this tab" onclick="event.stopPropagation()">×</button>
        </span>
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
        <p>Open some tabs and Shepherd will categorize them for you.</p>
      </div>
    `;
  }

  /**
   * Show feedback message for a category
   * @param {string} categoryName - Category name
   * @param {string} message - Feedback message
   */
  showCategoryFeedback(categoryName, message) {
    const categoryEl = this.element.querySelector(`[data-category="${categoryName}"]`);
    if (!categoryEl) return;

    const feedback = document.createElement('div');
    feedback.className = 'category-feedback';
    feedback.textContent = message;
    
    categoryEl.appendChild(feedback);
    
    setTimeout(() => {
      feedback.remove();
    }, 3000);
  }

  /**
   * Get default favicon for tabs without one
   * @returns {string} - Default favicon data URL
   */
  getDefaultFavicon() {
    return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23ddd" rx="2"/><text x="8" y="12" text-anchor="middle" fill="%23999" font-size="10">📄</text></svg>';
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} - Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
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
      throw new Error('Valid container element required for categories rendering');
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