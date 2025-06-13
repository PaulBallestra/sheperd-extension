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

        // 🔥 NEW: Track expanded states for persistent UX
        this.expandedTabCards = new Set(); // Track which tab cards are expanded
        this.expandedAdvancedMetrics = new Set(); // Track which advanced metrics are expanded

        // 🔥 ENHANCED: Load persisted states from localStorage
        this.loadPersistedStates();

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
            // 🔥 FIXED: Only show loading state if no existing content
            const existingContent = metricsContent.querySelector('.tab-metrics-list');
            if (!existingContent) {
                // Show loading state only for initial load
                metricsContent.innerHTML = `
                    <div class="metrics-loading">
                        <span class="loading-icon">⏳</span>
                        <span class="loading-text">Loading detailed metrics...</span>
                    </div>
                `;
            }

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

        // 🔥 NEW: Filter to show only heavy/problematic tabs
        const heavyTabs = tabResourceEntries.filter(([tabId, tabData]) => {
            const memoryUsage = this.getTabMemoryUsage(tabData);
            const cpuUsage = this.getTabCpuUsage(tabData);
            const impact = (tabData.scoring && tabData.scoring.impact) || 'light';

            // Show tabs that are:
            // 1. Heavy impact level, OR
            // 2. High memory usage (>100MB), OR  
            // 3. High CPU usage (>5%), OR
            // 4. Audible tabs (likely playing media)
            return impact === 'heavy' ||
                memoryUsage > 100 ||
                cpuUsage > 5 ||
                (tabData.performance && tabData.performance.isAudible);
        });

        // Sort heavy tabs by resource usage (highest first)
        const sortedTabs = heavyTabs.sort((a, b) => {
            const aMemory = this.getTabMemoryUsage(a[1]);
            const bMemory = this.getTabMemoryUsage(b[1]);
            return bMemory - aMemory;
        });

        // If no heavy tabs, show top 5 tabs by memory usage
        const finalTabs = sortedTabs.length > 0 ? sortedTabs :
            tabResourceEntries.sort((a, b) => {
                const aMemory = this.getTabMemoryUsage(a[1]);
                const bMemory = this.getTabMemoryUsage(b[1]);
                return bMemory - aMemory;
            }).slice(0, 5);

        // 🔥 ENHANCED: Check if this is initial render or update
        const existingList = container.querySelector('.tab-metrics-list');
        const isInitialRender = !existingList;

        if (isInitialRender) {
            // Initial render - create full HTML structure
            this.renderInitialMetrics(container, finalTabs, sortedTabs, tabResources);
        } else {
            // Update existing metrics - only update values, preserve DOM structure
            this.updateExistingMetrics(container, finalTabs, sortedTabs, tabResources);
        }

        // 🔥 ENHANCED: Clean up states for tabs that no longer exist
        this.cleanupStaleStates(finalTabs);
    }

    /**
     * 🔥 ENHANCED: Initial render - create full HTML structure
     */
    renderInitialMetrics(container, finalTabs, sortedTabs, tabResources) {
            const metricsHTML = `
            <div class="metrics-summary">
                <div class="summary-stats">
                    <div class="summary-item">
                        <span class="summary-label">Heavy Tabs Found</span>
                        <span class="summary-value" id="heavy-tabs-count">${finalTabs.length}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Total Memory Usage</span>
                        <span class="summary-value" id="total-memory-usage">${this.calculateTotalMemoryUsage(tabResources)}MB</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Heavy Tabs Memory</span>
                        <span class="summary-value" id="heavy-tabs-memory">${this.calculateHeavyTabsMemory(finalTabs)}MB</span>
                    </div>
                </div>
                <div class="summary-description" id="summary-description" style="text-align: center; margin-top: var(--space-sm); padding: var(--space-xs); background: ${finalTabs.length === sortedTabs.length ? 'rgba(239, 68, 68, 0.1)' : 'rgba(102, 126, 234, 0.1)'}; border-radius: var(--radius-sm); font-size: var(--font-size-xs); color: var(--text-secondary);">
                    ${finalTabs.length === sortedTabs.length ? 
                        `🔥 Showing ${finalTabs.length} resource-heavy tabs that need attention` : 
                        `📊 Showing top ${finalTabs.length} tabs by memory usage (no heavy tabs detected)`
                    }
                </div>
            </div>
            
            <div class="tab-metrics-list" id="tab-metrics-list">
                ${finalTabs.map(([tabId, tabData]) => this.createTabMetricCard(tabId, tabData, this.currentTabs)).join('')}
            </div>
        `;

        container.innerHTML = metricsHTML;

        // Setup event handlers for initial render
        this.setupTabMetricActions(container);
        this.setupTabCardToggle(container);
        this.setupAdvancedMetricsToggle(container);
        this.restoreExpandedStates(container);
        this.setupScrollIndicator(container);
    }

    /**
     * 🔥 ENHANCED: Update existing metrics - preserve DOM structure, update values only
     */
    updateExistingMetrics(container, finalTabs, sortedTabs, tabResources) {
        // Update summary statistics
        const heavyTabsCount = container.querySelector('#heavy-tabs-count');
        const totalMemoryUsage = container.querySelector('#total-memory-usage');
        const heavyTabsMemory = container.querySelector('#heavy-tabs-memory');
        const summaryDescription = container.querySelector('#summary-description');

        if (heavyTabsCount) heavyTabsCount.textContent = finalTabs.length;
        if (totalMemoryUsage) totalMemoryUsage.textContent = `${this.calculateTotalMemoryUsage(tabResources)}MB`;
        if (heavyTabsMemory) heavyTabsMemory.textContent = `${this.calculateHeavyTabsMemory(finalTabs)}MB`;
        
        if (summaryDescription) {
            summaryDescription.style.background = finalTabs.length === sortedTabs.length ? 'rgba(239, 68, 68, 0.1)' : 'rgba(102, 126, 234, 0.1)';
            summaryDescription.textContent = finalTabs.length === sortedTabs.length ? 
                `🔥 Showing ${finalTabs.length} resource-heavy tabs that need attention` : 
                `📊 Showing top ${finalTabs.length} tabs by memory usage (no heavy tabs detected)`;
        }

        // Update existing tab cards and add new ones
        const tabMetricsList = container.querySelector('#tab-metrics-list');
        
        // 🔥 ENHANCED: Add subtle update indicator
        if (tabMetricsList) {
            tabMetricsList.style.opacity = '0.95';
            setTimeout(() => {
                tabMetricsList.style.opacity = '1';
            }, 100);
        }
        if (!tabMetricsList) return;

        const currentTabIds = new Set(finalTabs.map(([tabId]) => tabId));
        const existingCards = tabMetricsList.querySelectorAll('.tab-metric-card');

        // Remove cards for tabs that no longer exist
        existingCards.forEach(card => {
            const tabId = card.dataset.tabId;
            if (!currentTabIds.has(tabId)) {
                card.remove();
            }
        });

        // Update existing cards and add new ones
        finalTabs.forEach(([tabId, tabData]) => {
            const existingCard = tabMetricsList.querySelector(`[data-tab-id="${tabId}"]`);
            
            if (existingCard) {
                // Update existing card values
                this.updateTabMetricCard(existingCard, tabId, tabData, this.currentTabs);
            } else {
                // Add new card
                const newCardHTML = this.createTabMetricCard(tabId, tabData, this.currentTabs);
                tabMetricsList.insertAdjacentHTML('beforeend', newCardHTML);
                
                // Setup event handlers for new card
                const newCard = tabMetricsList.querySelector(`[data-tab-id="${tabId}"]`);
                if (newCard) {
                    this.setupTabMetricActionsForCard(newCard);
                    this.setupTabCardToggleForCard(newCard);
                    this.setupAdvancedMetricsToggleForCard(newCard);
                    
                    // Restore expanded state if it was previously expanded
                    if (this.expandedTabCards.has(tabId)) {
                        const button = newCard.querySelector('.tab-metric-toggle');
                        const contentDiv = newCard.querySelector(`#tab-content-${tabId}`);
                        const arrow = button?.querySelector('.toggle-arrow');
                        
                        if (button && contentDiv && arrow) {
                            contentDiv.classList.add('expanded');
                            arrow.textContent = '▲';
                            button.classList.add('expanded');
                        }
                    }
                    
                    if (this.expandedAdvancedMetrics.has(tabId)) {
                        const button = newCard.querySelector('.advanced-metrics-toggle');
                        const metricsDiv = newCard.querySelector(`#advanced-${tabId}`);
                        const arrow = button?.querySelector('.toggle-arrow');
                        const label = button?.querySelector('.toggle-label');
                        
                        if (button && metricsDiv && arrow && label) {
                            metricsDiv.classList.add('expanded');
                            arrow.textContent = '▲';
                            label.textContent = 'Hide Advanced';
                            button.classList.add('expanded');
                        }
                    }
                }
            }
        });
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
                <!-- 🔥 NEW: Collapsible Tab Header -->
                <button class="tab-metric-toggle" data-tab-id="${tabId}">
                    <div class="tab-info">
                        ${favicon ? `<img class="tab-favicon" src="${favicon}" alt="">` : '<span class="tab-favicon-placeholder">🌐</span>'}
                        <div class="tab-details">
                            <div class="tab-title" title="${tabTitle}">${this.truncateText(tabTitle, 40)}</div>
                            <div class="tab-domain">${domain}</div>
                        </div>
                    </div>
                    <div class="tab-summary">
                        <div class="summary-metrics">
                            <span class="summary-metric memory">${memoryUsage}MB</span>
                            <span class="summary-metric cpu">${cpuUsage}%</span>
                            <span class="summary-metric impact ${resourceImpact}">${resourceImpact}</span>
                        </div>
                        <div class="tab-status">
                            ${isActive ? '<span class="status-badge active">Active</span>' : ''}
                            ${isAudible ? '<span class="status-badge audible">🔊</span>' : ''}
                            ${isHeavy ? '<span class="status-badge heavy">Heavy</span>' : ''}
                        </div>
                        <span class="toggle-arrow">▼</span>
                    </div>
                </button>
                
                <!-- 🔥 NEW: Collapsible Tab Content -->
                <div class="tab-metric-content" id="tab-content-${tabId}">
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
                        
                        ${this.createAdvancedMetrics(tabData, performance, heuristics, tabId)}
                        
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
                </div>
            </div>
        `;
    }

    /**
     * 🔥 ENHANCED: Update existing tab metric card values without rebuilding DOM
     */
    updateTabMetricCard(cardElement, tabId, tabData, currentTabs) {
        const { resources = {}, performance = {}, scoring = {}, heuristics = {}, timestamp = 0, browser = 'chrome', mode = 'heuristic' } = tabData;

        // Get tab info from current tabs
        const currentTab = currentTabs.find(tab => tab.id == tabId);
        const tabTitle = (currentTab && currentTab.title) || tabData.title || 'Unknown Tab';
        const tabUrl = (currentTab && currentTab.url) || tabData.url || '';
        const favicon = (currentTab && currentTab.favIconUrl) || '';

        // Calculate updated values
        const tabAge = this.calculateTabAge(timestamp);
        const memoryUsage = this.getTabMemoryUsage(tabData);
        const cpuUsage = this.getTabCpuUsage(tabData);
        const resourceImpact = scoring.impact || 'light';
        const domain = this.extractDomain(tabUrl);

        // Update tab info
        const tabTitleElement = cardElement.querySelector('.tab-title');
        const tabDomainElement = cardElement.querySelector('.tab-domain');
        const tabFaviconElement = cardElement.querySelector('.tab-favicon');
        
        if (tabTitleElement) tabTitleElement.textContent = this.truncateText(tabTitle, 40);
        if (tabDomainElement) tabDomainElement.textContent = domain;
        if (tabFaviconElement && favicon) tabFaviconElement.src = favicon;

        // Update summary metrics
        const memoryMetric = cardElement.querySelector('.summary-metric.memory');
        const cpuMetric = cardElement.querySelector('.summary-metric.cpu');
        const impactMetric = cardElement.querySelector('.summary-metric.impact');
        
        if (memoryMetric) memoryMetric.textContent = `${memoryUsage}MB`;
        if (cpuMetric) cpuMetric.textContent = `${cpuUsage}%`;
        if (impactMetric) {
            impactMetric.textContent = resourceImpact;
            impactMetric.className = `summary-metric impact ${resourceImpact}`;
        }

        // Update detailed metrics
        const detailedMemory = cardElement.querySelector('.metric-value.memory');
        const detailedCpu = cardElement.querySelector('.metric-value.cpu');
        const detailedAge = cardElement.querySelector('.metric-value.age');
        const detailedImpact = cardElement.querySelector('.metric-value.impact');
        
        if (detailedMemory) detailedMemory.textContent = `${memoryUsage}MB`;
        if (detailedCpu) detailedCpu.textContent = `${cpuUsage}%`;
        if (detailedAge) detailedAge.textContent = tabAge;
        if (detailedImpact) {
            detailedImpact.textContent = resourceImpact.toUpperCase();
            detailedImpact.className = `metric-value impact ${resourceImpact}`;
        }

        // Update status badges
        const isActive = performance.isActive || false;
        const isAudible = performance.isAudible || false;
        const isHeavy = resourceImpact === 'heavy' || memoryUsage > 100;

        const tabStatus = cardElement.querySelector('.tab-status');
        if (tabStatus) {
            tabStatus.innerHTML = `
                ${isActive ? '<span class="status-badge active">Active</span>' : ''}
                ${isAudible ? '<span class="status-badge audible">🔊</span>' : ''}
                ${isHeavy ? '<span class="status-badge heavy">Heavy</span>' : ''}
            `;
        }

        // Update card class for impact level
        cardElement.className = `tab-metric-card ${resourceImpact}`;

        // Update advanced metrics if they exist
        this.updateAdvancedMetrics(cardElement, tabData, performance, heuristics, tabId);
    }

    /**
     * 🔥 ENHANCED: Update advanced metrics values
     */
    updateAdvancedMetrics(cardElement, tabData, performance, heuristics, tabId) {
        const { resources = {}, browser = 'chrome', mode = 'heuristic' } = tabData;
        const advancedContainer = cardElement.querySelector(`#advanced-${tabId}`);
        
        if (!advancedContainer) return;

        // Update network metrics
        if (resources.networkBytes || resources.networkEstimate) {
            const networkValue = resources.networkBytes ? 
                `${Math.round(resources.networkBytes / 1024)}KB` : 
                `~${resources.networkEstimate}KB`;
            
            const networkMetric = advancedContainer.querySelector('.advanced-metric .advanced-value');
            if (networkMetric && networkMetric.closest('.advanced-metric').querySelector('.advanced-icon').textContent === '🌐') {
                networkMetric.textContent = networkValue;
            }
        }

        // Update complexity score
        if (heuristics.complexityScore) {
            const complexityMetrics = advancedContainer.querySelectorAll('.advanced-metric');
            complexityMetrics.forEach(metric => {
                if (metric.querySelector('.advanced-icon').textContent === '🧩') {
                    const valueElement = metric.querySelector('.advanced-value');
                    if (valueElement) valueElement.textContent = `${heuristics.complexityScore}/10`;
                }
            });
        }

        // Update load state
        if (performance.loadState) {
            const loadStateIcon = performance.loadState === 'complete' ? '✅' : '⏳';
            const loadStateMetrics = advancedContainer.querySelectorAll('.advanced-metric');
            loadStateMetrics.forEach(metric => {
                const iconElement = metric.querySelector('.advanced-icon');
                const labelElement = metric.querySelector('.advanced-label');
                if (labelElement && labelElement.textContent === 'State') {
                    iconElement.textContent = loadStateIcon;
                    const valueElement = metric.querySelector('.advanced-value');
                    if (valueElement) valueElement.textContent = performance.loadState;
                }
            });
        }

        // Update scan time
        const scanTime = tabData.scanTime ? new Date(tabData.scanTime).toLocaleTimeString() : 'Unknown';
        const scanTimeMetrics = advancedContainer.querySelectorAll('.advanced-metric');
        scanTimeMetrics.forEach(metric => {
            const labelElement = metric.querySelector('.advanced-label');
            if (labelElement && labelElement.textContent === 'Last Scan') {
                const valueElement = metric.querySelector('.advanced-value');
                if (valueElement) valueElement.textContent = scanTime;
            }
        });

        // Update tab age
        const tabAge = this.calculateTabAge(tabData.timestamp);
        const ageMetrics = advancedContainer.querySelectorAll('.advanced-metric');
        ageMetrics.forEach(metric => {
            const labelElement = metric.querySelector('.advanced-label');
            if (labelElement && labelElement.textContent === 'Opened') {
                const valueElement = metric.querySelector('.advanced-value');
                if (valueElement) valueElement.textContent = tabAge;
            }
        });
    }

    /**
     * Create advanced metrics section for tab (collapsible)
     */
    createAdvancedMetrics(tabData, performance, heuristics, tabId) {
        const { resources = {}, browser = 'chrome', mode = 'heuristic' } = tabData;
        
        // Build advanced metrics content
        let metricsContent = '';
        
        // Network metrics (if available)
        if (resources.networkBytes || resources.networkEstimate) {
            const networkValue = resources.networkBytes ? 
                `${Math.round(resources.networkBytes / 1024)}KB` : 
                `~${resources.networkEstimate}KB`;
            
            metricsContent += `
                <div class="advanced-metric">
                    <span class="advanced-icon">🌐</span>
                    <span class="advanced-label">Network</span>
                    <span class="advanced-value">${networkValue}</span>
                </div>
            `;
        }
        
        // Domain complexity (if available)
        if (heuristics.complexityScore) {
            metricsContent += `
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
            metricsContent += `
                <div class="advanced-metric">
                    <span class="advanced-icon">${loadStateIcon}</span>
                    <span class="advanced-label">State</span>
                    <span class="advanced-value">${performance.loadState}</span>
                </div>
            `;
        }
        
        // Browser optimization info
        if (heuristics.chromeOptimized) {
            metricsContent += `
                <div class="advanced-metric">
                    <span class="advanced-icon">🚀</span>
                    <span class="advanced-label">Optimized</span>
                    <span class="advanced-value">Chrome</span>
                </div>
            `;
        }

        // Tab age and scan time
        const tabAge = this.calculateTabAge(tabData.timestamp);
        const scanTime = tabData.scanTime ? new Date(tabData.scanTime).toLocaleTimeString() : 'Unknown';
        
        metricsContent += `
            <div class="advanced-metric">
                <span class="advanced-icon">⏰</span>
                <span class="advanced-label">Opened</span>
                <span class="advanced-value">${tabAge}</span>
            </div>
            <div class="advanced-metric">
                <span class="advanced-icon">🔍</span>
                <span class="advanced-label">Last Scan</span>
                <span class="advanced-value">${scanTime}</span>
            </div>
        `;
        
        // 🔥 NEW: Collapsible advanced metrics
        return `
            <div class="advanced-metrics-container">
                <button class="advanced-metrics-toggle" data-tab-id="${tabId}">
                    <span class="toggle-icon">📊</span>
                    <span class="toggle-label">Advanced Metrics</span>
                    <span class="toggle-arrow">▼</span>
                </button>
                <div class="advanced-metrics" id="advanced-${tabId}">
                    ${metricsContent}
                </div>
            </div>
        `;
    }

    /**
     * Setup tab metric action handlers
     */
    setupTabMetricActions(container) {
        const actionButtons = container.querySelectorAll('.tab-action-btn');
        actionButtons.forEach(button => this.setupTabActionButton(button));
    }

    /**
     * 🔥 ENHANCED: Setup action handlers for individual card
     */
    setupTabMetricActionsForCard(cardElement) {
        const actionButtons = cardElement.querySelectorAll('.tab-action-btn');
        actionButtons.forEach(button => this.setupTabActionButton(button));
    }

    /**
     * 🔥 ENHANCED: Setup individual action button
     */
    setupTabActionButton(button) {
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
                            // 🔥 FIXED: Don't refresh, just clean up states
                            this.expandedTabCards.delete(tabId.toString());
                            this.expandedAdvancedMetrics.delete(tabId.toString());
                            this.savePersistedStates();
                        }, 300);
                        break;
                        
                    case 'suspend':
                        button.disabled = true;
                        button.innerHTML = '<span class="action-icon">⏳</span><span class="action-text">Suspending...</span>';
                        
                        // For now, we'll just discard the tab (Chrome's built-in suspension)
                        await api.tabs.discard(tabId);
                        
                        button.innerHTML = '<span class="action-icon">✅</span><span class="action-text">Suspended</span>';
                        // 🔥 FIXED: Don't refresh, let natural updates handle it
                        setTimeout(() => {
                            button.disabled = false;
                            button.innerHTML = '<span class="action-icon">💤</span><span class="action-text">Suspend</span>';
                        }, 2000);
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
    
    // 🔥 NEW: Calculate memory usage for heavy tabs only
    calculateHeavyTabsMemory(heavyTabsArray) {
        return Math.round(heavyTabsArray.reduce((total, [tabId, tabData]) => {
            return total + this.getTabMemoryUsage(tabData);
        }, 0));
    }
    
    // 🔥 ENHANCED: Better tab age calculation with more accurate timestamps
    calculateTabAge(timestamp) {
        if (!timestamp) return 'Unknown';
        
        const now = Date.now();
        const diff = now - timestamp;
        
        // Handle negative timestamps (shouldn't happen but just in case)
        if (diff < 0) return 'Future tab?';
        
        // More granular time display
        if (diff < 30000) return 'Just opened'; // Less than 30 seconds
        if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`; // Less than 1 minute
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`; // Less than 1 hour
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`; // Less than 1 day
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`; // Less than 1 week
        
        // For very old tabs, show weeks
        const weeks = Math.floor(diff / 604800000);
        if (weeks === 1) return '1 week ago';
        if (weeks < 4) return `${weeks} weeks ago`;
        
        // For very old tabs, show months (approximate)
        const months = Math.floor(diff / (30 * 24 * 60 * 60 * 1000));
        if (months === 1) return '1 month ago';
        return `${months} months ago`;
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
     * 🔥 NEW: Setup collapsible tab card toggles
     */
    setupTabCardToggle(container) {
        const toggleButtons = container.querySelectorAll('.tab-metric-toggle');
        toggleButtons.forEach(button => this.setupTabCardToggleForCard(button.closest('.tab-metric-card')));
    }

    /**
     * 🔥 ENHANCED: Setup toggle for individual card
     */
    setupTabCardToggleForCard(cardElement) {
        const button = cardElement.querySelector('.tab-metric-toggle');
        if (!button) return;

        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const tabId = button.dataset.tabId;
            const contentDiv = cardElement.querySelector(`#tab-content-${tabId}`);
            const arrow = button.querySelector('.toggle-arrow');
            
            if (!contentDiv) return;
            
            const isExpanded = contentDiv.classList.contains('expanded');
            
            if (isExpanded) {
                // Collapse
                contentDiv.classList.remove('expanded');
                arrow.textContent = '▼';
                button.classList.remove('expanded');
                
                // 🔥 ENHANCED: Remember collapse state
                this.expandedTabCards.delete(tabId);
                this.savePersistedStates();
            } else {
                // Expand
                contentDiv.classList.add('expanded');
                arrow.textContent = '▲';
                button.classList.add('expanded');
                
                // 🔥 ENHANCED: Remember expand state
                this.expandedTabCards.add(tabId);
                this.savePersistedStates();
            }
        });
    }

    /**
     * 🔥 NEW: Setup collapsible advanced metrics toggles
     */
    setupAdvancedMetricsToggle(container) {
        const toggleButtons = container.querySelectorAll('.advanced-metrics-toggle');
        toggleButtons.forEach(button => this.setupAdvancedMetricsToggleForCard(button.closest('.tab-metric-card')));
    }

    /**
     * 🔥 ENHANCED: Setup advanced metrics toggle for individual card
     */
    setupAdvancedMetricsToggleForCard(cardElement) {
        const button = cardElement.querySelector('.advanced-metrics-toggle');
        if (!button) return;

        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const tabId = button.dataset.tabId;
            const metricsDiv = cardElement.querySelector(`#advanced-${tabId}`);
            const arrow = button.querySelector('.toggle-arrow');
            const label = button.querySelector('.toggle-label');
            
            if (!metricsDiv) return;
            
            const isExpanded = metricsDiv.classList.contains('expanded');
            
            if (isExpanded) {
                // Collapse
                metricsDiv.classList.remove('expanded');
                arrow.textContent = '▼';
                label.textContent = 'Advanced Metrics';
                button.classList.remove('expanded');
                
                // 🔥 ENHANCED: Remember collapse state
                this.expandedAdvancedMetrics.delete(tabId);
                this.savePersistedStates();
            } else {
                // Expand
                metricsDiv.classList.add('expanded');
                arrow.textContent = '▲';
                label.textContent = 'Hide Advanced';
                button.classList.add('expanded');
                
                // 🔥 ENHANCED: Remember expand state
                this.expandedAdvancedMetrics.add(tabId);
                this.savePersistedStates();
            }
        });
    }

    /**
     * 🔥 ENHANCED: Restore expanded states after data refresh for smooth UX
     */
    restoreExpandedStates(container) {
        // Restore expanded tab cards
        this.expandedTabCards.forEach(tabId => {
            const button = container.querySelector(`.tab-metric-toggle[data-tab-id="${tabId}"]`);
            const contentDiv = container.querySelector(`#tab-content-${tabId}`);
            const arrow = button?.querySelector('.toggle-arrow');
            
            if (button && contentDiv && arrow) {
                contentDiv.classList.add('expanded');
                arrow.textContent = '▲';
                button.classList.add('expanded');
            }
        });
        
        // Restore expanded advanced metrics
        this.expandedAdvancedMetrics.forEach(tabId => {
            const button = container.querySelector(`.advanced-metrics-toggle[data-tab-id="${tabId}"]`);
            const metricsDiv = container.querySelector(`#advanced-${tabId}`);
            const arrow = button?.querySelector('.toggle-arrow');
            const label = button?.querySelector('.toggle-label');
            
            if (button && metricsDiv && arrow && label) {
                metricsDiv.classList.add('expanded');
                arrow.textContent = '▲';
                label.textContent = 'Hide Advanced';
                button.classList.add('expanded');
            }
        });
    }

    /**
     * 🔥 ENHANCED: Load persisted expanded states from localStorage
     */
    loadPersistedStates() {
        try {
            const savedTabCards = localStorage.getItem('detailedMetrics_expandedTabCards');
            if (savedTabCards) {
                this.expandedTabCards = new Set(JSON.parse(savedTabCards));
            }
            
            const savedAdvancedMetrics = localStorage.getItem('detailedMetrics_expandedAdvancedMetrics');
            if (savedAdvancedMetrics) {
                this.expandedAdvancedMetrics = new Set(JSON.parse(savedAdvancedMetrics));
            }
        } catch (error) {
            console.warn('Failed to load persisted detailed metrics states:', error);
            this.expandedTabCards = new Set();
            this.expandedAdvancedMetrics = new Set();
        }
    }

    /**
     * 🔥 ENHANCED: Save expanded states to localStorage for persistence
     */
    savePersistedStates() {
        try {
            localStorage.setItem('detailedMetrics_expandedTabCards', JSON.stringify([...this.expandedTabCards]));
            localStorage.setItem('detailedMetrics_expandedAdvancedMetrics', JSON.stringify([...this.expandedAdvancedMetrics]));
        } catch (error) {
            console.warn('Failed to save detailed metrics states:', error);
        }
    }

    /**
     * 🔥 ENHANCED: Clean up expanded states for tabs that no longer exist
     */
    cleanupStaleStates(currentTabsArray) {
        const currentTabIds = new Set(currentTabsArray.map(([tabId]) => tabId));
        let statesChanged = false;
        
        // Clean up expanded tab cards for non-existent tabs
        for (const tabId of this.expandedTabCards) {
            if (!currentTabIds.has(tabId)) {
                this.expandedTabCards.delete(tabId);
                statesChanged = true;
            }
        }
        
        // Clean up expanded advanced metrics for non-existent tabs
        for (const tabId of this.expandedAdvancedMetrics) {
            if (!currentTabIds.has(tabId)) {
                this.expandedAdvancedMetrics.delete(tabId);
                statesChanged = true;
            }
        }
        
        // 🔥 ENHANCED: Save cleaned states if any changes made
        if (statesChanged) {
            this.savePersistedStates();
        }
    }

    /**
     * 🔥 NEW: Setup scroll indicator for better UX
     */
    setupScrollIndicator(container) {
        // Check if content overflows and add scroll indicator
        const checkScroll = () => {
            if (container.scrollHeight > container.clientHeight) {
                container.classList.add('has-scroll');
            } else {
                container.classList.remove('has-scroll');
            }
        };

        // Check initially and on resize
        setTimeout(checkScroll, 100); // Small delay to ensure content is rendered
        
        // Add resize observer for dynamic content changes
        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(checkScroll);
            resizeObserver.observe(container);
        }
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
        
        // 🔥 FIXED: Only update if expanded and content exists
        if (this.isExpanded) {
            const metricsContent = this.element.querySelector("#metrics-content");
            const existingContent = metricsContent?.querySelector('.tab-metrics-list');
            
            if (existingContent) {
                // Update existing content without loading state
                this.displayDetailedMetrics(resourceData, metricsContent);
            } else {
                // Load fresh if no content exists
                this.loadDetailedMetrics();
            }
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
        
        // 🔥 ENHANCED: Clean up expanded states on destroy
        this.expandedTabCards.clear();
        this.expandedAdvancedMetrics.clear();
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