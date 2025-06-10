// src/popup/components/Sheperd-meter.js
// Sheperd Meter Component - Displays tab chaos level with visual feedback

import { SHEPERD_EVENTS } from "../../utils/constants.js";
import { tabCategorizer } from "../../utils/categorizer.js";

/**
 * Sheperd Meter Component
 * Displays the current "tab chaos" level based on number of open tabs
 * Renamed from "shame-meter" to match Sheperd branding
 */
export class SheperdMeterComponent {
  constructor() {
    this.element = null;
    this.messageElement = null;
    this.fillElement = null;
    this.currentLevel = null;

    this.init();
  }

  /**
   * Initialize the Sheperd meter component
   */
  init() {
    this.createElement();
    this.bindEvents();
  }

  /**
   * Create the Sheperd meter DOM structure
   */
  createElement() {
    this.element = document.createElement("div");
    this.element.className = "sheperd-meter";

    this.element.innerHTML = `
      <div class="sheperd-text">
        <span id="sheperd-message">Looking good! 👍</span>
      </div>
      <div class="sheperd-bar">
        <div id="sheperd-fill"></div>
      </div>
      <div class="sheperd-tip">
        <span id="sheperd-tip-text">Keep it up! You're managing your tabs well.</span>
      </div>
    `;

    // Cache references to key elements
    this.messageElement = this.element.querySelector("#sheperd-message");
    this.fillElement = this.element.querySelector("#sheperd-fill");
    this.tipElement = this.element.querySelector("#sheperd-tip-text");
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Listen for tab count updates
    document.addEventListener(SHEPERD_EVENTS.TABS_UPDATED, (event) => {
      this.updateMeter(event.detail.count);
    });

    // Add hover effects for additional tips
    this.element.addEventListener("mouseenter", () => {
      this.showDetailedTip();
    });

    this.element.addEventListener("mouseleave", () => {
      this.hideDetailedTip();
    });
  }

  /**
   * Update the Sheperd meter based on tab count
   * @param {number} tabCount - Number of open tabs
   */
  updateMeter(tabCount) {
    if (typeof tabCount !== "number" || tabCount < 0) {
      console.warn("Invalid tab count provided:", tabCount);
      return;
    }

    const SheperdLevel = tabCategorizer.getSheperdLevel(tabCount);
    this.currentLevel = SheperdLevel;

    this.updateMessage(SheperdLevel.message);
    this.updateBar(SheperdLevel.color, SheperdLevel.percentage);
    this.updateTip(SheperdLevel, tabCount);
    this.updateElementClasses(SheperdLevel.level);
  }

  /**
   * Update the message text with animation
   * @param {string} message - Message to display
   */
  updateMessage(message) {
    if (!this.messageElement) return;

    // Add fade animation
    this.messageElement.style.opacity = "0";

    setTimeout(() => {
      this.messageElement.textContent = message;
      this.messageElement.style.opacity = "1";
    }, 150);
  }

  /**
   * Update the progress bar with smooth animation
   * @param {string} color - Bar color
   * @param {number} percentage - Fill percentage
   */
  updateBar(color, percentage) {
    if (!this.fillElement) return;

    // Animate the bar fill
    this.fillElement.style.backgroundColor = color;
    this.fillElement.style.width = `${percentage}%`;

    // Add pulse effect for high levels
    if (percentage > 80) {
      this.fillElement.classList.add("pulse");
    } else {
      this.fillElement.classList.remove("pulse");
    }
  }

  /**
   * Update the tip text based on current level
   * @param {Object} level - Sheperd level data
   * @param {number} tabCount - Current tab count
   */
  updateTip(level, tabCount) {
    if (!this.tipElement) return;

    let tipText = "";

    switch (level.level) {
      case "excellent":
        tipText = `Perfect! You have ${tabCount} tabs - very manageable.`;
        break;
      case "good":
        tipText = `Good job! ${tabCount} tabs is still under control.`;
        break;
      case "busy":
        tipText = `Getting busy with ${tabCount} tabs. Consider closing some.`;
        break;
      case "chaotic":
        tipText = `${tabCount} tabs is getting chaotic! Time to organize.`;
        break;
      case "apocalyptic":
        tipText = `🚨 ${tabCount} tabs! This is tab apocalypse territory!`;
        break;
      default:
        tipText = `You have ${tabCount} tabs open.`;
    }

    this.tipElement.textContent = tipText;
  }

  /**
   * Update CSS classes based on level
   * @param {string} level - Current level name
   */
  updateElementClasses(level) {
    if (!this.element) return;

    // Remove all level classes
    const levelClasses = [
      "excellent",
      "good",
      "busy",
      "chaotic",
      "apocalyptic",
    ];
    levelClasses.forEach((cls) =>
      this.element.classList.remove(`level-${cls}`)
    );

    // Add current level class
    this.element.classList.add(`level-${level}`);
  }

  /**
   * Show detailed tip on hover
   */
  showDetailedTip() {
    if (!this.currentLevel) return;

    const tips = {
      excellent: "You're a tab management pro! Keep this up.",
      good: "Nice work! You're staying organized.",
      busy: "Consider using bookmarks or closing unused tabs.",
      chaotic: "Try Sheperd's bulk close features to regain control.",
      apocalyptic:
        "Emergency! Use 'Close Duplicates' and category management now!",
    };

    const tip = tips[this.currentLevel.level] || "";
    if (tip && this.tipElement) {
      this.tipElement.textContent = tip;
      this.tipElement.style.fontWeight = "bold";
    }
  }

  /**
   * Hide detailed tip on mouse leave
   */
  hideDetailedTip() {
    if (this.currentLevel && this.tipElement) {
      this.updateTip(this.currentLevel, this.currentLevel.tabCount);
      this.tipElement.style.fontWeight = "normal";
    }
  }

  /**
   * Get current Sheperd level
   * @returns {Object|null} - Current level data
   */
  getCurrentLevel() {
    return this.currentLevel;
  }

  /**
   * Trigger a celebration animation for good tab management
   */
  celebrate() {
    if (!this.element) return;

    this.element.classList.add("celebrating");

    setTimeout(() => {
      this.element.classList.remove("celebrating");
    }, 1000);
  }

  /**
   * Render the component to a target container
   * @param {HTMLElement} container - Target container element
   */
  render(container) {
    if (!container || !(container instanceof HTMLElement)) {
      throw new Error(
        "Valid container element required for Sheperd meter rendering"
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
    if (state.tabCount !== undefined) {
      this.updateMeter(state.tabCount);
    }
  }

  /**
   * Destroy the component and clean up
   */
  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
      this.messageElement = null;
      this.fillElement = null;
      this.tipElement = null;
      this.currentLevel = null;
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
export const sheperdMeterComponent = new SheperdMeterComponent();
