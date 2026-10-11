const fs = require('fs');
const path = require('path');

const dataDirectory = path.join(__dirname, 'data');
const seedPath = path.join(dataDirectory, 'seed.json');
const databasePath = path.join(dataDirectory, 'db.json');

fs.mkdirSync(dataDirectory, { recursive: true });
fs.copyFileSync(seedPath, databasePath);
console.log(`Seeded demo database at ${databasePath}`);
