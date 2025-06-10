// src/popup/popup.js
// Main Popup Application - Orchestrates all components

import { SHEPERD_EVENTS, Sheperd_CONFIG } from "../utils/constants.js";
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

        // Tab update handler
        document.addEventListener(SHEPERD_EVENTS.TABS_UPDATED, async(event) => {
            if (event.detail.action !== "refresh") {
                await this.loadTabs(); // Refresh data after tab operations
            }
        });

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

        // Auto-refresh tabs periodically (as backup)
        // this.startAutoRefresh();
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
     */
    setupRealTimeUpdates() {
        // Listen for messages from background script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'tab_change_notification') {
                this.handleRealTimeTabChange(message.eventType, message.data);
                sendResponse({ success: true });
            }
        });
    }

    /**
     * Handle real-time tab changes from background script
     * @param {string} eventType - Type of tab change
     * @param {Object} data - Event data
     */
    async handleRealTimeTabChange(eventType, data) {
        if (!this.isInitialized || this.isLoading) return;

        try {
            console.log(`🔄 Real-time tab change: ${eventType}`, data);

            // Preserve expanded categories state
            const expandedCategories = this.components.categories.getExpandedCategories();

            // Refresh tab data immediately
            await this.loadTabs();

            // Restore expanded categories state after update
            this.components.categories.setExpandedCategories(expandedCategories);
        } catch (error) {
            console.warn("Real-time update failed:", error);
        }
    }

    /**
     * Start auto-refresh of tab data (backup mechanism)
     */
    startAutoRefresh() {
        // Refresh every 5 minutes as backup (real-time should handle most cases)
        setInterval(async() => {
            if (!this.isLoading && this.isInitialized) {
                try {
                    await this.loadTabs();
                } catch (error) {
                    console.warn("Auto-refresh failed:", error);
                }
            }
        }, 300000); // 5 minutes instead of 30 seconds
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

            // Close optimization candidate tabs
            const tabIds = tabsToOptimize.map((tab) => tab.id);
            await tabsManager.closeTabs(tabIds);

            // Refresh data
            await this.loadTabs();

            // Show success message
            console.log(
                `✅ Optimized performance by closing ${tabsToOptimize.length} tabs`
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
        chrome.tabs.create({ url: upgradeUrl });
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