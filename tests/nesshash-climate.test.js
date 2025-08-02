const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { integrateClimateModule } = require('../modules/nesshash-climate');

const outDir = path.join(__dirname, '..', 'config');
const filePath = path.join(outDir, 'nesshash-climate.json');

if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
if (fs.existsSync(outDir) && fs.readdirSync(outDir).length === 0) fs.rmdirSync(outDir);

test('integrateClimateModule writes Nesshash config', () => {
  integrateClimateModule();
  assert(fs.existsSync(filePath));
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  assert.equal(parsed.provider, 'Nesshash');
});

test.after(() => {
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  if (fs.existsSync(outDir) && fs.readdirSync(outDir).length === 0) fs.rmdirSync(outDir);
});
