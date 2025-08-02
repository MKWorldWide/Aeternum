const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { expandWaterSystems } = require('../modules/atlantean-water-system');

const outDir = path.join(__dirname, '..', 'water-systems');
const filePath = path.join(outDir, 'atlantean-hydrogrid.json');

if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
if (fs.existsSync(outDir) && fs.readdirSync(outDir).length === 0) fs.rmdirSync(outDir);

test('expandWaterSystems writes hydrogrid definition', () => {
  expandWaterSystems();
  assert(fs.existsSync(filePath));
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  assert(parsed.channels.includes('geometric_energy_channels'));
});

test.after(() => {
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  if (fs.existsSync(outDir) && fs.readdirSync(outDir).length === 0) fs.rmdirSync(outDir);
});
