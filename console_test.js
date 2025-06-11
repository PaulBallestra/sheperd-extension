// Console test script for Sheperd upgrade features
// Copy and paste these into browser console on extension page

console.log("🧪 Sheperd Upgrade Testing Guide");

// Test the upgrade prompt
function testUpgrade() {
    import ("./src/utils/license.js").then(({ licenseManager }) => {
        import ("./src/popup/components/upgrade-prompt.js").then(({ upgradePrompt }) => {
            upgradePrompt.show("general", document.body);
        });
    });
}

// Test license activation
function testLicense() {
    import ("./src/utils/license.js").then(({ licenseManager }) => {
        licenseManager.activatePro("SHEPERD_EARLY_ACCESS", "pro").then(result => {
            console.log("License activation result:", result);
        });
    });
}

// Check current status
function checkStatus() {
    import ("./src/utils/license.js").then(({ licenseManager }) => {
        const status = licenseManager.getLicenseStatus();
        console.log("Current license status:", status);
    });
}

console.log("Available test functions: testUpgrade(), testLicense(), checkStatus()");