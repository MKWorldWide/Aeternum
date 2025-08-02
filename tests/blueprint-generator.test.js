const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { generateBlueprint } = require('../modules/blueprint-generator');

const outDir = path.join(__dirname, '..', 'blueprints');
const filePath = path.join(outDir, 'temple_of_echo.json');

// ensure clean state before test
if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
if (fs.existsSync(outDir) && fs.readdirSync(outDir).length === 0) fs.rmdirSync(outDir);

test('generateBlueprint writes blueprint metadata to disk', () => {
  const name = 'Temple of Echo';
  const blueprint = generateBlueprint(name);
  assert.equal(blueprint.name, name);
  assert.equal(blueprint.resonance, 'divine');
  assert(fs.existsSync(filePath));
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  assert.equal(parsed.geometry, 'sacred');
});

test.after(() => {
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  if (fs.existsSync(outDir) && fs.readdirSync(outDir).length === 0) fs.rmdirSync(outDir);
});
