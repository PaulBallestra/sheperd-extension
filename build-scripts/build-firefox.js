// build-firefox.js
const fs = require('fs');
const path = require('path');

// Copy Firefox manifest
fs.copyFileSync(
    path.join(__dirname, '../manifest-firefox.json'),
    path.join(__dirname, '../manifest.json')
);

console.log('✅ Firefox build ready!');