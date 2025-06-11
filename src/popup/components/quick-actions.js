// src/popup/components/quick-actions.js
// Quick Actions Component - Handles bulk tab operations

import { SHEPERD_EVENTS, SHEPERD_ACTIONS } from "../../utils/constants.js";
import { tabsManager } from "../../utils/tabs.js";
import { tabCategorizer } from "../../utils/categorizer.js";

/**
 * Quick Actions Component
 * Manages bulk operations like closing duplicates and old tabs
 */
export class QuickActionsComponent {
    constructor() {
        this.element = null;
        this.tabs = [];
        this.isLoading = false;

        this.init();
    }

    /**
     * Initialize the quick actions component
     */
    init() {
        this.createElement();
        this.bindEvents();
    }

    /**
     * Create the quick actions DOM structure
     */
    createElement() {
        this.element = document.createElement("div");
        this.element.className = "quick-actions";

        this.element.innerHTML = `
      <div class="quick-actions-header">
        <h3>🚀 Quick Actions</h3>
        <span class="quick-actions-subtitle">Bulk operations to manage your tabs</span>
      </div>
      <div class="quick-actions-buttons">
        <button id="close-duplicates" class="action-btn secondary" disabled>
          <span class="btn-icon">🔄</span>
          <span class="btn-text">Close Duplicates</span>
          <span class="btn-badge" id="duplicates-count">0</span>
        </button>
        <button id="close-old-tabs" class="action-btn secondary" disabled>
          <span class="btn-icon">⏰</span>
          <span class="btn-text">Close Old Tabs</span>
          <span class="btn-badge" id="old-tabs-count">0</span>
        </button>
        <button id="bookmark-all" class="action-btn secondary">
          <span class="btn-icon">📁</span>
          <span class="btn-text">Bookmark All</span>
          <span class="btn-badge" id="total-tabs-count">0</span>
        </button>
        <button id="close-all-except-active" class="action-btn danger">
          <span class="btn-icon">🎯</span>
          <span class="btn-text">Close All Except Active</span>
        </button>
      </div>
    `;

        // Cache button references
        this.buttons = {
            closeDuplicates: this.element.querySelector("#close-duplicates"),
            closeOldTabs: this.element.querySelector("#close-old-tabs"),
            bookmarkAll: this.element.querySelector("#bookmark-all"),
            closeAllExceptActive: this.element.querySelector(
                "#close-all-except-active"
            ),
        };

        // Cache badge references
        this.badges = {
            duplicates: this.element.querySelector("#duplicates-count"),
            oldTabs: this.element.querySelector("#old-tabs-count"),
            totalTabs: this.element.querySelector("#total-tabs-count"),
        };
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Button click handlers
        this.buttons.closeDuplicates.addEventListener("click", () => {
            this.handleAction(SHEPERD_ACTIONS.CLOSE_DUPLICATES);
        });

        this.buttons.closeOldTabs.addEventListener("click", () => {
            this.handleAction(SHEPERD_ACTIONS.CLOSE_OLD_TABS);
        });

        this.buttons.bookmarkAll.addEventListener("click", () => {
            this.handleAction("bookmark_all");
        });

        this.buttons.closeAllExceptActive.addEventListener("click", () => {
            this.handleAction("close_all_except_active");
        });

        // Bind real-time state management events
        this.bindRealTimeEvents();

        // Legacy TABS_UPDATED for backward compatibility
        document.addEventListener(SHEPERD_EVENTS.TABS_UPDATED, (event) => {
            const { action } = event.detail;
            if (action === "refresh") {
                this.updateButtons(event.detail);
            }
        });

        // Listen for loading state changes
        document.addEventListener(SHEPERD_EVENTS.LOADING_STARTED, () => {
            this.setLoadingState(true);
        });

        document.addEventListener(SHEPERD_EVENTS.LOADING_FINISHED, () => {
            this.setLoadingState(false);
        });
    }

