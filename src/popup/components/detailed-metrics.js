// src/popup/components/detailed-metrics.js
// Detailed Per-Tab Resource Metrics Component

/**
 * Detailed Metrics Component
 * Provides comprehensive per-tab resource breakdown with management actions
 */
export class DetailedMetricsComponent {
    constructor() {
        this.element = null;
        this.isExpanded = false;
        this.currentResourceData = null;
        this.currentTabs = [];

        this.init();
    }

    /**
     * Initialize the detailed metrics component
     */
    init() {
        this.createElement();
        this.bindEvents();
    }

    /**
     * Create the detailed metrics DOM structure
     */
    createElement() {
        this.element = document.createElement("div");
        this.element.className = "detailed-metrics";
        this.element.id = "detailed-metrics";

        this.element.innerHTML = `
            <div class="metrics-header">
                <span class="metrics-icon">📋</span>
                <span class="metrics-label">Per-Tab Resource Details</span>
                <button class="metrics-toggle" id="metrics-toggle">
                    <span class="toggle-text">Show Details</span>
                    <span class="toggle-arrow">▼</span>
                </button>
            </div>
            <div class="metrics-content" id="metrics-content">
                <div class="metrics-loading">
                    <span class="loading-icon">⏳</span>
                    <span class="loading-text">Loading detailed metrics...</span>
                </div>
            </div>
        `;

        this.setupToggle();
    }

    /**
     * Setup toggle functionality for detailed metrics
     */
    setupToggle() {
        const toggleBtn = this.element.querySelector("#metrics-toggle");
        const content = this.element.querySelector("#metrics-content");
        const toggleText = this.element.querySelector(".toggle-text");
        const toggleArrow = this.element.querySelector(".toggle-arrow");

        if (!toggleBtn || !content) return;

        toggleBtn.addEventListener("click", () => {
            this.isExpanded = content.classList.contains("expanded");

            if (this.isExpanded) {
                content.classList.remove("expanded");
                toggleText.textContent = "Show Details";
                toggleArrow.textContent = "▼";
                this.isExpanded = false;
            } else {
                content.classList.add("expanded");
                toggleText.textContent = "Hide Details";
                toggleArrow.textContent = "▲";
                this.isExpanded = true;

                // Load detailed metrics when expanded
                this.loadDetailedMetrics();
            }
        });
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Listen for resource updates from analytics component
        document.addEventListener('resourceDataUpdated', (event) => {
            this.currentResourceData = event.detail.resourceData;
            this.currentTabs = event.detail.currentTabs || [];

            // Auto-refresh if expanded
            if (this.isExpanded) {
                this.loadDetailedMetrics();
            }
        });
    }

    /**
     * Load and display detailed per-tab metrics
     */
    async loadDetailedMetrics() {
        const metricsContent = this.element.querySelector("#metrics-content");
        if (!metricsContent) return;

        try {
            // Show loading state
            metricsContent.innerHTML = `
                <div class="metrics-loading">
                    <span class="loading-icon">⏳</span>
                    <span class="loading-text">Loading detailed metrics...</span>
                </div>
            `;

            // Get resource data from background if not available
            if (!this.currentResourceData) {
                const api = typeof browser !== 'undefined' && browser.runtime ? browser : chrome;
                const response = await api.runtime.sendMessage({ action: "getResourceData" });

                if (response && response.success && response.data) {
                    this.currentResourceData = response.data;
                } else {
                    this.showMetricsError(metricsContent, "Failed to load resource data");
                    return;
                }
            }

            this.displayDetailedMetrics(this.currentResourceData, metricsContent);
        } catch (error) {
            console.error('Failed to load detailed metrics:', error);
            this.showMetricsError(metricsContent, error.message);
        }
    }

