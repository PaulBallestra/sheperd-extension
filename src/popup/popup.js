// src/popup/popup.js
// Main Popup Application - Orchestrates all components

import { SHEPHERD_EVENTS, SHEPHERD_CONFIG } from '../utils/constants.js';
import { tabsManager } from '../utils/tabs.js';
import { tabCategorizer } from '../utils/categorizer.js';

import { headerComponent } from './components/header.js';
import { shepherdMeterComponent } from './components/shepherd-meter.js';
import { categoriesComponent } from './components/categories.js';
import { quickActionsComponent } from './components/quick-actions.js';

/**
 * Main Shepherd Popup Application
 * Orchestrates all components and manages application state
 */
class ShepherdPopupApp {
  constructor() {
    this.isInitialized = false;
    this.isLoading = false;
    this.currentTabs = [];
    this.categorizedTabs = {};
    
    // Component references
    this.components = {
      header: headerComponent,
      shepherdMeter: shepherdMeterComponent,
      categories: categoriesComponent,
      quickActions: quickActionsComponent
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
      console.log('🐑 Initializing Shepherd Popup...');
      
      this.showLoading(true, 'Loading your tabs...');
      
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
      
      console.log('✅ Shepherd Popup initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Shepherd Popup:', error);
      this.showError('Failed to load Shepherd. Please try again.');
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
    body.innerHTML = '';
    
    // Create main container
    const mainContainer = document.createElement('div');
    mainContainer.className = 'shepherd-popup';
    
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
    this.footerElement = document.createElement('div');
    this.footerElement.className = 'footer';
    
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
        <span class="branding">Shepherd</span>
      </div>
    `;
  }

  /**
   * Create loading overlay
   */
  createLoadingOverlay() {
    this.loadingElement = document.createElement('div');
    this.loadingElement.className = 'loading hidden';
    this.loadingElement.id = 'loading';
    
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
    this.errorElement = document.createElement('div');
    this.errorElement.className = 'error-container hidden';
    this.errorElement.id = 'error-container';
    
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
    document.getElementById('settings-btn')?.addEventListener('click', () => {
      this.openSettings();
    });

    document.getElementById('upgrade-btn')?.addEventListener('click', () => {
      this.openUpgrade();
    });

    // Error retry button
    this.errorElement.querySelector('.error-retry-btn')?.addEventListener('click', () => {
      this.retry();
    });

    // Global error handler
    document.addEventListener(SHEPHERD_EVENTS.ERROR_OCCURRED, (event) => {
      this.handleError(event.detail);
    });

    // Loading state handlers
    document.addEventListener(SHEPHERD_EVENTS.LOADING_STARTED, (event) => {
      this.showLoading(true, event.detail.message);
    });

    document.addEventListener(SHEPHERD_EVENTS.LOADING_FINISHED, () => {
      this.showLoading(false);
    });

    // Tab update handler
    document.addEventListener(SHEPHERD_EVENTS.TABS_UPDATED, async (event) => {
      if (event.detail.action !== 'refresh') {
        await this.loadTabs(); // Refresh data after tab operations
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      this.handleKeyboardShortcuts(event);
    });

    // Auto-refresh tabs periodically
    this.startAutoRefresh();
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
      this.dispatchEvent(SHEPHERD_EVENTS.TABS_UPDATED, {
        tabs: this.currentTabs,
        categorizedTabs: this.categorizedTabs,
        count: this.currentTabs.length,
        action: 'refresh'
      });
      
      console.log(`📊 Loaded ${this.currentTabs.length} tabs in ${Object.keys(this.categorizedTabs).length} categories`);
      
    } catch (error) {
      console.error('Failed to load tabs:', error);
      throw new Error(`Failed to load tabs: ${error.message}`);
    }
  }

  /**
   * Render all components to the main container
   */
  renderComponents() {
    const mainContainer = document.querySelector('.shepherd-popup');
    if (!mainContainer) return;

    // Clear existing content
    mainContainer.innerHTML = '';

    // Render components in order
    this.components.header.render(mainContainer);
    this.components.shepherdMeter.render(mainContainer);
    this.components.categories.render(mainContainer);
    this.components.quickActions.render(mainContainer);
  }

  /**
   * Show/hide loading overlay
   * @param {boolean} show - Show loading
   * @param {string} message - Loading message
   */
  showLoading(show, message = 'Loading...') {
    if (!this.loadingElement) return;

    this.isLoading = show;
    
    if (show) {
      this.loadingElement.querySelector('.loading-message').textContent = message;
      this.loadingElement.classList.remove('hidden');
    } else {
      this.loadingElement.classList.add('hidden');
    }
  }

  /**
   * Show error state
   * @param {string} message - Error message
   */
  showError(message) {
    if (!this.errorElement) return;

    this.errorElement.querySelector('.error-message').textContent = message;
    this.errorElement.classList.remove('hidden');
    this.showLoading(false);
  }

  /**
   * Hide error state
   */
  hideError() {
    if (!this.errorElement) return;
    this.errorElement.classList.add('hidden');
  }

  /**
   * Handle application errors
   * @param {Object} errorData - Error information
   */
  handleError(errorData) {
    console.error('Application error:', errorData);
    
    let message = 'An unexpected error occurred';
    
    if (errorData.error) {
      message = errorData.error;
    } else if (errorData.action) {
      message = `Failed to ${errorData.action.replace('_', ' ')}`;
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
    if (event.key === 'Escape') {
      window.close();
    }
    
    // Ctrl/Cmd + R - refresh
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
      event.preventDefault();
      this.loadTabs();
    }
    
    // Ctrl/Cmd + D - close duplicates
    if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
      event.preventDefault();
      document.getElementById('close-duplicates')?.click();
    }
  }

  /**
   * Start auto-refresh of tab data
   */
  startAutoRefresh() {
    // Refresh every 30 seconds
    setInterval(async () => {
      if (!this.isLoading && this.isInitialized) {
        try {
          await this.loadTabs();
        } catch (error) {
          console.warn('Auto-refresh failed:', error);
        }
      }
    }, 30000);
  }

  /**
   * Open settings
   */
  openSettings() {
    // For now, just show a message
    // In Phase 2, this would open a settings page
    alert('Settings coming in Shepherd Pro! ⚙️\n\nUpgrade to access advanced customization options.');
  }

  /**
   * Open upgrade page
   */
  openUpgrade() {
    // Open upgrade page (would be actual URL in production)
    const upgradeUrl = 'https://shepherd-tabs.com/upgrade';
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
      isLoading: this.isLoading
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
    Object.values(this.components).forEach(component => {
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
let shepherdApp = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    shepherdApp = new ShepherdPopupApp();
    await shepherdApp.init();
  });
} else {
  // DOM is already ready
  shepherdApp = new ShepherdPopupApp();
  shepherdApp.init();
}

// Export for debugging/testing
if (typeof window !== 'undefined') {
  window.shepherdApp = shepherdApp;
}

export default ShepherdPopupApp; 