// src/popup/popup.js
// Main Popup Application - Orchestrates all components

import { SHEPERD_EVENTS } from "../utils/constants.js";
import { tabsManager } from "../utils/tabs.js";
import { tabCategorizer } from "../utils/categorizer.js";

import { headerComponent } from "./components/header.js";
import { sheperdMeterComponent } from "./components/sheperd-meter.js";
import { analyticsComponent } from "./components/analytics.js";
import { categoriesComponent } from "./components/categories.js";
import { quickActionsComponent } from "./components/quick-actions.js";

/**
 * Main Sheperd Popup Application
 * Orchestrates all components and manages application state
 */
class SheperdPopupApp {
    constructor() {
        this.isInitialized = false;
        this.isLoading = false;
        this.currentTabs = [];
        this.categorizedTabs = {};

        // Real-time state management
        this.stateHistory = []; // For rollback functionality
        this.operationQueue = new Map(); // Track pending operations

        // Component references
        this.components = {
            header: headerComponent,
            sheperdMeter: sheperdMeterComponent,
            analytics: analyticsComponent,
            categories: categoriesComponent,
            quickActions: quickActionsComponent,
        };

        // UI elements
        this.loadingElement = null;
        this.errorElement = null;
        this.footerElement = null;
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.isInitialized) return;

