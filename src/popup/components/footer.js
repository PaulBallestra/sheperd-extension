// src/popup/components/footer.js
// Footer component for Sheperd

class FooterComponent {
    constructor() {
        this.element = null;
    }

    /**
     * Initialize and render the footer component
     * @param {HTMLElement} container - The container to append the footer to.
     */
    init(container) {
        if (!container) {
            console.error("FooterComponent requires a container to render.");
            return;
        }
        this.render(container);
        this.bindEvents();
    }

    /**
     * Render the footer component
     * @param {HTMLElement} container - The container to append the footer to.
     */
    render(container) {
        this.element = document.createElement("div");
        this.element.className = "footer";
        this.element.innerHTML = `
            <!-- Future buttons can be added here -->
            
            <!--
            <button id="settings-btn" class="text-btn" title="Open settings">⚙️ Settings</button>
            <button id="upgrade-btn" class="text-btn premium">💎 Upgrade</button>
            -->

            <div class="footer-info">
                <span class="version">v1.0.0</span>
                <span class="separator">•</span>
                <a href="https://liberapay.com/Syd/donate" target="_blank" class="footer-link" title="Support the developer">Donate</a>
                <span class="separator">•</span>
                <span class="branding">Sheperd</span>
            </div>
        `;
        container.appendChild(this.element);
    }

    /**
     * Bind events for the footer component
     */
    bindEvents() {
        // No interactive elements in the footer yet, but this is here for future use.
        // Footer button events
        // document.getElementById("settings-btn").addEventListener("click", () => {
        //     this.openSettings();
        // });

        // document.getElementById("upgrade-btn").addEventListener("click", () => {
        //     this.openUpgrade();
        // });
    }
}

// Create and export a singleton instance
export const footerComponent = new FooterComponent();
export { FooterComponent };