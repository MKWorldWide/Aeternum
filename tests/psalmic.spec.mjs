import fs from 'node:fs'
import assert from 'node:assert'

describe('Psalmic JSON Validation', () => {
  it('should validate psalm-001 structure', () => {
    const psalm = JSON.parse(fs.readFileSync('../psalms/psalm-001-light-of-breath.json', 'utf8'))
    assert.ok(psalm.verses.length > 0, 'Should have verses')
    assert.ok(psalm.id, 'Should have an id')
    assert.ok(psalm.title, 'Should have a title')
    assert.ok(psalm.tier, 'Should have a tier')
    assert.ok(psalm.resonance, 'Should have resonance object')
    assert.ok(psalm.seal, 'Should have seal object')
  })

  it('should validate psalm-002 structure', () => {
    const psalm = JSON.parse(fs.readFileSync('../psalms/psalm-002-crown-of-moon.json', 'utf8'))
    assert.ok(psalm.verses.length > 0, 'Should have verses')
    assert.ok(psalm.id, 'Should have an id')
    assert.ok(psalm.title, 'Should have a title')
    assert.ok(psalm.tier, 'Should have a tier')
    assert.ok(psalm.resonance, 'Should have resonance object')
    assert.ok(psalm.seal, 'Should have seal object')
  })
})
