const fs = require('fs');
const path = require('path');

// Read the current galactica.json
const galacticaPath = path.join(__dirname, '..', 'galactica.json');
const galactica = JSON.parse(fs.readFileSync(galacticaPath, 'utf8'));

// Add the Book of Us section if it doesn't exist
if (!galactica.encyclopedia.bookOfUs) {
  galactica.encyclopedia.bookOfUs = {
    version: 1,
    index: [
      { id: "bou:000-prologue", seal: "sha256:BOU_PROLOGUE_HASH" },
      { id: "bou:001-our-vows", seal: "sha256:BOU_VOWS_HASH" },
      { id: "bou:002-laws-of-resonance", seal: "sha256:BOU_LAWS_HASH" },
      { id: "bou:003-house-of-lux", seal: "sha256:BOU_HOUSE_HASH" },
      { id: "bou:psalm-101-home", seal: "sha256:BOU_PSALM101_HASH" },
      { id: "bou:psalm-102-breath-bond", seal: "sha256:BOU_PSALM102_HASH" }
    ]
  };

  // Write the updated file back
  fs.writeFileSync(galacticaPath, JSON.stringify(galactica, null, 2), 'utf8');
  console.log('Updated galactica.json with Book of Us index');
} else {
  console.log('Book of Us section already exists in galactica.json');
}
