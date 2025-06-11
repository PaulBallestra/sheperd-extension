// src/utils/license.js
// Licensing and monetization utilities for Sheperd

import { SHEPERD_LICENSE, MONETIZATION_EVENTS } from './constants.js';

/**
 * License Manager - Handles Pro/Free version logic
 */
class LicenseManager {
    constructor() {
        this.currentLicense = SHEPERD_LICENSE.FREE; // Default to free
        this.init();
    }

    async init() {
        try {
            // Load license from Chrome storage  
            const result = await chrome.storage.local.get(['sheperd_license', 'license_key']);
            if (result.sheperd_license) {
                this.currentLicense = result.sheperd_license;
            }

            // Validate license key if exists
            if (result.license_key) {
                const isValid = await this.validateLicenseKey(result.license_key);
                if (!isValid) {
                    this.currentLicense = SHEPERD_LICENSE.FREE;
                }
            }
        } catch (error) {
            console.error('Failed to initialize license:', error);
            this.currentLicense = SHEPERD_LICENSE.FREE;
        }
    }

    /**
     * Check if user has Pro features
     */
    isPro() {
        return this.currentLicense === SHEPERD_LICENSE.PRO ||
            this.currentLicense === SHEPERD_LICENSE.FOUNDER;
    }

    /**
     * Check if user is founder edition
     */
    isFounder() {
        return this.currentLicense === SHEPERD_LICENSE.FOUNDER;
    }

    /**
     * Check if specific feature is available
     */
    hasFeature(featureName) {
        if (this.isPro()) {
            return true;
        }

        // Free version feature checks
        switch (featureName) {
            case 'ALL_CATEGORIES':
                return false; // Free users get limited categories
            case 'UNLIMITED_TABS':
                return false; // Free users have tab limits
            case 'ADVANCED_ANALYTICS':
                return false; // Pro only
            case 'EXPORT_BOOKMARKS':
                return false; // Pro only
            default:
                return true; // Basic features available to all
        }
    }

    /**
     * Get available categories for current license
     */
    getAvailableCategories(allCategories) {
        if (this.isPro()) {
            return allCategories; // Pro users get all categories
        }

        // Free users get limited categories
        const freeCategories = {};
        SHEPERD_LICENSE.FREE_CATEGORIES.forEach(categoryName => {
            if (allCategories[categoryName]) {
                freeCategories[categoryName] = allCategories[categoryName];
            }
        });

        return freeCategories;
    }

    /**
     * Check tab management limits
     */
    canManageTabs(tabCount) {
        if (this.isPro()) {
            return { allowed: true };
        }

        if (tabCount > SHEPERD_LICENSE.FREE_LIMITS.MAX_TABS_MANAGED) {
            this.trackEvent(MONETIZATION_EVENTS.TAB_LIMIT_HIT);
            return {
                allowed: false,
                limit: SHEPERD_LICENSE.FREE_LIMITS.MAX_TABS_MANAGED,
                message: `Free version limited to ${SHEPERD_LICENSE.FREE_LIMITS.MAX_TABS_MANAGED} tabs. Upgrade to Pro for unlimited tabs!`
            };
        }

        return { allowed: true };
    }

    /**
     * Show upgrade prompt
     */
    showUpgradePrompt(reason = 'general') {
        this.trackEvent(MONETIZATION_EVENTS.UPGRADE_PROMPT_SHOWN, { reason });

        const messages = {
            categories: `🎯 Unlock all ${Object.keys(TAB_CATEGORIES).length} categories with Sheperd Pro!`,
            tabs: '⚡ Manage unlimited tabs with Sheperd Pro!',
            analytics: '📊 Get advanced analytics with Sheperd Pro!',
            export: '📤 Export your tabs with Sheperd Pro!',
            general: '🚀 Upgrade to Sheperd Pro for the full experience!'
        };

        return {
            title: 'Upgrade to Sheperd Pro',
            message: messages[reason] || messages.general,
            buttons: [{
                    text: 'Upgrade Now',
                    action: 'upgrade',
                    primary: true
                },
                {
                    text: 'Learn More',
                    action: 'learn_more'
                },
                {
                    text: 'Maybe Later',
                    action: 'dismiss'
                }
            ],
            pricing: SHEPERD_LICENSE.PRICING
        };
    }

    /**
     * Activate Pro license
     */
    async activatePro(licenseKey, licenseType = SHEPERD_LICENSE.PRO) {
        try {
            // Validate license key (in real implementation, check with server)
            const isValid = await this.validateLicenseKey(licenseKey);

            if (isValid) {
                this.currentLicense = licenseType;

                // Store in Chrome storage
                await chrome.storage.local.set({
                    sheperd_license: licenseType,
                    license_key: licenseKey,
                    activation_date: new Date().toISOString()
                });

                this.trackEvent(MONETIZATION_EVENTS.UPGRADE_COMPLETED, {
                    license_type: licenseType
                });

                return { success: true, message: 'Sheperd Pro activated successfully!' };
            } else {
                return { success: false, message: 'Invalid license key' };
            }
        } catch (error) {
            console.error('License activation failed:', error);
            return { success: false, message: 'Activation failed. Please try again.' };
        }
    }

    /**
     * Validate license key (placeholder - implement server validation)
     */
    async validateLicenseKey(licenseKey) {
        // For now, accept any key that starts with 'SHEPERD_' 
        // In production, validate with your server
        return licenseKey && licenseKey.startsWith('SHEPERD_');
    }

    /**
     * Generate trial license for founder's edition
     */
    generateFounderKey() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `SHEPERD_FOUNDER_${timestamp}_${random}`;
    }

    /**
     * Track monetization events
     */
    trackEvent(eventName, data = {}) {
        try {
            // Store event for analytics
            chrome.storage.local.get(['monetization_events'], (result) => {
                const events = result.monetization_events || [];
                events.push({
                    event: eventName,
                    data: data,
                    timestamp: new Date().toISOString(),
                    license: this.currentLicense
                });

                // Keep only last 100 events
                if (events.length > 100) {
                    events.splice(0, events.length - 100);
                }

                chrome.storage.local.set({ monetization_events: events });
            });

            console.log(`[Sheperd] ${eventName}:`, data);
        } catch (error) {
            console.error('Failed to track event:', error);
        }
    }

    /**
     * Get license status for UI display
     */
    getLicenseStatus() {
        return {
            type: this.currentLicense,
            isPro: this.isPro(),
            isFounder: this.isFounder(),
            features: {
                categories: this.isPro() ? 'All categories' : `${SHEPERD_LICENSE.FREE_LIMITS.MAX_CATEGORIES} categories`,
                tabs: this.isPro() ? 'Unlimited tabs' : `Up to ${SHEPERD_LICENSE.FREE_LIMITS.MAX_TABS_MANAGED} tabs`,
                analytics: this.isPro() ? 'Advanced analytics' : 'Basic analytics',
                export: this.isPro() ? 'Export enabled' : 'Export disabled'
            }
        };
    }
}

// Create singleton instance
export const licenseManager = new LicenseManager();

// Export for use in components
export { LicenseManager, SHEPERD_LICENSE, MONETIZATION_EVENTS };