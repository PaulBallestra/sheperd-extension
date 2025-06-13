// src/popup/components/analytics.js
// Analytics Component - Smart Performance Monitoring & Optimization

import { SHEPERD_EVENTS } from "../../utils/constants.js";
import { DetailedMetricsComponent } from "./detailed-metrics.js";

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

        // Initialize detailed metrics component
        this.detailedMetrics = new DetailedMetricsComponent();

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
        this.renderDetailedMetrics();
    }

    /**
     * Create the analytics DOM structure
     */
    createElement() {
        this.element = document.createElement("div");
        this.element.className = "analytics";

        this.element.innerHTML = `
      <div class="analytics-header">
        <h3>⚡ Real-Time Performance Monitor</h3>
        <div class="analytics-toggle">
          <span class="toggle-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </div>
      </div>
      
      <div class="analytics-content">
        <!-- 🔥 ENHANCED: Real-time system overview -->
        <div class="system-overview">
          <div class="system-memory">
            <div class="memory-header">
              <span class="memory-icon">💾</span>
              <span class="memory-label">System RAM</span>
              <span class="memory-status" id="memory-status">Monitoring...</span>
            </div>
            <div class="memory-bar">
              <div class="memory-fill" id="memory-fill"></div>
              <div class="memory-text" id="memory-text">0GB / 0GB</div>
            </div>
            <div class="memory-details" id="memory-details">Collecting data...</div>
          </div>
        </div>
        
        <!-- 🔥 ENHANCED: Real-time tab performance metrics -->
        <div class="tab-performance">
          <div class="performance-grid">
            <div class="metric-card">
              <div class="metric-header">
                <span class="metric-icon">📊</span>
                <span class="metric-label">Tab Impact</span>
              </div>
              <div class="metric-value" id="tab-impact">
                <span class="impact-emoji" id="impact-emoji">🟢</span>
                <span class="impact-text" id="impact-text">Light</span>
              </div>
              <div class="metric-details" id="impact-details">Analyzing...</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-header">
                <span class="metric-icon">⚡</span>
                <span class="metric-label">Active Tabs</span>
              </div>
              <div class="metric-value" id="active-tabs">
                <span class="active-count" id="active-count">0</span>
                <span class="active-total" id="active-total">/ 0</span>
              </div>
              <div class="metric-details" id="active-details">Scanning...</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-header">
                <span class="metric-icon">🔥</span>
                <span class="metric-label">Heavy Tabs</span>
              </div>
              <div class="metric-value" id="heavy-tabs">
                <span class="heavy-count" id="heavy-count">0</span>
                <span class="heavy-label">heavy</span>
              </div>
              <div class="metric-details" id="heavy-details">Analyzing...</div>
            </div>
          </div>
        </div>
        
        <!-- 🔥 ENHANCED: Real-time resource usage display -->
        <div class="resource-usage" id="resource-usage">
          <div class="usage-header">
            <span class="usage-icon">📈</span>
            <span class="usage-label">Live Resource Monitor</span>
            <span class="usage-mode" id="usage-mode">Heuristic Mode</span>
          </div>
          <div class="usage-content" id="usage-content">
            <div class="usage-row">
              <div class="usage-item">
                <span class="usage-type">Total Memory</span>
                <span class="usage-value" id="estimated-memory">~0MB</span>
              </div>
              <div class="usage-item">
                <span class="usage-type">Average CPU</span>
                <span class="usage-value" id="estimated-cpu">~0%</span>
              </div>
            </div>
            <div class="usage-row">
              <div class="usage-item">
                <span class="usage-type">Loaded Tabs</span>
                <span class="usage-value" id="loaded-tabs-count">0 / 0</span>
              </div>
              <div class="usage-item">
                <span class="usage-type">Last Scan</span>
                <span class="usage-value" id="last-update">Never</span>
              </div>
            </div>
            <div class="usage-progress" id="usage-progress">
              <div class="progress-item">
                <span class="progress-label">Memory Load</span>
                <div class="progress-bar">
                  <div class="progress-fill" id="memory-progress"></div>
                </div>
                <span class="progress-value" id="memory-progress-text">0%</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 🔥 ENHANCED: Smart recommendations with priority -->
        <div class="smart-recommendations" id="recommendations">
          <div class="recommendation-item">
            <span class="rec-icon">💡</span>
            <span class="rec-text">Analyzing performance patterns...</span>
          </div>
        </div>

         <!-- 🔥 ENHANCED: Advanced optimization actions -->
        <div class="optimization-actions">
          <button class="optimize-btn" id="optimize-btn" disabled>
            <span class="btn-icon">⚡</span>
            <span class="btn-text">Optimize Performance</span>
            <span class="btn-badge" id="optimize-badge">0</span>
          </button>
        </div>

        <div class="optimization-stats" id="optimization-stats">
            <span class="stat-item">
              <span class="stat-label">Scans:</span>
              <span class="stat-value" id="scan-count">0</span>
            </span>
            <span class="stat-item">
              <span class="stat-label">Mode:</span>
              <span class="stat-value" id="scan-mode">Chrome</span>
            </span>
          </div>
        
        <!-- 🔥 NEW: Detailed Per-Tab Resource Breakdown Component -->
        <!-- <div id="detailed-metrics-container"></div> -->
        
       
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

        toggleBtn.addEventListener("click", () => {
            const isExpanded = content.classList.contains("expanded");

            if (isExpanded) {
                content.classList.remove("expanded");
                this.element.classList.remove("expanded");
                toggleBtn.setAttribute("aria-expanded", "false");
            } else {
                content.classList.add("expanded");
                this.element.classList.add("expanded");
                toggleBtn.setAttribute("aria-expanded", "true");
            }
        });

        // Start expanded by default
        content.classList.add("expanded");
        this.element.classList.add("expanded");
        toggleBtn.setAttribute("aria-expanded", "true");
    }

    /**
     * Render the detailed metrics component
     */
    renderDetailedMetrics() {
        const container = this.element.querySelector('#detailed-metrics-container');
        if (container && this.detailedMetrics) {
            this.detailedMetrics.render(container);
        }
    }



    /**
     * Bind event listeners
     */
    bindEvents() {
        // Bind real-time state management events
        this.bindRealTimeEvents();

        // Real-time events only - legacy TABS_UPDATED removed

        // Optimize button click
        this.optimizeButtonElement.addEventListener("click", () => {
            this.performOptimization();
        });
    }

    /**
     * Bind real-time state management events
     */
    bindRealTimeEvents() {
        // Listen for real-time analytics updates
        document.addEventListener(SHEPERD_EVENTS.ANALYTICS_UPDATED, (event) => {
            const { currentTabs, categorizedTabs, totalCount, type } = event.detail;
            console.log(`🔄 Analytics received ANALYTICS_UPDATED: ${type}, totalCount: ${totalCount}, tabs: ${currentTabs?.length || 0}`);
            this.updateAnalyticsRealtime(currentTabs, categorizedTabs, totalCount);
        });

        // 🔥 NEW: Listen for resource monitoring updates from background script
        const api = typeof browser !== 'undefined' && browser.runtime ? browser : chrome;
        api.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'RESOURCE_UPDATE') {
                console.log('📊 Analytics received RESOURCE_UPDATE:', message.data);
                this.updateResourceData(message.data);
                sendResponse({ success: true });
                return true;
            }
        });

        // 🔥 NEW: Request initial resource data immediately (multiple attempts)
        this.requestResourceData();

        // 🔥 NEW: Aggressive initial loading - try multiple times to ensure data loads
        setTimeout(() => this.requestResourceData(), 500);
        setTimeout(() => this.requestResourceData(), 1500);

        // 🔥 NEW: Set up periodic resource data requests (more frequent)
        setInterval(() => {
            this.requestResourceData();
        }, 5000); // Every 5 seconds for real-time updates

        // 🔥 REMOVED: Auto-expand detailed metrics - keep collapsed by default for cleaner UI
        // Users can manually expand when they want detailed per-tab metrics
    }

    /**
     * Update analytics in real-time
     * @param {Array} tabs - Current tabs array
     * @param {Object} categorizedTabs - Categorized tabs object
     * @param {number} totalCount - Total tab count
     */
    updateAnalyticsRealtime(tabs, categorizedTabs, totalCount) {
        this.totalTabs = totalCount;
        this.tabsByCategory = categorizedTabs;
        this.currentTabs = tabs || []; // Store current tabs for optimization calculations
        this.loadedTabs = this.calculateLoadedTabs(tabs || []);

        this.updateTabPerformanceMetrics();
        this.updateRecommendations();
        this.updateOptimizeButton();
    }

    /**
     * 🔥 NEW: Request resource data from background script
     */
    async requestResourceData() {
        try {
            console.log('📊 Requesting resource data from background...');
            const api = typeof browser !== 'undefined' && browser.runtime ? browser : chrome;
            const response = await api.runtime.sendMessage({ action: "getResourceData" });

            if (response && response.success && response.data) {
                console.log('📊 Retrieved resource data:', response.data);
                this.updateResourceData(response.data);
            } else {
                console.log('⚠️ No resource data received:', response);
                // Show placeholder data to indicate monitoring is starting
                this.showResourceDataPlaceholder();
            }
        } catch (error) {
            console.log('⚠️ Failed to get resource data:', error.message);
            this.showResourceDataPlaceholder();
        }
    }

    /**
     * 🔥 NEW: Show placeholder data while resource monitoring starts up
     */
    showResourceDataPlaceholder() {
        const usageMode = this.element.querySelector('#usage-mode');
        const estimatedMemory = this.element.querySelector('#estimated-memory');
        const estimatedCpu = this.element.querySelector('#estimated-cpu');
        const loadedTabsCount = this.element.querySelector('#loaded-tabs-count');
        const lastUpdate = this.element.querySelector('#last-update');

        if (usageMode) usageMode.textContent = 'Starting...';
        if (estimatedMemory) estimatedMemory.textContent = 'Scanning...';
        if (estimatedCpu) estimatedCpu.textContent = 'Scanning...';
        if (loadedTabsCount) loadedTabsCount.textContent = `${this.loadedTabs || 0} / ${this.totalTabs || 0}`;
        if (lastUpdate) lastUpdate.textContent = 'Starting scan...';

        console.log('📊 Showing resource data placeholder while monitoring starts');
    }

    /**
     * 🔥 NEW: Update UI with real-time resource data
     * @param {Object} resourceData - Resource monitoring data from background
     */
    updateResourceData(resourceData) {
        const { tabResources = {}, systemResources = {}, lastUpdate = 0, browser = 'chrome' } = resourceData;

        // Update system memory display with animations
        this.updateSystemMemoryDisplay(systemResources);

        // Update tab resource usage
        this.updateTabResourceUsage(tabResources, browser);

        // Update scan statistics
        this.updateScanStatistics(resourceData);

        // Update last update timestamp
        this.updateLastUpdateTime(lastUpdate);

        console.log(`📊 UI updated with resource data: ${Object.keys(tabResources).length} tabs, system: ${systemResources.browser || 'unknown'}`);

        // 🔥 NEW: Update detailed metrics component with resource data
        if (this.detailedMetrics) {
            this.detailedMetrics.updateResourceData(resourceData, this.currentTabs);
        }
    }



    /**
     * 🔥 NEW: Update system memory display with smooth animations
     */
    updateSystemMemoryDisplay(systemResources) {
        const memoryFill = this.element.querySelector('#memory-fill');
        const memoryText = this.element.querySelector('#memory-text');
        const memoryStatus = this.element.querySelector('#memory-status');
        const memoryDetails = this.element.querySelector('#memory-details');

        if (!memoryFill || !memoryText || !memoryStatus || !memoryDetails) return;

        if (systemResources.memory && systemResources.memory.totalMB) {
            const { totalMB, usedPercent, availableMB } = systemResources.memory;
            const totalGB = Math.round(totalMB / 1024);
            const usedGB = Math.round((totalMB - availableMB) / 1024);

            // Smooth animation for memory bar
            memoryFill.style.width = `${usedPercent}%`;

            // Color coding for memory usage
            if (usedPercent > 80) {
                memoryFill.className = 'memory-fill critical';
                memoryStatus.textContent = 'Critical';
            } else if (usedPercent > 60) {
                memoryFill.className = 'memory-fill warning';
                memoryStatus.textContent = 'High';
            } else {
                memoryFill.className = 'memory-fill normal';
                memoryStatus.textContent = 'Normal';
            }

            // Update text with animation
            memoryText.textContent = `${usedGB}GB / ${totalGB}GB`;
            memoryDetails.textContent = `${usedPercent}% used • ${Math.round(availableMB / 1024)}GB available`;

            // Add pulsing animation for real-time effect
            memoryFill.style.animation = 'pulse 2s ease-in-out infinite';
            setTimeout(() => {
                memoryFill.style.animation = '';
            }, 2000);

        } else {
            memoryStatus.textContent = 'Unavailable';
            memoryDetails.textContent = 'System memory API not accessible';
            memoryText.textContent = 'Unknown';
        }
    }

    /**
     * 🔥 NEW: Update tab performance metrics with real-time data
     */
    updateTabPerformanceMetrics() {
        const impactEmoji = this.element.querySelector('#impact-emoji');
        const impactText = this.element.querySelector('#impact-text');
        const impactDetails = this.element.querySelector('#impact-details');
        const activeCount = this.element.querySelector('#active-count');
        const activeTotal = this.element.querySelector('#active-total');
        const activeDetails = this.element.querySelector('#active-details');
        const heavyCount = this.element.querySelector('#heavy-count');
        const heavyDetails = this.element.querySelector('#heavy-details');

        // Calculate performance impact
        const scoreData = this.calculatePerformanceScore();
        const heavyTabCount = this.countHeavyTabs();

        // Update impact indicator with animations
        if (impactEmoji && impactText && impactDetails) {
            impactEmoji.textContent = scoreData.emoji;
            impactText.textContent = scoreData.score.charAt(0).toUpperCase() + scoreData.score.slice(1);
            impactDetails.textContent = scoreData.details;

            // Add bounce animation for changes
            impactEmoji.style.animation = 'bounce 0.5s ease-in-out';
            setTimeout(() => { impactEmoji.style.animation = ''; }, 500);
        }

        // Update active tabs count
        if (activeCount && activeTotal && activeDetails) {
            activeCount.textContent = this.loadedTabs;
            activeTotal.textContent = `/ ${this.totalTabs}`;

            const loadedRatio = this.totalTabs > 0 ? (this.loadedTabs / this.totalTabs) * 100 : 0;
            activeDetails.textContent = `${Math.round(loadedRatio)}% actively loaded`;
        }

        // Update heavy tabs count
        if (heavyCount && heavyDetails) {
            heavyCount.textContent = heavyTabCount;
            heavyDetails.textContent = heavyTabCount > 0 ?
                `Resource-intensive sites detected` :
                `All tabs optimized`;

            // Color coding for heavy tabs
            if (heavyTabCount > 5) {
                heavyCount.className = 'heavy-count critical';
            } else if (heavyTabCount > 2) {
                heavyCount.className = 'heavy-count warning';
            } else {
                heavyCount.className = 'heavy-count normal';
            }
        }
    }

    /**
     * 🔥 NEW: Update tab resource usage display with comprehensive metrics
     */
    updateTabResourceUsage(tabResources, browser) {
        const usageMode = this.element.querySelector('#usage-mode');
        const estimatedMemory = this.element.querySelector('#estimated-memory');
        const estimatedCpu = this.element.querySelector('#estimated-cpu');
        const loadedTabsCount = this.element.querySelector('#loaded-tabs-count');
        const memoryProgress = this.element.querySelector('#memory-progress');
        const memoryProgressText = this.element.querySelector('#memory-progress-text');

        if (!usageMode || !estimatedMemory || !estimatedCpu) return;

        // Calculate total resource usage
        let totalMemory = 0;
        let totalCpu = 0;
        let tabCount = 0;
        let hasActualData = false;

        Object.values(tabResources).forEach(tabData => {
            if (tabData.resources) {
                tabCount++;

                if (tabData.mode === 'precise') {
                    hasActualData = true;
                    totalMemory += tabData.resources.memoryMB || 0;
                    totalCpu += tabData.resources.cpuPercent || 0;
                } else {
                    totalMemory += tabData.resources.memoryEstimateMB || 0;
                    totalCpu += tabData.resources.cpuEstimatePercent || 0;
                }
            }
        });

        // Update mode indicator
        const mode = hasActualData ? 'Precise Mode' : 'Heuristic Mode';
        usageMode.textContent = mode;
        usageMode.className = hasActualData ? 'usage-mode precise' : 'usage-mode heuristic';

        // Update resource displays with animations
        const memoryPrefix = hasActualData ? '' : '~';
        const cpuPrefix = hasActualData ? '' : '~';
        const avgCpu = tabCount > 0 ? totalCpu / tabCount : 0;

        estimatedMemory.textContent = `${memoryPrefix}${Math.round(totalMemory)}MB`;
        estimatedCpu.textContent = `${cpuPrefix}${Math.round(avgCpu * 10) / 10}%`;

        // 🔥 NEW: Update loaded tabs count (this was missing!)
        if (loadedTabsCount) {
            loadedTabsCount.textContent = `${this.loadedTabs} / ${this.totalTabs}`;

            // Color coding based on loaded ratio
            const loadedRatio = this.totalTabs > 0 ? (this.loadedTabs / this.totalTabs) * 100 : 0;
            if (loadedRatio > 80) {
                loadedTabsCount.className = 'usage-value high';
            } else if (loadedRatio > 50) {
                loadedTabsCount.className = 'usage-value medium';
            } else {
                loadedTabsCount.className = 'usage-value low';
            }
        }

        // 🔥 NEW: Update memory progress bar
        if (memoryProgress && memoryProgressText) {
            // Calculate memory usage percentage (assuming 8GB as baseline)
            const memoryPercentage = Math.min((totalMemory / 8192) * 100, 100); // 8GB = 8192MB

            memoryProgress.style.width = `${memoryPercentage}%`;
            memoryProgressText.textContent = `${Math.round(memoryPercentage)}%`;

            // Color coding for memory usage
            if (memoryPercentage > 75) {
                memoryProgress.className = 'progress-fill critical';
            } else if (memoryPercentage > 50) {
                memoryProgress.className = 'progress-fill warning';
            } else {
                memoryProgress.className = 'progress-fill normal';
            }
        }

        // Add update animation
        [estimatedMemory, estimatedCpu, loadedTabsCount].forEach(element => {
            if (element) {
                element.style.animation = 'fadeIn 0.3s ease-in-out';
                setTimeout(() => { element.style.animation = ''; }, 300);
            }
        });

        console.log(`📊 Resource usage updated: ${Math.round(totalMemory)}MB total, ${Math.round(avgCpu * 10) / 10}% avg CPU, ${this.loadedTabs}/${this.totalTabs} loaded tabs`);
    }

    /**
     * 🔥 NEW: Update scan statistics
     */
    updateScanStatistics(resourceData) {
        const scanCount = this.element.querySelector('#scan-count');
        const scanMode = this.element.querySelector('#scan-mode');

        if (scanCount && resourceData.scanCount) {
            scanCount.textContent = resourceData.scanCount;
        }

        if (scanMode) {
            scanMode.textContent = resourceData.browser === 'chrome' ? 'Chrome' : 'Firefox';
        }
    }

    /**
     * 🔥 NEW: Update last update timestamp
     */
    updateLastUpdateTime(lastUpdate) {
        const lastUpdateElement = this.element.querySelector('#last-update');
        if (!lastUpdateElement || !lastUpdate) return;

        const now = Date.now();
        const diff = now - lastUpdate;

        let timeText = 'Just now';
        if (diff > 60000) {
            const minutes = Math.floor(diff / 60000);
            timeText = `${minutes}m ago`;
        } else if (diff > 5000) {
            const seconds = Math.floor(diff / 1000);
            timeText = `${seconds}s ago`;
        }

        lastUpdateElement.textContent = timeText;
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
        const allTabs = this.currentTabs || this.getAllTabs();
        return allTabs.filter((tab) => {
            try {
                const url = new URL(tab.url || "");
                return this.heavyDomains.has(url.hostname);
            } catch (error) {
                return false; // Invalid URL
            }
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
        const optimizableCount = Math.min(heavyTabs + Math.floor(excessTabs * 0.3), 10);

        console.log(`🔧 Optimization count: heavyTabs=${heavyTabs}, excessTabs=${excessTabs}, total=${optimizableCount}`);
        return optimizableCount;
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
                SHEPERD_EVENTS.OPTIMIZE_PERFORMANCE, {
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

        // Destroy detailed metrics component
        if (this.detailedMetrics) {
            this.detailedMetrics.destroy();
            this.detailedMetrics = null;
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