    /**
     * Display comprehensive per-tab metrics
     */
    displayDetailedMetrics(resourceData, container) {
        const { tabResources = {}, systemResources = {}, lastUpdate = 0, browser = 'chrome' } = resourceData;

        const tabResourceEntries = Object.entries(tabResources);

        if (tabResourceEntries.length === 0) {
            container.innerHTML = `
                <div class="metrics-empty">
                    <span class="empty-icon">📊</span>
                    <span class="empty-text">No resource data available yet</span>
                    <span class="empty-hint">Resource monitoring will appear after a few seconds</span>
                </div>
            `;
            return;
        }

        // Sort tabs by resource usage (highest first)
        const sortedTabs = tabResourceEntries.sort((a, b) => {
            const aMemory = this.getTabMemoryUsage(a[1]);
            const bMemory = this.getTabMemoryUsage(b[1]);
            return bMemory - aMemory;
        });

        // Create detailed metrics HTML
        const metricsHTML = `
            <div class="metrics-summary">
                <div class="summary-stats">
                    <div class="summary-item">
                        <span class="summary-label">Total Tabs Monitored</span>
                        <span class="summary-value">${sortedTabs.length}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Total Memory Usage</span>
                        <span class="summary-value">${this.calculateTotalMemoryUsage(tabResources)}MB</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Average CPU Usage</span>
                        <span class="summary-value">${this.calculateAverageCpuUsage(tabResources)}%</span>
                    </div>
                </div>
            </div>
            
            <div class="tab-metrics-list">
                ${sortedTabs.map(([tabId, tabData]) => this.createTabMetricCard(tabId, tabData, this.currentTabs)).join('')}
            </div>
        `;

        container.innerHTML = metricsHTML;

        // Add click handlers for tab actions
        this.setupTabMetricActions(container);
    }

