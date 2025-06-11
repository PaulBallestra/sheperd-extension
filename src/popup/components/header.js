// src/popup/components/header.js
// Header Component - Displays Sheperd branding and tab count

import { SHEPERD_EVENTS } from "../../utils/constants.js";

/**
 * Header Component
 * Manages the display of Sheperd branding and real-time tab count
 */
export class HeaderComponent {
    constructor() {
        this.element = null;
        this.totalTabsElement = null;
        this.tabCount = 0;

        this.init();
    }

    /**
     * Initialize the header component
     */
    init() {
        this.createElement();
        this.bindEvents();
    }

    /**
     * Create the header DOM structure
     */
    createElement() {
        this.element = document.createElement("div");
        this.element.className = "header";

        this.element.innerHTML = `
      <h1>🐑 Sheperd</h1>
      <div class="tab-count">
        <span id="total-tabs">0</span> tabs open
      </div>
    `;

        // Cache reference to the tab count element
        this.totalTabsElement = this.element.querySelector("#total-tabs");
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Bind real-time state management events
        this.bindRealTimeEvents();

        // Legacy TABS_UPDATED for backward compatibility
        document.addEventListener(SHEPERD_EVENTS.TABS_UPDATED, (event) => {
            const { action, count } = event.detail;
            if (action === "refresh") {
                this.updateTabCount(count);
            }
        });
    }

    /**
     * Bind real-time state management events
     */
    bindRealTimeEvents() {
        // Listen for real-time header updates
        document.addEventListener(SHEPERD_EVENTS.HEADER_UPDATED, (event) => {
            const { totalCount } = event.detail;
            this.updateTabCount(totalCount);
        });
    }

    /**
     * Update the displayed tab count
     * @param {number} count - Number of open tabs
     */
    updateTabCount(count) {
        if (typeof count !== "number" || count < 0) {
            console.warn("Invalid tab count provided:", count);
            return;
        }

        this.tabCount = count;

        if (this.totalTabsElement) {
            // Add smooth transition animation
            this.totalTabsElement.style.transform = "scale(1.1)";
            this.totalTabsElement.textContent = count;

            // Reset animation after a brief delay
            setTimeout(() => {
                this.totalTabsElement.style.transform = "scale(1)";
            }, 150);
        }
    }

    /**
     * Get the current tab count
     * @returns {number} - Current tab count
     */
    getTabCount() {
        return this.tabCount;
    }

    /**
     * Render the component to a target container
     * @param {HTMLElement} container - Target container element
     */
    render(container) {
        if (!container || !(container instanceof HTMLElement)) {
            throw new Error("Valid container element required for header rendering");
        }

        if (this.element) {
            container.appendChild(this.element);
        }
    }

    /**
     * Update header state with animation
     * @param {Object} state - Header state data
     */
    updateState(state) {
        if (state.tabCount !== undefined) {
            this.updateTabCount(state.tabCount);
        }

        // Add visual feedback for large tab counts
        if (this.tabCount > 50) {
            this.element.classList.add("tab-apocalypse");
        } else if (this.tabCount > 35) {
            this.element.classList.add("tab-chaos");
        } else {
            this.element.classList.remove("tab-apocalypse", "tab-chaos");
        }
    }

    /**
     * Destroy the component and clean up event listeners
     */
    destroy() {
        if (this.element) {
            this.element.remove();
            this.element = null;
            this.totalTabsElement = null;
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
export const headerComponent = new HeaderComponent();