// src/popup/components/analytics.js
// Analytics Component - Smart Performance Monitoring & Optimization

import { SHEPERD_EVENTS } from "../../utils/constants.js";

/**
 * Analytics Component
 * Provides smart performance monitoring, resource usage tracking, and optimization suggestions
 */
export class AnalyticsComponent {
  constructor() {
    this.element = null;
    this.performanceScoreElement = null;
    this.loadedRatioElement = null;
    this.recommendationElement = null;
    this.optimizeButtonElement = null;

    // Analytics data
    this.totalTabs = 0;
    this.loadedTabs = 0;
    this.tabsByCategory = {};
    this.heavyDomains = new Set([
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

    this.init();
  }

  /**
   * Initialize the analytics component
   */
  init() {
    this.createElement();
    this.bindEvents();
  }

  /**
   * Create the analytics DOM structure
   */
  createElement() {
    this.element = document.createElement("div");
    this.element.className = "analytics";

    this.element.innerHTML = `
      <div class="analytics-header">
        <h3>📊 Performance Impact</h3>
        <button class="analytics-toggle" aria-label="Toggle analytics details">
          <span class="toggle-icon">▼</span>
        </button>
      </div>
      
      <div class="analytics-content">
        <div class="performance-overview">
          <div class="performance-score">
            <div class="score-indicator" id="performance-indicator">
              <span class="score-emoji">🟢</span>
              <span class="score-text" id="performance-text">Light</span>
            </div>
            <div class="score-details" id="performance-details">
              System impact: Minimal
            </div>
          </div>
          
          <div class="loaded-ratio">
            <div class="ratio-display">
              <span class="ratio-numbers" id="loaded-ratio">0/0</span>
              <span class="ratio-label">loaded</span>
            </div>
            <div class="ratio-bar">
              <div class="ratio-fill" id="ratio-fill"></div>
            </div>
          </div>
        </div>
        
        <div class="analytics-recommendations" id="recommendations">
          <div class="recommendation-item">
            <span class="rec-icon">💡</span>
            <span class="rec-text">Performance looks good!</span>
          </div>
        </div>
        
        <div class="analytics-actions">
          <button class="optimize-btn" id="optimize-btn" disabled>
            <span class="btn-icon">⚡</span>
            <span class="btn-text">Optimize Performance</span>
          </button>
        </div>
      </div>
    `;

    // Cache element references
    this.performanceScoreElement = this.element.querySelector(
      "#performance-indicator"
    );
    this.loadedRatioElement = this.element.querySelector("#loaded-ratio");
    this.recommendationElement = this.element.querySelector("#recommendations");
    this.optimizeButtonElement = this.element.querySelector("#optimize-btn");

    // Add toggle functionality
    this.setupToggle();
  }

  /**
   * Setup collapsible analytics section
   */
  setupToggle() {
    const toggleBtn = this.element.querySelector(".analytics-header");
    const content = this.element.querySelector(".analytics-content");
    const toggleIcon = this.element.querySelector(".toggle-icon");

    toggleBtn.addEventListener("click", () => {
      const isExpanded = content.classList.contains("expanded");

      if (isExpanded) {
        content.classList.remove("expanded");
        toggleIcon.textContent = "▼";
        toggleBtn.setAttribute("aria-expanded", "false");
      } else {
        content.classList.add("expanded");
        toggleIcon.textContent = "▲";
        toggleBtn.setAttribute("aria-expanded", "true");
      }
    });

    // Start expanded by default
    content.classList.add("expanded");
    toggleBtn.setAttribute("aria-expanded", "true");
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Listen for tab data updates
    document.addEventListener(SHEPERD_EVENTS.TABS_UPDATED, (event) => {
      this.updateAnalytics(event.detail);
    });

    document.addEventListener(SHEPERD_EVENTS.CATEGORIES_UPDATED, (event) => {
      this.updateCategories(event.detail);
    });

    // Optimize button click
    this.optimizeButtonElement.addEventListener("click", () => {
      this.performOptimization();
    });
  }

  /**
   * Update analytics with new tab data
   * @param {Object} tabData - Tab information
   */
  updateAnalytics(tabData) {
    this.totalTabs = tabData.count || 0;
    this.loadedTabs = this.calculateLoadedTabs(tabData.tabs || []);

    this.updatePerformanceScore();
    this.updateLoadedRatio();
    this.updateRecommendations();
    this.updateOptimizeButton();
  }

  /**
   * Calculate number of loaded tabs
   * @param {Array} tabs - Array of tab objects
   * @returns {number} - Number of loaded tabs
   */
  calculateLoadedTabs(tabs) {
    return tabs.filter((tab) => {
      // Tab is considered loaded if it's not discarded and not pending
      return !tab.discarded && tab.status !== "loading";
    }).length;
  }

  /**
   * Update categories data
   * @param {Object} categories - Categorized tabs
   */
  updateCategories(categories) {
    this.tabsByCategory = categories;
    this.updateAnalytics({ count: this.totalTabs, tabs: this.getAllTabs() });
  }

  /**
   * Get all tabs from categories
   * @returns {Array} - All tabs
   */
  getAllTabs() {
    const allTabs = [];
    Object.values(this.tabsByCategory).forEach((category) => {
      if (category.tabs) {
        allTabs.push(...category.tabs);
      }
    });
    return allTabs;
  }

  /**
   * Calculate performance score based on tab data
   * @returns {Object} - Performance score data
   */
  calculatePerformanceScore() {
    const loadedRatio =
      this.totalTabs > 0 ? this.loadedTabs / this.totalTabs : 0;
    const heavyTabCount = this.countHeavyTabs();

    let score = "light";
    let emoji = "🟢";
    let details = "System impact: Minimal";

    if (this.totalTabs > 50 || heavyTabCount > 5) {
      score = "heavy";
      emoji = "🔴";
      details = "System impact: High";
    } else if (this.totalTabs > 25 || heavyTabCount > 2 || loadedRatio > 0.7) {
      score = "medium";
      emoji = "🟡";
      details = "System impact: Moderate";
    }

    return { score, emoji, details };
  }

  /**
   * Count tabs from heavy domains
   * @returns {number} - Number of heavy tabs
   */
  countHeavyTabs() {
    const allTabs = this.getAllTabs();
    return allTabs.filter((tab) => {
      const url = new URL(tab.url || "");
      return this.heavyDomains.has(url.hostname);
    }).length;
  }

  /**
   * Update performance score display
   */
  updatePerformanceScore() {
    const scoreData = this.calculatePerformanceScore();

    if (this.performanceScoreElement) {
      const emoji = this.performanceScoreElement.querySelector(".score-emoji");
      const text = this.performanceScoreElement.querySelector(".score-text");
      const details = this.element.querySelector("#performance-details");

      emoji.textContent = scoreData.emoji;
      text.textContent =
        scoreData.score.charAt(0).toUpperCase() + scoreData.score.slice(1);
      details.textContent = scoreData.details;

      // Add animation effect
      this.performanceScoreElement.style.transform = "scale(1.05)";
      setTimeout(() => {
        this.performanceScoreElement.style.transform = "scale(1)";
      }, 200);
    }
  }

  /**
   * Update loaded ratio display
   */
  updateLoadedRatio() {
    if (this.loadedRatioElement) {
      this.loadedRatioElement.textContent = `${this.loadedTabs}/${this.totalTabs}`;

      // Update ratio bar
      const ratioFill = this.element.querySelector("#ratio-fill");
      const percentage =
        this.totalTabs > 0 ? (this.loadedTabs / this.totalTabs) * 100 : 0;

      ratioFill.style.width = `${percentage}%`;

      // Color based on ratio
      if (percentage > 70) {
        ratioFill.className = "ratio-fill high";
      } else if (percentage > 40) {
        ratioFill.className = "ratio-fill medium";
      } else {
        ratioFill.className = "ratio-fill low";
      }
    }
  }

  /**
   * Generate smart recommendations
   * @returns {Array} - Array of recommendation objects
   */
  generateRecommendations() {
    const recommendations = [];
    const heavyTabCount = this.countHeavyTabs();
    const loadedRatio =
      this.totalTabs > 0 ? this.loadedTabs / this.totalTabs : 0;

    if (this.totalTabs > 50) {
      recommendations.push({
        icon: "🔥",
        text: `Close ${Math.floor(
          this.totalTabs * 0.3
        )} tabs to improve performance`,
        priority: "high",
      });
    }

    if (heavyTabCount > 3) {
      recommendations.push({
        icon: "⚡",
        text: `Suspend ${heavyTabCount} resource-heavy tabs`,
        priority: "medium",
      });
    }

    if (loadedRatio > 0.8 && this.totalTabs > 20) {
      recommendations.push({
        icon: "💤",
        text: `${Math.floor(this.loadedTabs * 0.4)} tabs could be suspended`,
        priority: "medium",
      });
    }

    if (this.totalTabs > 30) {
      recommendations.push({
        icon: "📚",
        text: "Bookmark frequently visited tabs for quick access",
        priority: "low",
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        icon: "✨",
        text: "Your tab usage looks optimized!",
        priority: "info",
      });
    }

    return recommendations.slice(0, 3); // Show max 3 recommendations
  }

  /**
   * Update recommendations display
   */
  updateRecommendations() {
    const recommendations = this.generateRecommendations();

    if (this.recommendationElement) {
      this.recommendationElement.innerHTML = recommendations
        .map(
          (rec) => `
        <div class="recommendation-item ${rec.priority}">
          <span class="rec-icon">${rec.icon}</span>
          <span class="rec-text">${rec.text}</span>
        </div>
      `
        )
        .join("");
    }
  }

  /**
   * Update optimize button state
   */
  updateOptimizeButton() {
    const hasOptimizations = this.totalTabs > 10 || this.countHeavyTabs() > 1;

    if (this.optimizeButtonElement) {
      this.optimizeButtonElement.disabled = !hasOptimizations;

      if (hasOptimizations) {
        this.optimizeButtonElement.classList.add("active");
        const btnText = this.optimizeButtonElement.querySelector(".btn-text");
        btnText.textContent = `Optimize (${this.getOptimizationCount()} tabs)`;
      } else {
        this.optimizeButtonElement.classList.remove("active");
        const btnText = this.optimizeButtonElement.querySelector(".btn-text");
        btnText.textContent = "Performance Optimized";
      }
    }
  }

  /**
   * Get number of tabs that can be optimized
   * @returns {number} - Number of optimizable tabs
   */
  getOptimizationCount() {
    const heavyTabs = this.countHeavyTabs();
    const excessTabs = Math.max(0, this.totalTabs - 25);
    return Math.min(heavyTabs + Math.floor(excessTabs * 0.3), 10);
  }

  /**
   * Perform optimization actions
   */
  async performOptimization() {
    try {
      this.optimizeButtonElement.disabled = true;
      this.optimizeButtonElement.classList.add("loading");

      // Dispatch optimization event
      const optimizationEvent = new CustomEvent(
        SHEPERD_EVENTS.OPTIMIZE_PERFORMANCE,
        {
          detail: {
            action: "optimize",
            suggestions: this.generateRecommendations(),
          },
        }
      );

      document.dispatchEvent(optimizationEvent);

      // Show success feedback
      this.showOptimizationFeedback();
    } catch (error) {
      console.error("Optimization failed:", error);
      this.showOptimizationError();
    } finally {
      setTimeout(() => {
        this.optimizeButtonElement.classList.remove("loading");
        this.updateOptimizeButton();
      }, 1500);
    }
  }

  /**
   * Show optimization success feedback
   */
  showOptimizationFeedback() {
    const btnText = this.optimizeButtonElement.querySelector(".btn-text");
    const originalText = btnText.textContent;

    btnText.textContent = "✅ Optimized!";

    setTimeout(() => {
      btnText.textContent = originalText;
    }, 2000);
  }

  /**
   * Show optimization error feedback
   */
  showOptimizationError() {
    const btnText = this.optimizeButtonElement.querySelector(".btn-text");
    const originalText = btnText.textContent;

    btnText.textContent = "❌ Error occurred";

    setTimeout(() => {
      btnText.textContent = originalText;
    }, 2000);
  }

  /**
   * Render the component to a target container
   * @param {HTMLElement} container - Target container element
   */
  render(container) {
    if (!container || !(container instanceof HTMLElement)) {
      throw new Error(
        "Valid container element required for analytics rendering"
      );
    }

    if (this.element) {
      container.appendChild(this.element);
    }
  }

  /**
   * Destroy the component and clean up event listeners
   */
  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
      this.performanceScoreElement = null;
      this.loadedRatioElement = null;
      this.recommendationElement = null;
      this.optimizeButtonElement = null;
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
export const analyticsComponent = new AnalyticsComponent();