    /**
     * Create detailed metric card for individual tab
     */
    createTabMetricCard(tabId, tabData, currentTabs) {
            const { resources = {}, performance = {}, scoring = {}, heuristics = {}, timestamp = 0, browser = 'chrome', mode = 'heuristic' } = tabData;

            // Get tab info from current tabs
            const currentTab = currentTabs.find(tab => tab.id == tabId);
            const tabTitle = (currentTab && currentTab.title) || tabData.title || 'Unknown Tab';
            const tabUrl = (currentTab && currentTab.url) || tabData.url || '';
            const favicon = (currentTab && currentTab.favIconUrl) || '';

            // Calculate tab age
            const tabAge = this.calculateTabAge(timestamp);
            const memoryUsage = this.getTabMemoryUsage(tabData);
            const cpuUsage = this.getTabCpuUsage(tabData);
            const resourceImpact = scoring.impact || 'light';

            // Get domain for display
            const domain = this.extractDomain(tabUrl);

            // Determine if tab is heavy
            const isHeavy = resourceImpact === 'heavy' || memoryUsage > 100;
            const isActive = performance.isActive || false;
            const isAudible = performance.isAudible || false;

            return `
            <div class="tab-metric-card ${resourceImpact}" data-tab-id="${tabId}">
                <div class="tab-metric-header">
                    <div class="tab-info">
                        ${favicon ? `<img class="tab-favicon" src="${favicon}" alt="">` : '<span class="tab-favicon-placeholder">🌐</span>'}
                        <div class="tab-details">
                            <div class="tab-title" title="${tabTitle}">${this.truncateText(tabTitle, 40)}</div>
                            <div class="tab-domain">${domain}</div>
                        </div>
                    </div>
                    <div class="tab-status">
                        ${isActive ? '<span class="status-badge active">Active</span>' : ''}
                        ${isAudible ? '<span class="status-badge audible">🔊</span>' : ''}
                        ${isHeavy ? '<span class="status-badge heavy">Heavy</span>' : ''}
                        <span class="status-badge mode">${mode === 'precise' ? 'Precise' : 'Est.'}</span>
                    </div>
                </div>
                
                <div class="tab-metric-body">
                    <div class="metric-row">
                        <div class="metric-group">
                            <div class="metric-item">
                                <span class="metric-icon">💾</span>
                                <span class="metric-label">Memory</span>
                                <span class="metric-value memory">${memoryUsage}MB</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-icon">⚡</span>
                                <span class="metric-label">CPU</span>
                                <span class="metric-value cpu">${cpuUsage}%</span>
                            </div>
                        </div>
                        <div class="metric-group">
                            <div class="metric-item">
                                <span class="metric-icon">⏱️</span>
                                <span class="metric-label">Age</span>
                                <span class="metric-value age">${tabAge}</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-icon">📊</span>
                                <span class="metric-label">Impact</span>
                                <span class="metric-value impact ${resourceImpact}">${resourceImpact.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${this.createAdvancedMetrics(tabData, performance, heuristics)}
                </div>
                
                <div class="tab-metric-actions">
                    <button class="tab-action-btn focus" data-action="focus" data-tab-id="${tabId}">
                        <span class="action-icon">👁️</span>
                        <span class="action-text">Focus</span>
                    </button>
                    <button class="tab-action-btn close" data-action="close" data-tab-id="${tabId}">
                        <span class="action-icon">✕</span>
                        <span class="action-text">Close</span>
                    </button>
                    ${isHeavy ? `
                        <button class="tab-action-btn suspend" data-action="suspend" data-tab-id="${tabId}">
                            <span class="action-icon">💤</span>
                            <span class="action-text">Suspend</span>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Create advanced metrics section for tab
     */
    createAdvancedMetrics(tabData, performance, heuristics) {
        const { resources = {}, browser = 'chrome', mode = 'heuristic' } = tabData;
        
        let advancedHTML = '<div class="advanced-metrics">';
        
        // Network metrics (if available)
        if (resources.networkBytes || resources.networkEstimate) {
            const networkValue = resources.networkBytes ? 
                `${Math.round(resources.networkBytes / 1024)}KB` : 
                `~${resources.networkEstimate}KB`;
            
            advancedHTML += `
                <div class="advanced-metric">
                    <span class="advanced-icon">🌐</span>
                    <span class="advanced-label">Network</span>
                    <span class="advanced-value">${networkValue}</span>
                </div>
            `;
        }
        
        // Domain complexity (if available)
        if (heuristics.complexityScore) {
            advancedHTML += `
                <div class="advanced-metric">
                    <span class="advanced-icon">🧩</span>
                    <span class="advanced-label">Complexity</span>
                    <span class="advanced-value">${heuristics.complexityScore}/10</span>
                </div>
            `;
        }
        
        // Load state
        if (performance.loadState) {
            const loadStateIcon = performance.loadState === 'complete' ? '✅' : '⏳';
            advancedHTML += `
                <div class="advanced-metric">
                    <span class="advanced-icon">${loadStateIcon}</span>
                    <span class="advanced-label">State</span>
                    <span class="advanced-value">${performance.loadState}</span>
                </div>
            `;
        }
        
        // Browser optimization info
        if (heuristics.chromeOptimized) {
            advancedHTML += `
                <div class="advanced-metric">
                    <span class="advanced-icon">🚀</span>
                    <span class="advanced-label">Optimized</span>
                    <span class="advanced-value">Chrome</span>
                </div>
            `;
        }
        
        advancedHTML += '</div>';
        return advancedHTML;
    }

    /**
     * Setup tab metric action handlers
     */
    setupTabMetricActions(container) {
        const actionButtons = container.querySelectorAll('.tab-action-btn');
        
        actionButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const action = button.dataset.action;
                const tabId = parseInt(button.dataset.tabId);
                
                try {
                    const api = typeof browser !== 'undefined' && browser.runtime ? browser : chrome;
                    
                    switch (action) {
                        case 'focus':
                            await api.tabs.update(tabId, { active: true });
                            window.close(); // Close popup after focusing tab
                            break;
                            
                        case 'close':
                            button.disabled = true;
                            button.innerHTML = '<span class="action-icon">⏳</span><span class="action-text">Closing...</span>';
                            await api.tabs.remove(tabId);
                            
                            // Remove the card with animation
                            const card = button.closest('.tab-metric-card');
                            card.style.animation = 'slideOut 0.3s ease-in-out';
                            setTimeout(() => {
                                card.remove();
                                this.loadDetailedMetrics(); // Refresh metrics
                            }, 300);
                            break;
                            
                        case 'suspend':
                            button.disabled = true;
                            button.innerHTML = '<span class="action-icon">⏳</span><span class="action-text">Suspending...</span>';
                            
                            // For now, we'll just discard the tab (Chrome's built-in suspension)
                            await api.tabs.discard(tabId);
                            
                            button.innerHTML = '<span class="action-icon">✅</span><span class="action-text">Suspended</span>';
                            setTimeout(() => {
                                this.loadDetailedMetrics(); // Refresh metrics
                            }, 1000);
                            break;
                    }
                } catch (error) {
                    console.error(`Failed to ${action} tab:`, error);
                    button.innerHTML = '<span class="action-icon">❌</span><span class="action-text">Error</span>';
                    setTimeout(() => {
                        button.disabled = false;
                        button.innerHTML = `<span class="action-icon">${action === 'focus' ? '👁️' : action === 'close' ? '✕' : '💤'}</span><span class="action-text">${action === 'focus' ? 'Focus' : action === 'close' ? 'Close' : 'Suspend'}</span>`;
                    }, 2000);
                }
            });
        });
    }

    /**
     * Helper methods for metric calculations
     */
    getTabMemoryUsage(tabData) {
        const { resources = {} } = tabData;
        return Math.round(resources.memoryMB || resources.memoryEstimateMB || 0);
    }
    
    getTabCpuUsage(tabData) {
        const { resources = {} } = tabData;
        return Math.round((resources.cpuPercent || resources.cpuEstimatePercent || 0) * 10) / 10;
    }
    
    calculateTotalMemoryUsage(tabResources) {
        return Math.round(Object.values(tabResources).reduce((total, tabData) => {
            return total + this.getTabMemoryUsage(tabData);
        }, 0));
    }
    
    calculateAverageCpuUsage(tabResources) {
        const tabs = Object.values(tabResources);
        if (tabs.length === 0) return 0;
        
        const totalCpu = tabs.reduce((total, tabData) => {
            return total + this.getTabCpuUsage(tabData);
        }, 0);
        
        return Math.round((totalCpu / tabs.length) * 10) / 10;
    }
    
    calculateTabAge(timestamp) {
        if (!timestamp) return 'Unknown';
        
        const now = Date.now();
        const diff = now - timestamp;
        
        if (diff < 60000) return 'Just opened';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    }
    
    extractDomain(url) {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return 'Unknown';
        }
    }
    
    truncateText(text, maxLength) {
        if (!text) return 'Unknown';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    /**
     * Show metrics error state
     */
    showMetricsError(container, errorMessage) {
        container.innerHTML = `
            <div class="metrics-error">
                <span class="error-icon">⚠️</span>
                <span class="error-text">Failed to load metrics</span>
                <span class="error-details">${errorMessage}</span>
                <button class="error-retry" onclick="this.closest('.detailed-metrics').querySelector('#metrics-toggle').click()">
                    <span class="retry-icon">🔄</span>
                    <span class="retry-text">Retry</span>
                </button>
            </div>
        `;
    }

    /**
     * Update with new resource data
     */
    updateResourceData(resourceData, currentTabs = []) {
        this.currentResourceData = resourceData;
        this.currentTabs = currentTabs;
        
        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('resourceDataUpdated', {
            detail: { resourceData, currentTabs }
        }));
        
        // Auto-refresh if expanded
        if (this.isExpanded) {
            this.loadDetailedMetrics();
        }
    }

    /**
     * Render the component to a target container
     */
    render(container) {
        if (!container || !(container instanceof HTMLElement)) {
            throw new Error("Valid container element required for detailed metrics rendering");
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
        }
    }

    /**
     * Get the component's DOM element
     */
    getElement() {
        return this.element;
    }
}

// Export singleton instance for convenience
export const detailedMetricsComponent = new DetailedMetricsComponent();