        try {
            console.log("🐑 Initializing Sheperd Popup...");

            this.showLoading(true, "Loading your tabs...");

            // Setup UI structure
            await this.setupUI();

            // Bind global events
            this.bindEvents();

            // Load and categorize tabs
            await this.loadTabs();

            // Render all components
            this.renderComponents();

            // Mark as initialized
            this.isInitialized = true;

            console.log("✅ Sheperd Popup initialized successfully");
        } catch (error) {
            console.error("❌ Failed to initialize Sheperd Popup:", error);
            this.showError("Failed to load Sheperd. Please try again.");
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Setup the basic UI structure
     */
    async setupUI() {
        // Get the document body (popup container)
        const body = document.body;

        // Clear any existing content
        body.innerHTML = "";

        // Create main container
        const mainContainer = document.createElement("div");
        mainContainer.className = "sheperd-popup";

        // Create footer
        this.createFooter();

        // Create loading overlay
        this.createLoadingOverlay();

        // Create error container
        this.createErrorContainer();

        // Append to body
        body.appendChild(mainContainer);
        body.appendChild(this.footerElement);
        body.appendChild(this.loadingElement);
        body.appendChild(this.errorElement);
    }

    /**
     * Create footer with settings and upgrade buttons
     */
    createFooter() {
        this.footerElement = document.createElement("div");
        this.footerElement.className = "footer";

        this.footerElement.innerHTML = `
      <button id="settings-btn" class="text-btn" title="Open settings">
        ⚙️ Settings
      </button>
      <button id="upgrade-btn" class="text-btn premium" title="Upgrade to Pro">
        ✨ Upgrade
      </button>
      <div class="footer-info">
        <span class="version">v1.0.0</span>
        <span class="separator">•</span>
        <span class="branding">Sheperd</span>
      </div>
    `;
    }

    /**
     * Create loading overlay
     */
    createLoadingOverlay() {
        this.loadingElement = document.createElement("div");
        this.loadingElement.className = "loading hidden";
        this.loadingElement.id = "loading";

        this.loadingElement.innerHTML = `
      <div class="loading-content">
        <div class="spinner"></div>
        <p class="loading-message">Loading...</p>
      </div>
    `;
    }

    /**
     * Create error container
     */
    createErrorContainer() {
        this.errorElement = document.createElement("div");
        this.errorElement.className = "error-container hidden";
        this.errorElement.id = "error-container";

        this.errorElement.innerHTML = `
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">Something went wrong</h3>
        <p class="error-message">Please try again</p>
        <button class="error-retry-btn">🔄 Retry</button>
      </div>
    `;
    }

    /**
     * Bind global event listeners
     */
    bindEvents() {
        // Footer button events
        document.getElementById("settings-btn").addEventListener("click", () => {
            this.openSettings();
        });

        document.getElementById("upgrade-btn").addEventListener("click", () => {
            this.openUpgrade();
        });

        // Error retry button
        this.errorElement
            .querySelector(".error-retry-btn")
            .addEventListener("click", () => {
                this.retry();
            });

        // Global error handler
        document.addEventListener(SHEPERD_EVENTS.ERROR_OCCURRED, (event) => {
            this.handleError(event.detail);
        });

        // Loading state handlers
        document.addEventListener(SHEPERD_EVENTS.LOADING_STARTED, (event) => {
            this.showLoading(true, event.detail.message);
        });

        document.addEventListener(SHEPERD_EVENTS.LOADING_FINISHED, () => {
            this.showLoading(false);
        });

        // Real-time state management event handlers
        this.bindRealTimeEvents();

        // Performance optimization handler
        document.addEventListener(
            SHEPERD_EVENTS.OPTIMIZE_PERFORMANCE,
            async(event) => {
                await this.handlePerformanceOptimization(event.detail);
            }
        );

        // Keyboard shortcuts
        document.addEventListener("keydown", (event) => {
            this.handleKeyboardShortcuts(event);
        });

        // Set up real-time tab change listener
        this.setupRealTimeUpdates();

        // Auto-refresh tabs periodically (as backup for empty state and missed events)
        this.startAutoRefresh();
    }

    /**
     * Bind comprehensive real-time event handlers for state management
     */
    bindRealTimeEvents() {
        // DISABLED: Legacy TABS_UPDATED - This was causing infinite loops!
        // The loadTabs() method dispatches TABS_UPDATED with action "refresh"
        // Which then triggers this listener to call loadTabs() again = INFINITE LOOP!
        console.log("🚫 Legacy TABS_UPDATED event handler DISABLED - was causing infinite loops");

        /* DISABLED INFINITE LOOP CODE:
        document.addEventListener(SHEPERD_EVENTS.TABS_UPDATED, async(event) => {
            const { action } = event.detail;
            if (action === "refresh" || action === "restore_failed") {
                await this.loadTabs(); // <-- This creates infinite loop!
            }
        });
        */

        // Tab removal events
        document.addEventListener(SHEPERD_EVENTS.TAB_REMOVED_OPTIMISTIC, (event) => {
            this.handleTabRemovedOptimistic(event.detail);
        });

        document.addEventListener(SHEPERD_EVENTS.TAB_REMOVAL_CONFIRMED, (event) => {
            this.handleTabRemovalConfirmed(event.detail);
        });

        document.addEventListener(SHEPERD_EVENTS.TAB_REMOVAL_FAILED, (event) => {
            this.handleTabRemovalFailed(event.detail);
        });

        // Category removal events
        document.addEventListener(SHEPERD_EVENTS.CATEGORY_REMOVED_OPTIMISTIC, (event) => {
            this.handleCategoryRemovedOptimistic(event.detail);
        });

        document.addEventListener(SHEPERD_EVENTS.CATEGORY_REMOVAL_CONFIRMED, (event) => {
            this.handleCategoryRemovalConfirmed(event.detail);
        });

        document.addEventListener(SHEPERD_EVENTS.CATEGORY_REMOVAL_FAILED, (event) => {
            this.handleCategoryRemovalFailed(event.detail);
        });

        // Bulk operation events
        document.addEventListener(SHEPERD_EVENTS.BULK_OPERATION_OPTIMISTIC, (event) => {
            this.handleBulkOperationOptimistic(event.detail);
        });

        document.addEventListener(SHEPERD_EVENTS.BULK_OPERATION_CONFIRMED, (event) => {
            this.handleBulkOperationConfirmed(event.detail);
        });

        document.addEventListener(SHEPERD_EVENTS.BULK_OPERATION_FAILED, (event) => {
            this.handleBulkOperationFailed(event.detail);
        });
    }

    /**
     * Handle optimistic tab removal - update all component states immediately
     */
    handleTabRemovedOptimistic({ tabId, categoryName, operationId }) {
        // Save current state for potential rollback
        this.saveStateSnapshot(operationId);

        // Remove tab from main app state
        this.removeTabFromState(tabId, categoryName);

        // Dispatch updates only to components that need tab count updates (not categories)
        this.dispatchRealTimeUpdates({
            type: 'tab_removed',
            tabId,
            categoryName,
            operationId,
            components: ['header', 'sheperd-meter', 'analytics', 'quick-actions'] // Categories handle their own optimistic updates
        });
    }

    /**
     * Handle confirmed tab removal - mark operation complete
     */
    handleTabRemovalConfirmed({ tabId, operationId }) {
        // Remove from operation queue
        this.operationQueue.delete(operationId);
        console.log(`✅ Tab ${tabId} removal confirmed`);
    }

    /**
     * Handle failed tab removal - restore state across all components
     */
    handleTabRemovalFailed({ tabId, categoryName, operationId }) {
        console.warn(`❌ Tab ${tabId} removal failed, restoring state`);

        // Restore from snapshot
        this.restoreStateSnapshot(operationId);

        // Dispatch restoration updates (categories component needs this for full rebuild)
        this.dispatchRealTimeUpdates({
            type: 'tab_restored',
            tabId,
            categoryName,
            operationId,
            components: ['categories', 'header', 'sheperd-meter', 'analytics', 'quick-actions'] // Categories need restoration events
        });
    }

    /**
     * Handle optimistic category removal - update all component states
     */
    handleCategoryRemovedOptimistic({ categoryName, tabs, operationId }) {
        // Save current state for potential rollback
        this.saveStateSnapshot(operationId);

        // Remove category from main app state
        this.removeCategoryFromState(categoryName);

        // Dispatch updates only to components that need tab count updates (not categories)
        this.dispatchRealTimeUpdates({
            type: 'category_removed',
            categoryName,
            tabs,
            operationId,
            components: ['header', 'sheperd-meter', 'analytics', 'quick-actions'] // Categories handle their own optimistic updates
        });
    }

    /**
     * Handle confirmed category removal
     */
    handleCategoryRemovalConfirmed({ categoryName, operationId }) {
        this.operationQueue.delete(operationId);
        console.log(`✅ Category "${categoryName}" removal confirmed`);
    }

    /**
     * Handle failed category removal - restore state
     */
    handleCategoryRemovalFailed({ categoryName, tabs, operationId }) {
        console.warn(`❌ Category "${categoryName}" removal failed, restoring state`);

        // Restore from snapshot
        this.restoreStateSnapshot(operationId);

        // Dispatch restoration updates (categories component needs this for full rebuild)
        this.dispatchRealTimeUpdates({
            type: 'category_restored',
            categoryName,
            tabs,
            operationId,
            components: ['categories', 'header', 'sheperd-meter', 'analytics', 'quick-actions'] // Categories need restoration events
        });
    }

    /**
     * Handle optimistic bulk operations (duplicates, old tabs, etc.)
     */
    handleBulkOperationOptimistic({ operation, removedTabs, operationId }) {
        // Save current state for potential rollback
        this.saveStateSnapshot(operationId);

        // Remove tabs from main app state
        removedTabs.forEach(tab => {
            const categoryName = this.findTabCategory(tab.id);
            if (categoryName) {
                this.removeTabFromState(tab.id, categoryName);
            }
        });

        // Dispatch updates only to components that need tab count updates (not categories)
        this.dispatchRealTimeUpdates({
            type: 'bulk_operation',
            operation,
            removedTabs,
            operationId,
            components: ['header', 'sheperd-meter', 'analytics', 'quick-actions'] // Categories handle their own optimistic updates
        });
    }

    /**
     * Handle confirmed bulk operation
     */
    handleBulkOperationConfirmed({ operation, operationId }) {
        this.operationQueue.delete(operationId);
        console.log(`✅ Bulk operation "${operation}" confirmed`);
    }

    /**
     * Handle failed bulk operation - restore state
     */
    handleBulkOperationFailed({ operation, removedTabs, operationId }) {
        console.warn(`❌ Bulk operation "${operation}" failed, restoring state`);

        // Restore from snapshot
        this.restoreStateSnapshot(operationId);

        // Dispatch restoration updates (categories component needs this for full rebuild)
        this.dispatchRealTimeUpdates({
            type: 'bulk_operation_restored',
            operation,
            removedTabs,
            operationId,
            components: ['categories', 'header', 'sheperd-meter', 'analytics', 'quick-actions'] // Categories need restoration events
        });
    }

    /**
     * Remove tab from internal app state
     */
    removeTabFromState(tabId, categoryName) {
        // Remove from currentTabs
        this.currentTabs = this.currentTabs.filter(tab => tab.id !== tabId);

        // Remove from categorizedTabs
        if (this.categorizedTabs[categoryName]) {
            this.categorizedTabs[categoryName] = this.categorizedTabs[categoryName]
                .filter(tab => tab.id !== tabId);

            // Remove empty categories
            if (this.categorizedTabs[categoryName].length === 0) {
                delete this.categorizedTabs[categoryName];
            }
        }
    }

    /**
     * Remove entire category from internal app state
     */
    removeCategoryFromState(categoryName) {
        if (this.categorizedTabs[categoryName]) {
            const tabsToRemove = this.categorizedTabs[categoryName];

            // Remove tabs from currentTabs
            const tabIds = tabsToRemove.map(tab => tab.id);
            this.currentTabs = this.currentTabs.filter(tab => !tabIds.includes(tab.id));

            // Remove category
            delete this.categorizedTabs[categoryName];
        }
    }

    /**
     * Find which category a tab belongs to
     */
    findTabCategory(tabId) {
        for (const [categoryName, tabs] of Object.entries(this.categorizedTabs)) {
            if (tabs.some(tab => tab.id === tabId)) {
                return categoryName;
            }
        }
        return null;
    }

    /**
     * Save state snapshot for rollback functionality
     */
    saveStateSnapshot(operationId) {
        const snapshot = {
            operationId,
            timestamp: Date.now(),
            currentTabs: [...this.currentTabs],
            categorizedTabs: JSON.parse(JSON.stringify(this.categorizedTabs))
        };

        this.stateHistory.push(snapshot);
        this.operationQueue.set(operationId, snapshot);

        // Keep only last 10 snapshots
        if (this.stateHistory.length > 10) {
            this.stateHistory.shift();
        }
    }

    /**
     * Restore state from snapshot
     */
    restoreStateSnapshot(operationId) {
        const snapshot = this.operationQueue.get(operationId);
        if (snapshot) {
            this.currentTabs = [...snapshot.currentTabs];
            this.categorizedTabs = JSON.parse(JSON.stringify(snapshot.categorizedTabs));
            this.operationQueue.delete(operationId);
            return true;
        }
        return false;
    }

    /**
     * Dispatch real-time updates to specific components only when needed
     */
    dispatchRealTimeUpdates({ type, components = [], ...data }) {
        const updateData = {
            type,
            currentTabs: this.currentTabs,
            categorizedTabs: this.categorizedTabs,
            totalCount: this.currentTabs.length,
            categoryCount: Object.keys(this.categorizedTabs).length,
            ...data
        };

        // Only dispatch STATE_UPDATED for categories component (for restoration events)
        if (components.includes('categories') || components.length === 0) {
            document.dispatchEvent(new CustomEvent(SHEPERD_EVENTS.STATE_UPDATED, {
                detail: updateData
            }));
        }

        // Only dispatch specific component events when explicitly requested
        if (components.includes('counters')) {
            document.dispatchEvent(new CustomEvent(SHEPERD_EVENTS.COUNTERS_UPDATED, {
                detail: updateData
            }));
        }

        if (components.includes('analytics')) {
            document.dispatchEvent(new CustomEvent(SHEPERD_EVENTS.ANALYTICS_UPDATED, {
                detail: updateData
            }));
        }

        if (components.includes('header')) {
            document.dispatchEvent(new CustomEvent(SHEPERD_EVENTS.HEADER_UPDATED, {
                detail: updateData
            }));
        }

        if (components.includes('quick-actions')) {
            document.dispatchEvent(new CustomEvent(SHEPERD_EVENTS.QUICK_ACTIONS_UPDATED, {
                detail: updateData
            }));
        }

        if (components.includes('sheperd-meter')) {
            document.dispatchEvent(new CustomEvent(SHEPERD_EVENTS.SHEPERD_METER_UPDATED, {
                detail: updateData
            }));
        }

        console.log(`🎯 Dispatched real-time updates for: ${components.length ? components.join(', ') : 'categories only'}`);
    }

    /**
     * Load and categorize all tabs
     */
    async loadTabs() {
        try {
            // Get all tabs
            this.currentTabs = await tabsManager.getAllTabs();

            // Categorize tabs
            this.categorizedTabs = tabCategorizer.categorizeTabs(this.currentTabs);

            // Dispatch update event
            this.dispatchEvent(SHEPERD_EVENTS.TABS_UPDATED, {
                tabs: this.currentTabs,
                categorizedTabs: this.categorizedTabs,
                count: this.currentTabs.length,
                action: "refresh",
            });

            console.log(
                `📊 Loaded ${this.currentTabs.length} tabs in ${
          Object.keys(this.categorizedTabs).length
        } categories`
            );
        } catch (error) {
            console.error("Failed to load tabs:", error);
            throw new Error(`Failed to load tabs: ${error.message}`);
        }
    }

    /**
     * Render all components to the main container
     */
    renderComponents() {
        const mainContainer = document.querySelector(".sheperd-popup");
        if (!mainContainer) return;

        // Clear existing content
        mainContainer.innerHTML = "";

        // Render components in order
        this.components.header.render(mainContainer);
        this.components.sheperdMeter.render(mainContainer);
        this.components.categories.render(mainContainer);
        this.components.analytics.render(mainContainer);
        this.components.quickActions.render(mainContainer);
    }

    /**
     * Show/hide loading overlay
     * @param {boolean} show - Show loading
     * @param {string} message - Loading message
     */
    showLoading(show, message = "Loading...") {
        if (!this.loadingElement) return;

        this.isLoading = show;

        if (show) {
            this.loadingElement.querySelector(".loading-message").textContent =
                message;
            this.loadingElement.classList.remove("hidden");
        } else {
            this.loadingElement.classList.add("hidden");
        }
    }

    /**
     * Show error state
     * @param {string} message - Error message
     */
    showError(message) {
        if (!this.errorElement) return;

        this.errorElement.querySelector(".error-message").textContent = message;
        this.errorElement.classList.remove("hidden");
        this.showLoading(false);
    }

    /**
     * Hide error state
     */
    hideError() {
        if (!this.errorElement) return;
        this.errorElement.classList.add("hidden");
    }

    /**
     * Handle application errors
     * @param {Object} errorData - Error information
     */
    handleError(errorData) {
        console.error("Application error:", errorData);

        let message = "An unexpected error occurred";

        if (errorData.error) {
            message = errorData.error;
        } else if (errorData.action) {
            message = `Failed to ${errorData.action.replace("_", " ")}`;
        }

        this.showError(message);
    }

    /**
     * Retry initialization
     */
    async retry() {
        this.hideError();
        this.isInitialized = false;
        await this.init();
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyboardShortcuts(event) {
        // Escape key - close popup
        if (event.key === "Escape") {
            window.close();
        }

        // Ctrl/Cmd + R - refresh
        if ((event.ctrlKey || event.metaKey) && event.key === "r") {
            event.preventDefault();
            this.loadTabs();
        }

        // Ctrl/Cmd + D - close duplicates
        if ((event.ctrlKey || event.metaKey) && event.key === "d") {
            event.preventDefault();
            document.getElementById("close-duplicates").click();
        }
    }

    /**
     * Set up real-time tab change updates
     * TEMPORARILY DISABLED - Testing if background script events are causing issues
     */
    setupRealTimeUpdates() {
        // DISABLED: Background script event listener temporarily disabled for debugging
        console.log("🚫 Background script events DISABLED for testing - no more external events");

        // If this fixes the constant refreshing, we know background script events are the problem
        // TODO: Re-enable with proper filtering once issue is identified

        /* DISABLED CODE:
        const api = typeof browser !== "undefined" && browser.runtime ? browser : chrome;
        api.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'TAB_CHANGE') {
                this.handleRealTimeTabChange(message.eventType, message.data);
                sendResponse({ success: true });
                return true;
            }
            if (message.action === "tab_change_notification") {
                this.handleRealTimeTabChange(message.eventType, message.data);
                sendResponse({ success: true });
                return true;
            }
        });
        */
    }

    /**
     * Handle real-time tab changes from background script
     * @param {string} eventType - Type of tab change
     * @param {Object} data - Event data
     */
    async handleRealTimeTabChange(eventType, data) {
        if (!this.isInitialized || this.isLoading) return;

        // ALL TAB CHANGES NOW HANDLED VIA OPTIMISTIC REAL-TIME EVENTS
        // No more loadTabs() calls from background script events!
        console.log(`🚀 Real-time event '${eventType}' - handled optimistically, no refresh needed`);

        // For debugging: Log tab events without refreshing
        if ((data && data.tabId) || (data && data.tabIds)) {
            console.log(`📊 Tab event data:`, data);
        }

        // Special case: For new tab creation when we have empty state, 
        // we can trigger a single refresh as a safety net
        if (eventType === "tab_created" && Object.keys(this.categorizedTabs).length === 0) {
            console.log("🔄 Empty state detected with new tab - safety refresh");
            try {
                await this.loadTabs();
            } catch (error) {
                console.warn("Safety refresh failed:", error);
            }
        }
    }

    /**
     * Start auto-refresh of tab data (backup mechanism)
     * DISABLED FOR REAL-TIME MODE - No more auto-refreshing!
     */
    startAutoRefresh() {
        // Auto-refresh is DISABLED in real-time mode
        // All updates now happen via optimistic real-time events
        console.log("🚀 Auto-refresh disabled - using real-time events only");

        // Optional: Only refresh if extension has been open for more than 5 minutes without any activity
        // This is just a safety net for edge cases
        setTimeout(() => {
            if (!this.isLoading && this.isInitialized && Object.keys(this.categorizedTabs).length === 0) {
                console.log("🔄 Safety refresh after 5 minutes with no tabs");
                this.loadTabs();
            }
        }, 5 * 60 * 1000); // 5 minutes safety check
    }

    /**
     * Handle performance optimization requests
     * @param {Object} optimizationData - Optimization request data
     */
    async handlePerformanceOptimization(optimizationData) {
        try {
            console.log("🔥 Performing tab optimization:", optimizationData);

            this.showLoading(true, "Optimizing performance...");

            // Get all tabs for analysis
            const allTabs = await tabsManager.getAllTabs();

            // Identify tabs to optimize based on heavy domains and loaded state
            const heavyDomains = new Set([
                "youtube.com",
                "netflix.com",
                "figma.com",
                "canva.com",
                "docs.google.com",
                "sheets.google.com",
                "slides.google.com",
                "facebook.com",
                "instagram.com",
                "twitter.com",
                "x.com",
                "discord.com",
                "twitch.tv",
                "spotify.com",
                "soundcloud.com",
                "github.com",
                "gitlab.com",
                "codesandbox.io",
                "replit.com",
            ]);

            // Find tabs to optimize
            const tabsToOptimize = allTabs
                .filter((tab) => {
                    if (tab.active) return false; // Don't close active tab

                    const url = new URL(tab.url || "");
                    const isHeavyDomain = heavyDomains.has(url.hostname);
                    const isOldTab =
                        Date.now() - (tab.lastAccessed || Date.now()) > 24 * 60 * 60 * 1000; // 24h

                    return isHeavyDomain || isOldTab;
                })
                .slice(0, 10); // Limit to 10 tabs for safety

            if (tabsToOptimize.length === 0) {
                this.showLoading(false);
                return;
            }

            // Generate unique operation ID for bulk optimization
            const operationId = `performance_optimization_${Date.now()}`;

            // Dispatch optimistic bulk operation event
            this.dispatchEvent(SHEPERD_EVENTS.BULK_OPERATION_OPTIMISTIC, {
                operation: 'performance_optimization',
                removedTabs: tabsToOptimize,
                operationId
            });

            // Close optimization candidate tabs
            const tabIds = tabsToOptimize.map((tab) => tab.id);
            await tabsManager.closeTabs(tabIds);

            // Dispatch confirmation event instead of refreshing
            this.dispatchEvent(SHEPERD_EVENTS.BULK_OPERATION_CONFIRMED, {
                operation: 'performance_optimization',
                operationId
            });

            // Show success message
            console.log(
                `✅ Optimized performance by closing ${tabsToOptimize.length} tabs - no refresh needed!`
            );
        } catch (error) {
            console.error("❌ Performance optimization failed:", error);
            this.handleError({
                action: "optimize_performance",
                error: "Failed to optimize performance",
            });
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Open settings
     */
    openSettings() {
        // For now, just show a message
        // In Phase 2, this would open a settings page
        alert(
            "Settings coming in Sheperd Pro! ⚙️\n\nUpgrade to access advanced customization options."
        );
    }

    /**
     * Open upgrade page
     */
    openUpgrade() {
        // Open upgrade page (would be actual URL in production)
        const upgradeUrl = "https://Sheperd-tabs.com/upgrade";
        const api =
            typeof browser !== "undefined" && browser.runtime ? browser : chrome;
        api.tabs.create({ url: upgradeUrl });
        window.close();
    }

    /**
     * Get application statistics
     * @returns {Object} - App statistics
     */
    getStatistics() {
        return {
            totalTabs: this.currentTabs.length,
            totalCategories: Object.keys(this.categorizedTabs).length,
            duplicates: tabCategorizer.findDuplicates(this.currentTabs).length,
            isInitialized: this.isInitialized,
            isLoading: this.isLoading,
        };
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
     * Destroy the application and clean up
     */
    destroy() {
        // Destroy all components
        Object.values(this.components).forEach((component) => {
            if (component.destroy) {
                component.destroy();
            }
        });

        // Clear references
        this.components = {};
        this.currentTabs = [];
        this.categorizedTabs = {};
        this.isInitialized = false;
    }
}

// Create and initialize the application when DOM is ready
let SheperdApp = null;

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", async() => {
        SheperdApp = new SheperdPopupApp();
        await SheperdApp.init();
    });
} else {
    // DOM is already ready
    SheperdApp = new SheperdPopupApp();
    SheperdApp.init();
}

// Export for debugging/testing
if (typeof window !== "undefined") {
    window.SheperdApp = SheperdApp;
}

export default SheperdPopupApp;