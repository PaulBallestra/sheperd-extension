// src/popup/components/upgrade-prompt.js
// Upgrade prompt component for Sheperd Pro

import { licenseManager, MONETIZATION_EVENTS } from '../../utils/license.js';

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
                    <h3>${promptData.title}</h3>
                    <button class="upgrade-prompt__close" data-action="dismiss">×</button>
                </div>
                
                <div class="upgrade-prompt__content">
                    <p>${promptData.message}</p>
                    
                    <div class="upgrade-prompt__features">
                        <div class="feature-item">
                            <span class="feature-icon">🎯</span>
                            <span>All 12+ categories unlocked</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">⚡</span>
                            <span>Unlimited tab management</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">📊</span>
                            <span>Advanced analytics & insights</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">📤</span>
                            <span>Export to bookmarks/Notion</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">🎨</span>
                            <span>Custom themes & settings</span>
                        </div>
                    </div>
                    
                    <div class="upgrade-prompt__pricing">
                        <div class="pricing-option pricing-option--popular">
                            <div class="pricing-badge">Most Popular</div>
                            <div class="pricing-title">Pro Monthly</div>
                            <div class="pricing-price">$${promptData.pricing.PRO_MONTHLY}/month</div>
                            <button class="btn btn--primary" data-action="upgrade" data-plan="monthly">
                                Start Pro Monthly
                            </button>
                        </div>
                        
                        <div class="pricing-option">
                            <div class="pricing-title">Pro Yearly</div>
                            <div class="pricing-price">$${promptData.pricing.PRO_YEARLY}/year</div>
                            <div class="pricing-save">Save 17%</div>
                            <button class="btn btn--secondary" data-action="upgrade" data-plan="yearly">
                                Start Pro Yearly
                            </button>
                        </div>
                        
                        <div class="pricing-option pricing-option--founder">
                            <div class="pricing-badge">Limited Time</div>
                            <div class="pricing-title">Founder's Edition</div>
                            <div class="pricing-price">$${promptData.pricing.FOUNDER_EDITION}</div>
                            <div class="pricing-save">Lifetime Access</div>
                            <button class="btn btn--founder" data-action="upgrade" data-plan="founder">
                                Get Founder's Edition
                            </button>
                        </div>
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
            case 'upgrade':
                this.handleUpgrade(plan);
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
     * Handle upgrade action
     */
    handleUpgrade(plan) {
        licenseManager.trackEvent(MONETIZATION_EVENTS.UPGRADE_PROMPT_CLICKED, { plan });

        if (plan === 'founder') {
            // Special handling for founder's edition
            this.showFounderActivation();
        } else {
            // Open payment page or show payment form
            this.openPaymentPage(plan);
        }
    }

    /**
     * Show founder's edition activation
     */
    showFounderActivation() {
        const founderKey = licenseManager.generateFounderKey();

        // For MVP, auto-activate founder's edition
        // In production, you'd collect payment first
        licenseManager.activatePro(founderKey, 'founder').then(result => {
            if (result.success) {
                this.showActivationSuccess('Founder\'s Edition activated! 🎉');
            } else {
                this.showActivationError(result.message);
            }
        });
    }

    /**
     * Open payment page
     */
    openPaymentPage(plan) {
        // For MVP, show simple license key input
        // In production, integrate with Stripe/payment processor
        this.showLicenseKeyInput(plan);
    }

    /**
     * Show license key input (MVP version)
     */
    showLicenseKeyInput(plan) {
        const content = this.element.querySelector('.upgrade-prompt__content');
        content.innerHTML = `
            <div class="license-activation">
                <h4>Activate Sheperd Pro</h4>
                <p>For early access, use any key starting with "SHEPERD_"</p>
                <p class="license-hint">Try: <code>SHEPERD_EARLY_ACCESS</code></p>
                
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
     * Show activation error
     */
    showActivationError(message) {
        const statusDiv = this.element.querySelector('#license-status');
        if (statusDiv) {
            statusDiv.innerHTML = `<div class="error">${message}</div>`;
        }
    }

    /**
     * Handle learn more action
     */
    handleLearnMore() {
        licenseManager.trackEvent(MONETIZATION_EVENTS.UPGRADE_PROMPT_CLICKED, { action: 'learn_more' });

        // Open features page or show more details
        chrome.tabs.create({
            url: 'https://sheperd-tabs.com/pro-features' // Update with your actual URL
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