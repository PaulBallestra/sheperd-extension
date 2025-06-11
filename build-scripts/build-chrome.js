// build-chrome.js
const fs = require('fs');
const path = require('path');

// Copy Firefox manifest
fs.copyFileSync(
    path.join(__dirname, '../manifest-chrome.json'),
    path.join(__dirname, '../manifest.json')
);

console.log('✅ Chrome build ready!');