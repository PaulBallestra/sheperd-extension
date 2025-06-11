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

    // Bind real-time state management events
    this.bindRealTimeEvents();

    // Real-time events only - legacy TABS_UPDATED removed
  }

  /**
   * Bind real-time state management events
   */
  bindRealTimeEvents() {
    // Listen for categories-specific updates (initial load and major rebuilds)
    document.addEventListener(SHEPERD_EVENTS.CATEGORIES_UPDATED, (event) => {
      const { categorizedTabs, type } = event.detail;
      console.log(
        `🔄 Categories received CATEGORIES_UPDATED: ${type}, categories: ${
          Object.keys(categorizedTabs || {}).length
        }`
      );
      this.updateCategories(categorizedTabs);
    });

    // Listen for state restoration events
    document.addEventListener(SHEPERD_EVENTS.STATE_UPDATED, (event) => {
      const { type, categorizedTabs } = event.detail;

      // ONLY handle restoration events that require full rebuild
      switch (type) {
        case "tab_restored":
        case "category_restored":
        case "bulk_operation_restored":
          console.log(
            `🔄 Restoration event '${type}' - doing full category rebuild`
          );
          this.updateCategories(categorizedTabs);
          break;
        default:
          // For all removal events (tab_removed, category_removed, bulk_operation),
          // UI is already updated optimistically - NO REBUILD NEEDED!
          console.log(
            `✅ Event '${type}' handled optimistically - no rebuild needed`
          );
          break;
      }
    });

    // Listen for bulk operation events from quick actions
    document.addEventListener(
      SHEPERD_EVENTS.BULK_OPERATION_OPTIMISTIC,
      (event) => {
        const { operation, removedTabs } = event.detail;
        console.log(
          `🗑️ Bulk operation '${operation}' - removing ${removedTabs.length} tabs optimistically`
        );

        // Track affected categories for duplicate recalculation
        const affectedCategories = new Set();

        // Remove each tab optimistically from the UI
        removedTabs.forEach((tab) => {
          const categoryName = this.findTabCategoryInUI(tab.id);
          if (categoryName) {
            affectedCategories.add(categoryName);
          }
          this.removeTabFromUI(tab.id);
        });

        // Recalculate duplicates for all affected categories
        affectedCategories.forEach((categoryName) => {
          const categoryElement = this.element.querySelector(
            `[data-category="${categoryName}"]`
          );
          if (categoryElement && this.categorizedTabs[categoryName]) {
            // Recalculate and update duplicate counter
            this.updateCategoryDuplicateCounter(categoryName, categoryElement);
            // Update tab elements duplicate status
            this.updateTabElementsDuplicateStatus(
              categoryName,
              categoryElement
            );
          }
        });
      }
    );

    // Listen for bulk operation failures to restore tabs
    document.addEventListener(SHEPERD_EVENTS.BULK_OPERATION_FAILED, (event) => {
      const { operation, removedTabs } = event.detail;
      console.log(
        `❌ Bulk operation '${operation}' failed - no action needed, main app handles rollback`
      );
      // Main app handles state rollback automatically via restoreStateSnapshot
    });

    // Listen for Chrome real-time tab changes (handled separately from main app)
    // This prevents the main app from triggering full category rebuilds on Chrome events
    const api =
      typeof browser !== "undefined" && browser.runtime ? browser : chrome;
    if (api && api.runtime && api.runtime.onMessage) {
      api.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (
          message.type === "TAB_CHANGE" ||
          message.action === "tab_change_notification"
        ) {
          console.log(
            `🏷️ Categories received Chrome tab change: ${message.eventType}`
          );
          this.handleChromeTabChange(message.eventType, message.data);
          return false; // Don't stop other listeners
        }
      });
    }
  }

  /**
   * Handle Chrome tab changes without full rebuild
   * @param {string} eventType - Chrome event type
   * @param {Object} data - Event data
   */
  async handleChromeTabChange(eventType, data) {
    // Only handle Chrome events that don't interfere with optimistic updates
    // Ignore events that are already handled by user actions
    if (eventType === "removed" || eventType === "updated") {
      console.log(
        `⏸️ Categories ignoring Chrome '${eventType}' - handled by optimistic updates`
      );
      return;
    }

    // For tab creation, we can add tabs without full rebuild
    if (eventType === "created" && data && data.tab) {
      console.log(`➕ Categories handling Chrome tab creation: ${data.tab.id}`);
      this.addTabToUI(data.tab);
      return;
    }

    // For other events, we may need updated data but shouldn't rebuild
    console.log(`⚠️ Categories received unhandled Chrome event: ${eventType}`);
  }

  /**
   * Add a new tab to the UI without full rebuild
   * @param {Object} newTab - New tab object
   */
  addTabToUI(newTab) {
    try {
      // Import categorizer to categorize the new tab
      const category = tabCategorizer.categorizeTab(newTab);

      // Add to internal state
      if (!this.categorizedTabs[category]) {
        this.categorizedTabs[category] = [];
      }
      this.categorizedTabs[category].push(newTab);

      // Find or create category element
      let categoryElement = this.element.querySelector(
        `[data-category="${category}"]`
      );

      if (!categoryElement) {
        // Create new category
        categoryElement = this.createCategoryElement(category, [newTab]);

        // Insert in correct position (categories are sorted by tab count)
        const existingCategories = Array.from(
          this.element.querySelectorAll(".category")
        );
        const insertIndex = this.findInsertionIndex(1, existingCategories);

        if (insertIndex < existingCategories.length) {
          this.element.insertBefore(
            categoryElement,
            existingCategories[insertIndex]
          );
        } else {
          this.element.appendChild(categoryElement);
        }

        // Use consistent category addition animation
        this.animateCategoryAddition(categoryElement);

        console.log(
          `✅ Created new category '${category}' for tab ${newTab.id}`
        );
      } else {
        // Add tab to existing category
        const tabList = categoryElement.querySelector(".tab-list");
        if (tabList) {
          const tabHtml = this.createTabElement(newTab);
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = tabHtml;
          const newTabElement = tempDiv.firstElementChild;

          // Add to DOM and animate in
          tabList.appendChild(newTabElement);
          this.animateTabAddition(newTabElement);

          // Update category header count
          this.updateCategoryHeaderCount(category, categoryElement);

          console.log(
            `✅ Added tab ${newTab.id} to existing category '${category}'`
          );
        }
      }

      // Clear empty state if present
      const emptyState = this.element.querySelector(".empty-state");
      if (emptyState) {
        emptyState.remove();
      }
    } catch (error) {
      console.error("Failed to add tab to UI:", error);
    }
  }

  /**
   * Find which category a tab belongs to in the UI
   * @param {number} tabId - Tab ID to find
   * @returns {string|null} - Category name or null if not found
   */
  findTabCategoryInUI(tabId) {
    for (const [categoryName, tabs] of Object.entries(this.categorizedTabs)) {
      if (tabs.some((tab) => tab.id === tabId)) {
        return categoryName;
      }
    }
    return null;
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
          // Generate unique operation ID
          const operationId = `tab_${tabId}_${Date.now()}`;
          const categoryName = this.findTabCategoryInUI(tabId);

          // Dispatch optimistic removal event to main app
          this.dispatchEvent(SHEPERD_EVENTS.TAB_REMOVED_OPTIMISTIC, {
            tabId,
            categoryName,
            operationId,
          });

          // Optimistic UI update - remove tab immediately
          this.removeTabFromUI(tabId);

          try {
            await tabsManager.closeTabs([tabId]);
            // Update badge
            await tabsManager.requestBadgeUpdate();

            // Dispatch confirmation event
            this.dispatchEvent(SHEPERD_EVENTS.TAB_REMOVAL_CONFIRMED, {
              tabId,
              operationId,
            });
          } catch (error) {
            // If tab close failed, dispatch failure event
            console.error("Failed to close tab:", error);
            this.dispatchEvent(SHEPERD_EVENTS.TAB_REMOVAL_FAILED, {
              tabId,
              categoryName,
              operationId,
              error: error.message,
            });
            throw error;
          }
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
   * Close all tabs in a category with optimistic UI updates
   * @param {string} categoryName - Category name
   * @param {Array} tabs - Category tabs
   */
  async closeCategoryTabs(categoryName, tabs) {
    // Generate unique operation ID
    const operationId = `category_${categoryName}_${Date.now()}`;

    // Show immediate feedback instead of blocking confirm dialog
    this.showCategoryFeedback(
      categoryName,
      `🗑️ Closing ${tabs.length} tabs...`,
      "warning"
    );

    // Small delay to show the feedback, then proceed
    setTimeout(async () => {
      // Dispatch optimistic removal event to main app
      this.dispatchEvent(SHEPERD_EVENTS.CATEGORY_REMOVED_OPTIMISTIC, {
        categoryName,
        tabs: [...tabs], // Create copy
        operationId,
      });

      // Optimistic UI update - remove category immediately
      this.removeCategoryFromUI(categoryName, tabs);

      try {
        // Close all tabs in background
        const tabIds = tabs.map((tab) => tab.id);
        await tabsManager.closeTabs(tabIds);

        // Update badge
        await tabsManager.requestBadgeUpdate();

        // Dispatch confirmation event
        this.dispatchEvent(SHEPERD_EVENTS.CATEGORY_REMOVAL_CONFIRMED, {
          categoryName,
          operationId,
        });

        // Show success feedback briefly
        console.log(
          `✅ Successfully closed ${tabs.length} tabs from "${categoryName}"`
        );
      } catch (error) {
        // If category close failed, dispatch failure event
        console.error("Failed to close category:", error);
        this.dispatchEvent(SHEPERD_EVENTS.CATEGORY_REMOVAL_FAILED, {
          categoryName,
          tabs,
          operationId,
          error: error.message,
        });

        // Show error feedback
        this.showCategoryFeedback(
          categoryName,
          `❌ Failed to close tabs`,
          "error"
        );
        throw error;
      }
    }, 200); // Brief delay to show the "Closing..." feedback
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
      content.style.maxHeight = "0px";
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
    const totalHeight = baseHeight + tabCount * tabHeight + 8; // 8px buffer

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
   * Remove a tab from the UI without full re-render (optimistic update)
   * @param {number} tabId - Tab ID to remove
   */
  removeTabFromUI(tabId) {
    const tabElement = this.element.querySelector(`[data-tab-id="${tabId}"]`);
    if (!tabElement) return;

    // Find which category this tab belongs to
    const categoryElement = tabElement.closest(".category");
    if (!categoryElement) return;

    const categoryName = categoryElement.dataset.category;

    // Store tab data for potential restoration
    const tabData = this.findTabInCategories(tabId);
    if (tabData) {
      // Store for potential restoration
      this._removedTabData = { tabId, tabData, categoryName };
    }

    // Remove from internal state
    this.removeTabFromState(tabId, categoryName);

    // Animate removal
    tabElement.style.transition = "all 0.3s ease";
    tabElement.style.opacity = "0";
    tabElement.style.transform = "translateX(-20px)";

    setTimeout(() => {
      if (tabElement.parentNode) {
        tabElement.remove();
        this.updateCategoryAfterTabRemoval(categoryName, categoryElement);
      }
    }, 300);
  }

  /**
   * Restore a tab in the UI if the close operation failed
   * @param {number} tabId - Tab ID to restore
   */
  restoreTabInUI(tabId) {
    if (!this._removedTabData || this._removedTabData.tabId !== tabId) {
      console.warn(`Cannot restore tab ${tabId} - no stored data found`);
      return;
    }

    const { tabData, categoryName } = this._removedTabData;

    // Restore to internal state
    if (!this.categorizedTabs[categoryName]) {
      this.categorizedTabs[categoryName] = [];
    }
    this.categorizedTabs[categoryName].push(tabData);

    // Find category element and restore tab
    const categoryElement = this.element.querySelector(
      `[data-category="${categoryName}"]`
    );
    if (categoryElement) {
      const tabList = categoryElement.querySelector(".tab-list");
      if (tabList) {
        const tabHtml = this.createTabElement(tabData);
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = tabHtml;
        const newTabElement = tempDiv.firstElementChild;

        // Add to DOM and animate in
        tabList.appendChild(newTabElement);
        this.animateTabAddition(newTabElement);

        this.updateCategoryHeaderCount(categoryName, categoryElement);
      }
    }

    // Clear stored data
    this._removedTabData = null;
  }

  /**
   * Animate category removal with consistent styling
   * @param {HTMLElement} categoryElement - Category DOM element
   * @param {Function} onComplete - Callback when animation completes
   */
  animateCategoryRemoval(categoryElement, onComplete) {
    categoryElement.style.transition = "all 0.4s ease";
    categoryElement.style.opacity = "0";
    categoryElement.style.transform = "translateX(-20px)";

    setTimeout(() => {
      if (onComplete) onComplete();
    }, 400);
  }

  /**
   * Animate category addition with consistent styling
   * @param {HTMLElement} categoryElement - Category DOM element
   */
  animateCategoryAddition(categoryElement) {
    // Set initial state
    categoryElement.style.opacity = "0";
    categoryElement.style.transform = "translateX(-20px)";
    categoryElement.style.transition = "all 0.4s ease";

    // Animate in
    setTimeout(() => {
      categoryElement.style.opacity = "1";
      categoryElement.style.transform = "translateX(0)";
    }, 50);
  }

  /**
   * Animate tab addition with consistent styling
   * @param {HTMLElement} tabElement - Tab DOM element
   */
  animateTabAddition(tabElement) {
    // Set initial state
    tabElement.style.opacity = "0";
    tabElement.style.transform = "translateX(-20px)";

    // Animate in
    setTimeout(() => {
      tabElement.style.transition = "all 0.3s ease";
      tabElement.style.opacity = "1";
      tabElement.style.transform = "translateX(0)";
    }, 50);
  }

  /**
   * Remove an entire category from the UI without full re-render (optimistic update)
   * @param {string} categoryName - Category name to remove
   * @param {Array} tabs - Category tabs (for potential restoration)
   */
  removeCategoryFromUI(categoryName, tabs) {
    const categoryElement = this.element.querySelector(
      `[data-category="${categoryName}"]`
    );
    if (!categoryElement) return;

    // Store category data for potential restoration
    this._removedCategoryData = {
      categoryName,
      tabs: [...tabs], // Create a copy
      wasExpanded: this.expandedCategories.has(categoryName),
    };

    // Remove from internal state
    delete this.categorizedTabs[categoryName];
    this.expandedCategories.delete(categoryName);

    // Use consistent category removal animation
    this.animateCategoryRemoval(categoryElement, () => {
      if (categoryElement.parentNode) {
        categoryElement.remove();

        // Check if we need to show empty state
        if (Object.keys(this.categorizedTabs).length === 0) {
          this.renderEmptyState();
        }
      }
    });
  }

  /**
   * Restore an entire category in the UI if the close operation failed
   * @param {string} categoryName - Category name to restore
   * @param {Array} tabs - Category tabs to restore
   */
  restoreCategoryInUI(categoryName, tabs) {
    if (
      !this._removedCategoryData ||
      this._removedCategoryData.categoryName !== categoryName
    ) {
      console.warn(
        `Cannot restore category ${categoryName} - no stored data found`
      );
      return;
    }

    const { wasExpanded } = this._removedCategoryData;

    // Restore to internal state
    this.categorizedTabs[categoryName] = [...tabs];
    if (wasExpanded) {
      this.expandedCategories.add(categoryName);
    }

    // If we're showing empty state, clear it
    if (this.element.querySelector(".empty-state")) {
      this.element.innerHTML = "";
    }

    // Create and insert the restored category element
    const categoryEl = this.createCategoryElement(categoryName, tabs);

    // Insert in correct position (categories are sorted by tab count)
    const existingCategories = Array.from(
      this.element.querySelectorAll(".category")
    );
    const insertIndex = this.findInsertionIndex(
      tabs.length,
      existingCategories
    );

    if (insertIndex < existingCategories.length) {
      this.element.insertBefore(categoryEl, existingCategories[insertIndex]);
    } else {
      this.element.appendChild(categoryEl);
    }

    // Use consistent category addition animation
    this.animateCategoryAddition(categoryEl);

    // Clear stored data
    this._removedCategoryData = null;
  }

  /**
   * Find the correct insertion index for a category based on tab count (descending order)
   * @param {number} tabCount - Number of tabs in the category to insert
   * @param {Array} existingCategories - Array of existing category elements
   * @returns {number} - Insertion index
   */
  findInsertionIndex(tabCount, existingCategories) {
    for (let i = 0; i < existingCategories.length; i++) {
      const categoryName = existingCategories[i].dataset.category;
      const existingTabCount =
        (this.categorizedTabs[categoryName] &&
          this.categorizedTabs[categoryName].length) ||
        0;

      if (tabCount > existingTabCount) {
        return i;
      }
    }
    return existingCategories.length;
  }

  /**
   * Find tab data in categories by ID
   * @param {number} tabId - Tab ID to find
   * @returns {Object|null} - Tab data or null if not found
   */
  findTabInCategories(tabId) {
    for (const [categoryName, tabs] of Object.entries(this.categorizedTabs)) {
      const tab = tabs.find((tab) => tab.id === tabId);
      if (tab) return tab;
    }
    return null;
  }

  /**
   * Remove tab from internal state
   * @param {number} tabId - Tab ID to remove
   * @param {string} categoryName - Category name
   */
  removeTabFromState(tabId, categoryName) {
    if (!this.categorizedTabs[categoryName]) return;

    this.categorizedTabs[categoryName] = this.categorizedTabs[
      categoryName
    ].filter((tab) => tab.id !== tabId);

    // Remove category if empty
    if (this.categorizedTabs[categoryName].length === 0) {
      delete this.categorizedTabs[categoryName];
    }
  }

  /**
   * Update category display after tab removal
   * @param {string} categoryName - Category name
   * @param {HTMLElement} categoryElement - Category DOM element
   */
  updateCategoryAfterTabRemoval(categoryName, categoryElement) {
    const remainingTabs = this.categorizedTabs[categoryName];

    if (!remainingTabs || remainingTabs.length === 0) {
      // Use consistent category removal animation (same as bulk closure)
      this.animateCategoryRemoval(categoryElement, () => {
        if (categoryElement.parentNode) {
          categoryElement.remove();

          // Check if we need to show empty state
          if (Object.keys(this.categorizedTabs).length === 0) {
            this.renderEmptyState();
          }
        }
      });
    } else {
      // Update category header count and duplicate counter
      this.updateCategoryHeaderCount(categoryName, categoryElement);

      // Update duplicate status of remaining tab elements in the DOM
      this.updateTabElementsDuplicateStatus(categoryName, categoryElement);

      // Update expanded height if category is expanded
      if (this.expandedCategories.has(categoryName)) {
        const content = categoryElement.querySelector(".category-content");
        if (content && content.classList.contains("expanded")) {
          const newHeight = this.calculateCategoryHeight(categoryName);
          content.style.maxHeight = `${newHeight}px`;
        }
      }
    }
  }

  /**
   * Update duplicate status of tab elements in the DOM
   * @param {string} categoryName - Category name
   * @param {HTMLElement} categoryElement - Category DOM element
   */
  updateTabElementsDuplicateStatus(categoryName, categoryElement) {
    const tabs = this.categorizedTabs[categoryName] || [];
    const tabElements = categoryElement.querySelectorAll(".tab-item");

    tabElements.forEach((tabElement) => {
      const tabId = parseInt(tabElement.dataset.tabId);
      const tab = tabs.find((t) => t.id === tabId);

      if (tab) {
        // Update tab element class and duplicate indicator
        if (tab.isDuplicate) {
          tabElement.classList.add("duplicate");
          // Add duplicate indicator if not present
          if (!tabElement.querySelector(".tab-duplicate")) {
            const actionsContainer = tabElement.querySelector(".tab-actions");
            const duplicateSpan = document.createElement("span");
            duplicateSpan.className = "tab-duplicate";
            duplicateSpan.title = "Duplicate tab";
            duplicateSpan.innerHTML = `
                            <svg width="12" height="12" max-width="12" max-height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L13.09 8.26L19 7L17.74 13.26L22 15L15.74 16.09L17 22L10.74 20.74L9 25L7.91 18.74L2 20L3.26 13.74L-1 12L5.26 10.91L4 5L10.26 6.26L12 2Z" fill="currentColor"/>
                            </svg>
                        `;
            actionsContainer.insertBefore(
              duplicateSpan,
              actionsContainer.querySelector(".tab-close-btn")
            );
          }
        } else {
          tabElement.classList.remove("duplicate");
          // Remove duplicate indicator if present
          const duplicateIndicator = tabElement.querySelector(".tab-duplicate");
          if (duplicateIndicator) {
            duplicateIndicator.remove();
          }
        }
      }
    });
  }

  /**
   * Update category header count display
   * @param {string} categoryName - Category name
   * @param {HTMLElement} categoryElement - Category DOM element
   */
  updateCategoryHeaderCount(categoryName, categoryElement) {
    const countElement = categoryElement.querySelector(".category-count");
    const tabs = this.categorizedTabs[categoryName] || [];

    if (countElement) {
      countElement.textContent = tabs.length.toString();
    }

    // Also update duplicate counter
    this.updateCategoryDuplicateCounter(categoryName, categoryElement);
  }

  /**
   * Update category duplicate counter display
   * @param {string} categoryName - Category name
   * @param {HTMLElement} categoryElement - Category DOM element
   */
  updateCategoryDuplicateCounter(categoryName, categoryElement) {
    const tabs = this.categorizedTabs[categoryName] || [];

    // Recalculate duplicate status for remaining tabs
    this.recalculateDuplicatesInCategory(categoryName);

    const duplicateCount = tabs.filter((tab) => tab.isDuplicate).length;
    const duplicateElement = categoryElement.querySelector(".tab-duplicate");
    const categoryTitleElement =
      categoryElement.querySelector(".category-title");

    if (duplicateCount > 0) {
      // Show or update duplicate counter
      if (!duplicateElement) {
        // Create new duplicate counter
        const duplicateSpan = document.createElement("span");
        duplicateSpan.className = "tab-duplicate";
        duplicateSpan.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L13.09 8.26L19 7L17.74 13.26L22 15L15.74 16.09L17 22L10.74 20.74L9 25L7.91 18.74L2 20L3.26 13.74L-1 12L5.26 10.91L4 5L10.26 6.26L12 2Z" fill="currentColor"/>
                    </svg>
                    ${duplicateCount}
                `;
        categoryTitleElement.appendChild(duplicateSpan);
      } else {
        // Update existing counter
        duplicateElement.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L13.09 8.26L19 7L17.74 13.26L22 15L15.74 16.09L17 22L10.74 20.74L9 25L7.91 18.74L2 20L3.26 13.74L-1 12L5.26 10.91L4 5L10.26 6.26L12 2Z" fill="currentColor"/>
                    </svg>
                    ${duplicateCount}
                `;
      }
    } else {
      // Remove duplicate counter if no duplicates remain
      if (duplicateElement) {
        duplicateElement.remove();
      }
    }
  }

  /**
   * Recalculate duplicate status for tabs in a specific category
   * @param {string} categoryName - Category name
   */
  recalculateDuplicatesInCategory(categoryName) {
    const tabs = this.categorizedTabs[categoryName] || [];

    // First, reset all isDuplicate flags
    tabs.forEach((tab) => {
      tab.isDuplicate = false;
    });

    // Recalculate duplicates using the same logic as the categorizer
    const urlMap = new Map();
    tabs.forEach((tab) => {
      const normalizedUrl = tabCategorizer.normalizeUrl(tab.url);

      if (urlMap.has(normalizedUrl)) {
        // This is a duplicate - mark it
        tab.isDuplicate = true;
        // Also mark the first occurrence as duplicate
        const firstOccurrence = tabs.find(
          (t) => t.id === urlMap.get(normalizedUrl)
        );
        if (firstOccurrence) {
          firstOccurrence.isDuplicate = true;
        }
      } else {
        // This is the first occurrence
        urlMap.set(normalizedUrl, tab.id);
      }
    });
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
        <div class="category-header" data-category="${categoryName}" ${
      color ? `data-category-color="${color}"` : ""
    }>
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
      header.style.setProperty("--category-color", color);
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
          ${
            tab.isDuplicate
              ? `<span class="tab-duplicate" title="Duplicate tab">
            <svg width="12" height="12" max-width="12" max-height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L19 7L17.74 13.26L22 15L15.74 16.09L17 22L10.74 20.74L9 25L7.91 18.74L2 20L3.26 13.74L-1 12L5.26 10.91L4 5L10.26 6.26L12 2Z" fill="currentColor"/>
            </svg>
          </span>`
              : ""
          }
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
        <button class="empty-refresh-btn" onclick="window.location.reload()">
          🔄 Manual Refresh
        </button>
        <p class="empty-hint">Tip: New tabs appear automatically with real-time updates!</p>
      </div>
    `;
  }

  /**
   * Show feedback message for a category
   * @param {string} categoryName - Category name
   * @param {string} message - Feedback message
   * @param {string} type - Feedback type ('success', 'warning', 'error', 'info')
   */
  showCategoryFeedback(categoryName, message, type = "info") {
    const categoryEl = this.element.querySelector(
      `[data-category="${categoryName}"]`
    );
    if (!categoryEl) return;

    // Remove any existing feedback
    const existingFeedback = categoryEl.querySelector(".category-feedback");
    if (existingFeedback) {
      existingFeedback.remove();
    }

    const feedback = document.createElement("div");
    feedback.className = `category-feedback ${type}`;
    feedback.textContent = message;

    categoryEl.appendChild(feedback);

    // Auto-remove after appropriate time based on type
    const timeout = type === "warning" || type === "error" ? 2000 : 1500;
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.remove();
      }
    }, timeout);
  }

  /**
   * Get appropriate favicon for a tab
   * @param {Object} tab - Tab object
   * @returns {string} - Favicon URL or data URL
   */
  getTabFavicon(tab) {
    const url = tab.url || "";

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
    const url = tab.url || "";
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
      "chrome://",
      "chrome-extension://",
      "edge://",
      "moz-extension://",
      "about:",
      "opera://",
      "vivaldi://",
      "brave://",
    ];

    return internalProtocols.some((protocol) => url.startsWith(protocol));
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
      "chrome://extensions/": "Extensions",
      "chrome://bookmarks/": "Bookmarks Manager",
      "chrome://history/": "History",
      "chrome://settings/": "Settings",
      "chrome://newtab/": "New Tab",
      "chrome://downloads/": "Downloads",
      "chrome://flags/": "Chrome Flags",
      "chrome://version/": "About Chrome",
      "chrome://inspect/": "DevTools",
      "chrome://chrome-urls/": "Chrome URLs",

      // Edge
      "edge://extensions/": "Extensions",
      "edge://settings/": "Settings",
      "edge://history/": "History",
      "edge://downloads/": "Downloads",
      "edge://newtab/": "New Tab",
      "edge://flags/": "Edge Flags",

      // Firefox
      "about:preferences": "Preferences",
      "about:addons": "Add-ons Manager",
      "about:downloads": "Downloads",
      "about:history": "History",
      "about:newtab": "New Tab",
      "about:blank": "Blank Page",

      // Opera/Vivaldi/Brave
      "opera://settings/": "Settings",
      "vivaldi://settings/": "Settings",
      "brave://settings/": "Settings",
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
      const pathParts = urlObj.pathname.split("/").filter((part) => part);
      if (pathParts.length > 0) {
        const lastPart = pathParts[pathParts.length - 1];
        return this.capitalizeFirstLetter(lastPart.replace(/[-_]/g, " "));
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
    // Create properly encoded SVG data URLs using URL encoding (safer than base64)
    const createSvgDataUrl = (color, letter) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="${color}"/><text x="8" y="12" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${letter}</text></svg>`;
      return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    };

    // Browser-specific favicons
    if (url.startsWith("chrome://")) {
      return createSvgDataUrl("#4285f4", "C");
    }

    if (url.startsWith("edge://")) {
      return createSvgDataUrl("#0078d4", "E");
    }

    if (url.startsWith("about:") || url.startsWith("moz-extension://")) {
      return createSvgDataUrl("#ff9500", "F");
    }

    if (url.startsWith("opera://")) {
      return createSvgDataUrl("#ff1b2d", "O");
    }

    if (url.startsWith("vivaldi://")) {
      return createSvgDataUrl("#ef3939", "V");
    }

    if (url.startsWith("brave://")) {
      return createSvgDataUrl("#fb542b", "B");
    }

    // Default browser icon for unknown internal pages
    return createSvgDataUrl("#666", "?");
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

    return title.substring(0, maxLength - 3) + "...";
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
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="#ddd" rx="2"/><circle cx="8" cy="8" r="2" fill="#999"/></svg>';
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  /**
   * Clean and escape HTML to prevent XSS while improving readability
   * @param {string} text - Text to clean and escape
   * @returns {string} - Cleaned and escaped text
   */
  escapeHtml(text) {
    if (!text || typeof text !== "string") {
      return "";
    }

    // Remove HTML tags and decode HTML entities for a cleaner display
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    const cleanText = tempDiv.textContent || tempDiv.innerText || "";

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
   * Get total tab count across all categories
   * @returns {number} - Total number of tabs
   */
  getTotalTabCount() {
    return Object.values(this.categorizedTabs).reduce(
      (total, tabs) => total + tabs.length,
      0
    );
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

      // Clear restoration data
      this._removedTabData = null;
      this._removedCategoryData = null;
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