    /**
     * Bind real-time state management events
     */
    bindRealTimeEvents() {
        // Listen for real-time state updates from main popup
        document.addEventListener(SHEPERD_EVENTS.QUICK_ACTIONS_UPDATED, (event) => {
            const { currentTabs, type } = event.detail;
            console.log(`🔄 Quick actions updating from main popup: ${type || 'state_update'}`);
            this.updateButtonsRealtime(currentTabs);
        });
    }

    /**
     * Update buttons in real-time without full recalculation
     * @param {Array} tabs - Current tabs array
     */
    async updateButtonsRealtime(tabs) {
        this.tabs = tabs || [];

        // Update total tabs count immediately
        this.badges.totalTabs.textContent = this.tabs.length;
        this.buttons.bookmarkAll.disabled = this.tabs.length === 0;

        // Update close all except active
        const inactiveTabs = this.tabs.filter((tab) => !tab.active);
        this.buttons.closeAllExceptActive.disabled = inactiveTabs.length === 0;

        // Calculate duplicates and old tabs (these are fast operations)
        const duplicateIds = tabCategorizer.findDuplicates(this.tabs);
        const duplicateCount = duplicateIds.length;
        this.badges.duplicates.textContent = duplicateCount;
        this.buttons.closeDuplicates.disabled = duplicateCount === 0;

        const oldTabs = await tabsManager.findOldTabs(this.tabs);
        const oldTabsCount = oldTabs.length;
        this.badges.oldTabs.textContent = oldTabsCount;
        this.buttons.closeOldTabs.disabled = oldTabsCount === 0;

        // Update button text with counts
        this.updateButtonText();
    }

    /**
     * Handle quick action execution
     * @param {string} action - Action type
     */
    async handleAction(action) {
        if (this.isLoading) return;

        try {
            this.dispatchEvent(SHEPERD_EVENTS.LOADING_STARTED, { action });

            switch (action) {
                case SHEPERD_ACTIONS.CLOSE_DUPLICATES:
                    await this.closeDuplicateTabs();
                    break;
                case SHEPERD_ACTIONS.CLOSE_OLD_TABS:
                    await this.closeOldTabs();
                    break;
                case "bookmark_all":
                    await this.bookmarkAllTabs();
                    break;
                case "close_all_except_active":
                    await this.closeAllExceptActive();
                    break;
                default:
                    console.warn("Unknown quick action:", action);
            }
        } catch (error) {
            console.error("Quick action failed:", error);
            this.dispatchEvent(SHEPERD_EVENTS.ERROR_OCCURRED, {
                error: error.message,
                action,
            });
        } finally {
            this.dispatchEvent(SHEPERD_EVENTS.LOADING_FINISHED);
        }
    }

    /**
     * Close duplicate tabs
     */
    async closeDuplicateTabs() {
        const duplicateIds = tabCategorizer.findDuplicates(this.tabs);

        if (duplicateIds.length === 0) {
            this.showFeedback("No duplicate tabs found! 🎉", "success");
            return;
        }

        // Generate unique operation ID
        const operationId = `duplicates_${Date.now()}`;
        const removedTabs = this.tabs.filter(tab => duplicateIds.includes(tab.id));

        // Show immediate feedback instead of confirm dialog
        this.showFeedback(`🗑️ Closing ${duplicateIds.length} duplicates...`, "warning");

        // Small delay to show feedback, then proceed optimistically
        setTimeout(async() => {
            // Dispatch optimistic bulk operation event
            this.dispatchEvent(SHEPERD_EVENTS.BULK_OPERATION_OPTIMISTIC, {
                operation: 'close_duplicates',
                removedTabs,
                operationId
            });

            try {
                await tabsManager.closeTabs(duplicateIds);
                await tabsManager.requestBadgeUpdate();

                this.showFeedback(
                    `✅ Closed ${duplicateIds.length} duplicate tabs!`,
                    "success"
                );

                // Dispatch confirmation event
                this.dispatchEvent(SHEPERD_EVENTS.BULK_OPERATION_CONFIRMED, {
                    operation: 'close_duplicates',
                    operationId
                });
            } catch (error) {
                this.showFeedback("❌ Failed to close duplicates", "error");
                console.error("Failed to close duplicates:", error);

                // Dispatch failure event
                this.dispatchEvent(SHEPERD_EVENTS.BULK_OPERATION_FAILED, {
                    operation: 'close_duplicates',
                    removedTabs,
                    operationId,
                    error: error.message
                });
            }
        }, 200);
    }

