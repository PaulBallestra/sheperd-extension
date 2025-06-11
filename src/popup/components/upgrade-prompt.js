// src/popup/components/upgrade-prompt.js
// Simplified upgrade prompt for a one-time purchase model.

import { licenseManager, MONETIZATION_EVENTS } from '../../utils/license.js';

// Configuration for the payment link
const PAYMENT_CONFIG = {
    // Replace this with your actual payment link from Stripe, Lemon Squeezy, or Gumroad
    PAYMENT_URL: 'https://buy.stripe.com/your-test-link',
    LEARN_MORE_URL: 'https://sheperd-tabs.com/pro-features' // A page explaining the pro features
};

class UpgradePrompt {
    constructor() {
        this.element = null;
        this.isVisible = false;
    }

    /**
     * Show upgrade prompt
     */
    show(reason = 'general', targetElement = document.body) {
        if (this.isVisible) return;

        const promptData = licenseManager.showUpgradePrompt(reason);
        this.render(promptData, targetElement);
        this.isVisible = true;
    }

    /**
     * Hide upgrade prompt
     */
    hide() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        this.isVisible = false;
    }

    /**
     * Render upgrade prompt
     */
    render(promptData, targetElement) {
        this.element = document.createElement('div');
        this.element.className = 'upgrade-prompt-overlay';

        this.element.innerHTML = `
            <div class="upgrade-prompt">
                <div class="upgrade-prompt__header">
                    <h3>Unlock Advanced Analytics & Support Sheperd</h3>
                    <button class="upgrade-prompt__close" data-action="dismiss">×</button>
                </div>
                
                <div class="upgrade-prompt__content">
                    <p>
                        Supercharge your productivity with historical insights and help support the future development of Sheperd.
                    </p>
                    
                    <div class="upgrade-prompt__features">
                        <div class="feature-item">
                            <span class="feature-icon">📈</span>
                            <span>Track browsing habits over time</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">🧠</span>
                            <span>Get personalized productivity scores</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">💾</span>
                            <span>Secure cloud backup & sync of your settings</span>
                        </div>
                         <div class="feature-item">
                            <span class="feature-icon">❤️</span>
                            <span>Directly support an independent developer</span>
                        </div>
                    </div>
                    
                    <div class="upgrade-prompt__cta">
                        <button class="btn btn--primary btn--full" data-action="purchase">
                            Unlock Pro Features (One-Time Payment)
                        </button>
                    </div>

                     <div class="upgrade-prompt__activate">
                        <a href="#" data-action="activate">Already have a license key?</a>
                    </div>
                </div>
                
                <div class="upgrade-prompt__footer">
                    <button class="btn btn--text" data-action="learn_more">
                        Learn More
                    </button>
                    <button class="btn btn--text" data-action="dismiss">
                        Maybe Later
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        this.bindEvents();

        // Add to DOM
        targetElement.appendChild(this.element);

        // Animate in
        requestAnimationFrame(() => {
            this.element.classList.add('upgrade-prompt-overlay--visible');
        });
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        const buttons = this.element.querySelectorAll('[data-action]');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const plan = e.target.dataset.plan;
                this.handleAction(action, plan);
            });
        });

        // Close on overlay click
        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) {
                this.handleAction('dismiss');
            }
        });
    }

    /**
     * Handle user actions
     */
    handleAction(action, plan = null) {
        switch (action) {
            case 'purchase':
                this.handlePurchase();
                break;
            case 'activate':
                this.showLicenseKeyInput();
                break;
            case 'learn_more':
                this.handleLearnMore();
                break;
            case 'dismiss':
                this.handleDismiss();
                break;
        }
    }

    /**
     * Handle the one-time purchase action
     */
    handlePurchase() {
        licenseManager.trackEvent(MONETIZATION_EVENTS.UPGRADE_PROMPT_CLICKED, { type: 'one_time_purchase' });

        // Open the payment link in a new tab
        chrome.tabs.create({ url: PAYMENT_CONFIG.PAYMENT_URL });
        this.hide();
    }

    /**
     * Show license key input (MVP version)
     */
    showLicenseKeyInput() {
        const content = this.element.querySelector('.upgrade-prompt__content');
        content.innerHTML = `
            <div class="license-activation">
                <h4>Activate Sheperd Pro</h4>
                <p>Enter the license key you received after your purchase.</p>
                <p class="license-hint">Your key starts with "SHEPERDPRO_".</p>
                
                <div class="license-input-group">
                    <input 
                        type="text" 
                        id="license-key" 
                        placeholder="Enter your license key"
                        class="license-input"
                    >
                    <button class="btn btn--primary" id="activate-license">
                        Activate
                    </button>
                </div>
                
                <div class="license-status" id="license-status"></div>
                <div class="upgrade-prompt__activate">
                    <a href="#" data-action="back">Back to purchase options</a>
                </div>
            </div>
        `;

        // Bind activation
        const activateBtn = content.querySelector('#activate-license');
        const licenseInput = content.querySelector('#license-key');
        const statusDiv = content.querySelector('#license-status');

        activateBtn.addEventListener('click', async() => {
            const key = licenseInput.value.trim();
            if (!key) return;

            activateBtn.textContent = 'Activating...';
            activateBtn.disabled = true;

            const result = await licenseManager.activatePro(key);

            if (result.success) {
                this.showActivationSuccess(result.message);
            } else {
                statusDiv.innerHTML = `<div class="error">${result.message}</div>`;
                activateBtn.textContent = 'Activate';
                activateBtn.disabled = false;
            }
        });

        // Enter key activation
        licenseInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                activateBtn.click();
            }
        });

        // Handle 'back' link
        content.querySelector('[data-action="back"]').addEventListener('click', (e) => {
            e.preventDefault();
            this.show('general', this.element.parentElement);
        });
    }

    /**
     * Show activation success
     */
    showActivationSuccess(message) {
        const content = this.element.querySelector('.upgrade-prompt__content');
        content.innerHTML = `
            <div class="activation-success">
                <div class="success-icon">🎉</div>
                <h4>Welcome to Sheperd Pro!</h4>
                <p>${message}</p>
                <p>All Pro features are now unlocked. Enjoy unlimited tab management!</p>
                <button class="btn btn--primary" id="reload-extension">
                    Reload Extension
                </button>
            </div>
        `;

        // Auto-reload extension to apply Pro features
        content.querySelector('#reload-extension').addEventListener('click', () => {
            chrome.runtime.reload();
        });

        // Auto-close and reload after 3 seconds
        setTimeout(() => {
            chrome.runtime.reload();
        }, 3000);
    }

    /**
     * Handle learn more action
     */
    handleLearnMore() {
        licenseManager.trackEvent(MONETIZATION_EVENTS.UPGRADE_PROMPT_CLICKED, { action: 'learn_more' });

        // Open features page or show more details
        chrome.tabs.create({
            url: PAYMENT_CONFIG.LEARN_MORE_URL
        });

        this.hide();
    }

    /**
     * Handle dismiss action
     */
    handleDismiss() {
        licenseManager.trackEvent(MONETIZATION_EVENTS.UPGRADE_PROMPT_DISMISSED);
        this.hide();
    }
}

// Create singleton instance
export const upgradePrompt = new UpgradePrompt();

// Export class for other uses
export { UpgradePrompt };