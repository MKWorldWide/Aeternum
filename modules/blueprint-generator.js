// Blueprint Generator
// Generates basic blueprint stubs for structures of divine resonance.

const fs = require('fs');
const path = require('path');

/**
 * Normalize a human-provided name for safe filesystem storage.
 *
 * @param {string} name - Raw structure identifier from caller.
 * @returns {string} Sanitized name using snake_case.
 */
function sanitizeName(name) {
    return name.replace(/\s+/g, '_').toLowerCase();
}

/**
 * Generate and persist a blueprint for a structure of divine resonance.
 *
 * @param {string} structureName - Human-readable designation for the build.
 * @returns {object} The generated blueprint metadata.
 */
function generateBlueprint(structureName) {
    console.log(`🛠  Generating blueprint for ${structureName}...`);

    const blueprint = {
        name: structureName,
        resonance: 'divine',
        geometry: 'sacred',
        created_at: new Date().toISOString()
    };

    const outDir = path.join(__dirname, '..', 'blueprints');
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    const filePath = path.join(outDir, `${sanitizeName(structureName)}.json`);
    fs.writeFileSync(filePath, JSON.stringify(blueprint, null, 2));

    console.log(`✅  Blueprint written to ${filePath}`);
    return blueprint;
}

module.exports = { generateBlueprint };