    /**
     * Close old tabs
     */
    async closeOldTabs() {
        const oldTabs = await tabsManager.findOldTabs(this.tabs);

        if (oldTabs.length === 0) {
            this.showFeedback(
                "No old tabs found! All tabs are recent. 👍",
                "success"
            );
            return;
        }

        // Generate unique operation ID
        const operationId = `old_tabs_${Date.now()}`;

        // Show immediate feedback instead of confirm dialog
        this.showFeedback(`🗑️ Closing ${oldTabs.length} old tabs...`, "warning");

        // Small delay to show feedback, then proceed optimistically
        setTimeout(async() => {
            // Dispatch optimistic bulk operation event
            this.dispatchEvent(SHEPERD_EVENTS.BULK_OPERATION_OPTIMISTIC, {
                operation: 'close_old_tabs',
                removedTabs: oldTabs,
                operationId
            });

            try {
                const oldTabIds = oldTabs.map((tab) => tab.id);
                await tabsManager.closeTabs(oldTabIds);
                await tabsManager.requestBadgeUpdate();

                this.showFeedback(`✅ Closed ${oldTabs.length} old tabs!`, "success");

                // Dispatch confirmation event
                this.dispatchEvent(SHEPERD_EVENTS.BULK_OPERATION_CONFIRMED, {
                    operation: 'close_old_tabs',
                    operationId
                });
            } catch (error) {
                this.showFeedback("❌ Failed to close old tabs", "error");
                console.error("Failed to close old tabs:", error);

                // Dispatch failure event
                this.dispatchEvent(SHEPERD_EVENTS.BULK_OPERATION_FAILED, {
                    operation: 'close_old_tabs',
                    removedTabs: oldTabs,
                    operationId,
                    error: error.message
                });
            }
        }, 200);
    }

    /**
     * Bookmark all tabs
     */
    async bookmarkAllTabs() {
        if (this.tabs.length === 0) {
            this.showFeedback("No tabs to bookmark!", "warning");
            return;
        }

        const confirmed = confirm(
            `Bookmark all ${this.tabs.length} tabs?\n\nThey will be saved to a "Sheperd - All Tabs" folder.`
        );

        if (!confirmed) return;

        const result = await tabsManager.bookmarkTabs(this.tabs, "All Tabs");

        if (result.success) {
            this.showFeedback(
                `📁 Bookmarked ${result.bookmarksCount} tabs!`,
                "success"
            );
        }
    }

    /**
     * Close all tabs except the active one
     */
    async closeAllExceptActive() {
        const activeTabs = this.tabs.filter((tab) => tab.active);
        const inactiveTabs = this.tabs.filter((tab) => !tab.active);

        if (inactiveTabs.length === 0) {
            this.showFeedback("Only one tab is open!", "info");
            return;
        }

        // Generate unique operation ID
        const operationId = `inactive_tabs_${Date.now()}`;

        // Show immediate feedback instead of blocking confirm dialog
        this.showFeedback(`🗑️ Closing ${inactiveTabs.length} inactive tabs...`, "warning");

        // Small delay to show feedback, then proceed
        setTimeout(async() => {
            // Dispatch optimistic bulk operation event
            this.dispatchEvent(SHEPERD_EVENTS.BULK_OPERATION_OPTIMISTIC, {
                operation: 'close_inactive_tabs',
                removedTabs: inactiveTabs,
                operationId
            });

            try {
                const inactiveTabIds = inactiveTabs.map((tab) => tab.id);
                await tabsManager.closeTabs(inactiveTabIds);
                await tabsManager.requestBadgeUpdate();

                this.showFeedback(`✅ Closed ${inactiveTabs.length} tabs!`, "success");

                // Dispatch confirmation event
                this.dispatchEvent(SHEPERD_EVENTS.BULK_OPERATION_CONFIRMED, {
                    operation: 'close_inactive_tabs',
                    operationId
                });
            } catch (error) {
                this.showFeedback("❌ Failed to close inactive tabs", "error");
                console.error("Failed to close inactive tabs:", error);

                // Dispatch failure event
                this.dispatchEvent(SHEPERD_EVENTS.BULK_OPERATION_FAILED, {
                    operation: 'close_inactive_tabs',
                    removedTabs: inactiveTabs,
                    operationId,
                    error: error.message
                });
            }
        }, 200);
    }

