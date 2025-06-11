// build-chrome.js
const fs = require('fs');
const path = require('path');

// Copy Chrome manifest
fs.copyFileSync(
    path.join(__dirname, '../manifest-chrome.json'),
    path.join(__dirname, '../manifest.json')
);

// Copy unified background script
fs.copyFileSync(
    path.join(__dirname, '../background-unified.js'),
    path.join(__dirname, '../background.js')
);

console.log('✅ Chrome build ready!');