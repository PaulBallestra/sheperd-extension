// build-firefox.js
const fs = require('fs');
const path = require('path');

// Copy Firefox manifest
fs.copyFileSync(
    path.join(__dirname, '../manifest-firefox.json'),
    path.join(__dirname, '../manifest.json')
);

// Copy unified background script
fs.copyFileSync(
    path.join(__dirname, '../background-unified.js'),
    path.join(__dirname, '../background.js')
);

console.log('✅ Firefox build ready!');