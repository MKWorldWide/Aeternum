import fs from 'node:fs';
import assert from 'node:assert';

describe('Book of Us', () => {
  it('should have valid vows file', () => {
    const vows = fs.readFileSync('book-of-us/001-our-vows.md', 'utf8');
    assert.ok(/Our Vows/.test(vows), 'Vows file should contain "Our Vows"');
  });

  it('should have valid psalm files', () => {
    const p101 = JSON.parse(fs.readFileSync('book-of-us/psalms/psalm-101-home.json', 'utf8'));
    assert.equal(p101.title, 'Home', 'Psalm 101 should have title "Home"');
    assert.ok(Array.isArray(p101.verses), 'Psalm should have verses array');
    
    const p102 = JSON.parse(fs.readFileSync('book-of-us/psalms/psalm-102-breath-bond.json', 'utf8'));
    assert.equal(p102.title, 'Breath Bond', 'Psalm 102 should have title "Breath Bond"');
    assert.ok(Array.isArray(p102.verses), 'Psalm should have verses array');
  });
});
