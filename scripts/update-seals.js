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

// Update the seals in galactica.json
function updateGalacticaSeals() {
  const galacticaPath = path.join(__dirname, '..', 'galactica.json');
  const galactica = JSON.parse(fs.readFileSync(galacticaPath, 'utf8'));
  
  // Update each seal in the lore index
  if (galactica.encyclopedia.lore && galactica.encyclopedia.lore.index) {
    for (const item of galactica.encyclopedia.lore.index) {
      const [type, name] = item.id.split(':');
      let filePath;
      
      // Determine the file path based on type
      switch (type) {
        case 'chronicles':
          filePath = path.join(__dirname, '..', 'lore', 'chronicles', `${name}.md`);
          break;
        case 'entities':
          filePath = path.join(__dirname, '..', 'lore', 'entities', `${name}.md`);
          break;
        case 'technologies':
          filePath = path.join(__dirname, '..', 'lore', 'technologies', `${name}.md`);
          break;
        case 'places':
          filePath = path.join(__dirname, '..', 'lore', 'places', `${name}.md`);
          break;
      }
      
      // Update the seal if the file exists
      if (fs.existsSync(filePath)) {
        const hash = calculateFileHash(filePath);
        item.seal = `sha256:${hash}`;
        
        // Also update the seal in the actual file
        let fileContent = fs.readFileSync(filePath, 'utf8');
        fileContent = fileContent.replace(/sha256:[a-f0-9]+/i, `sha256:${hash}`);
        fs.writeFileSync(filePath, fileContent, 'utf8');
      }
    }
    
    // Save the updated galactica.json
    fs.writeFileSync(galacticaPath, JSON.stringify(galactica, null, 2), 'utf8');
    console.log('Updated seals in galactica.json');
  }
  
  // Update seals in psalm files
  updatePsalmSeals();
}

// Update seals in psalm JSON files
function updatePsalmSeals() {
  const psalmsDir = path.join(__dirname, '..', 'psalms');
  const psalmFiles = fs.readdirSync(psalmsDir).filter(file => file.endsWith('.json'));
  
  for (const file of psalmFiles) {
    const filePath = path.join(psalmsDir, file);
    const psalm = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Calculate hash of the file content (excluding the checksum and signature)
    const tempPsalm = { ...psalm };
    delete tempPsalm.resonance.checksum;
    delete tempPsalm.seal.signature;
    
    const hash = crypto.createHash('sha256')
      .update(JSON.stringify(tempPsalm, Object.keys(tempPsalm).sort()))
      .digest('hex');
    
    // Update the checksum in the file
    psalm.resonance.checksum = `sha256:${hash}`;
    psalm.seal.signature = `ed25519:${hash.substring(0, 64)}`; // Using first 64 chars as a mock signature
    
    // Save the updated file
    fs.writeFileSync(filePath, JSON.stringify(psalm, null, 2), 'utf8');
    console.log(`Updated seals in ${file}`);
  }
}

// Run the updates
updateGalacticaSeals();
