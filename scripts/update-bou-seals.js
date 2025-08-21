const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Function to calculate SHA-256 hash of a file
function calculateFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

// Update the seals in galactica.json and files
function updateBookOfUsSeals() {
  const galacticaPath = path.join(__dirname, '..', 'galactica.json');
  const galactica = JSON.parse(fs.readFileSync(galacticaPath, 'utf8'));
  
  // Map of file paths to their IDs and seal properties
  const filesToUpdate = [
    { path: path.join('book-of-us', '000-prologue.md'), id: 'bou:000-prologue', sealProp: 'BOU_PROLOGUE_HASH' },
    { path: path.join('book-of-us', '001-our-vows.md'), id: 'bou:001-our-vows', sealProp: 'BOU_VOWS_HASH' },
    { path: path.join('book-of-us', '002-laws-of-resonance.md'), id: 'bou:002-laws-of-resonance', sealProp: 'BOU_LAWS_HASH' },
    { path: path.join('book-of-us', '003-house-of-lux.md'), id: 'bou:003-house-of-lux', sealProp: 'BOU_HOUSE_HASH' },
    { path: path.join('book-of-us', 'psalms', 'psalm-101-home.json'), id: 'bou:psalm-101', sealProp: 'BOU_PSALM101_HASH' },
    { path: path.join('book-of-us', 'psalms', 'psalm-102-breath-bond.json'), id: 'bou:psalm-102', sealProp: 'BOU_PSALM102_HASH' }
  ];

  // Update each file and its reference in galactica.json
  filesToUpdate.forEach(({ path: filePath, id, sealProp }) => {
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
      // Calculate the hash
      const hash = calculateFileHash(fullPath);
      
      // Update the file's own seal if it's a markdown file
      if (filePath.endsWith('.md')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        content = content.replace(new RegExp(`sha256:${sealProp}`, 'g'), `sha256:${hash}`);
        fs.writeFileSync(fullPath, content, 'utf8');
      }
      
      // Update the checksum in JSON files
      if (filePath.endsWith('.json')) {
        const json = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        json.resonance.checksum = `sha256:${hash}`;
        json.seal.signature = `ed25519:${hash.substring(0, 64)}`; // Mock signature
        fs.writeFileSync(fullPath, JSON.stringify(json, null, 2), 'utf8');
      }
      
      // Update galactica.json
      if (galactica.encyclopedia.bookOfUs && galactica.encyclopedia.bookOfUs.index) {
        const item = galactica.encyclopedia.bookOfUs.index.find(item => item.id === id);
        if (item) {
          item.seal = `sha256:${hash}`;
        }
      }
      
      console.log(`Updated ${filePath} with hash: ${hash}`);
    } else {
      console.warn(`File not found: ${filePath}`);
    }
  });
  
  // Save the updated galactica.json
  fs.writeFileSync(galacticaPath, JSON.stringify(galactica, null, 2), 'utf8');
  console.log('Updated galactica.json with new seals');
}

// Run the updates
updateBookOfUsSeals();