    /**
     * Update button states based on current tabs
     * @param {Object} data - Tab data
     */
    async updateButtons(data) {
        this.tabs = data.tabs || [];

        // Update duplicate count
        const duplicateIds = tabCategorizer.findDuplicates(this.tabs);
        const duplicateCount = duplicateIds.length;
        this.badges.duplicates.textContent = duplicateCount;
        this.buttons.closeDuplicates.disabled = duplicateCount === 0;

        // Update old tabs count
        const oldTabs = await tabsManager.findOldTabs(this.tabs);
        const oldTabsCount = oldTabs.length;
        this.badges.oldTabs.textContent = oldTabsCount;
        this.buttons.closeOldTabs.disabled = oldTabsCount === 0;

        // Update total tabs count
        this.badges.totalTabs.textContent = this.tabs.length;
        this.buttons.bookmarkAll.disabled = this.tabs.length === 0;

        // Update close all except active
        const inactiveTabs = this.tabs.filter((tab) => !tab.active);
        this.buttons.closeAllExceptActive.disabled = inactiveTabs.length === 0;

        // Update button text with counts
        this.updateButtonText();
    }

    /**
     * Update button text with dynamic counts
     */
    updateButtonText() {
        const duplicateCount = parseInt(this.badges.duplicates.textContent);
        const oldTabsCount = parseInt(this.badges.oldTabs.textContent);

        // Update button text based on counts
        if (duplicateCount > 0) {
            this.buttons.closeDuplicates.querySelector(
                ".btn-text"
            ).textContent = `Close ${duplicateCount} Duplicates`;
        } else {
            this.buttons.closeDuplicates.querySelector(".btn-text").textContent =
                "No Duplicates";
        }

        if (oldTabsCount > 0) {
            this.buttons.closeOldTabs.querySelector(
                ".btn-text"
            ).textContent = `Close ${oldTabsCount} Old Tabs`;
        } else {
            this.buttons.closeOldTabs.querySelector(".btn-text").textContent =
                "No Old Tabs";
        }
    }

    /**
     * Set loading state for buttons
     * @param {boolean} loading - Loading state
     */
    setLoadingState(loading) {
        this.isLoading = loading;

        Object.values(this.buttons).forEach((button) => {
            if (loading) {
                button.disabled = true;
                button.classList.add("loading");
            } else {
                button.classList.remove("loading");
                // Re-enable based on actual state
                this.updateButtons({ tabs: this.tabs });
            }
        });
    }

    /**
     * Show feedback message
     * @param {string} message - Feedback message
     * @param {string} type - Feedback type (success, warning, error, info)
     */
    showFeedback(message, type = "info") {
        const feedback = document.createElement("div");
        feedback.className = `quick-actions-feedback ${type}`;
        feedback.textContent = message;

        this.element.appendChild(feedback);

        // Animate in
        setTimeout(() => feedback.classList.add("show"), 10);

        // Remove after delay
        setTimeout(() => {
            feedback.classList.remove("show");
            setTimeout(() => feedback.remove(), 300);
        }, 3000);
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
     * Render the component to a target container
     * @param {HTMLElement} container - Target container element
     */
    render(container) {
        if (!container || !(container instanceof HTMLElement)) {
            throw new Error(
                "Valid container element required for quick actions rendering"
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
        if (state.tabs) {
            this.updateButtons({ tabs: state.tabs });
        }
    }

    /**
     * Destroy the component and clean up
     */
    destroy() {
        if (this.element) {
            this.element.remove();
            this.element = null;
            this.buttons = {};
            this.badges = {};
            this.tabs = [];
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
export const quickActionsComponent = new QuickActionsComponent();