const fs = require('fs');
const path = require('path');

// Directories to create
const directories = [
  '/var/data/uploads/images',
  '/var/data/uploads/conferences',
  '/var/data/uploads/profile-images'
];

// Create directories if they don't exist
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});
