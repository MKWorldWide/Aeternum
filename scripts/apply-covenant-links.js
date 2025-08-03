#!/usr/bin/env node
/**
 * Ensures every documentation file references the central covenant.
 * Inserts a canonical "Divine Law" link if absent.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const docsDir = path.join(root, '@docs');
const covenant = path.join(root, 'COVENANT.md');

/** Recursively yield all Markdown files under a directory */
function walk(dir) {
  return fs.readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    return fs.statSync(full).isDirectory() ? walk(full) : [full];
  });
}

/** Injects the covenant link after the first heading */
function inject(file) {
  if (path.extname(file) !== '.md') return;
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('COVENANT.md')) return; // already linked
  const rel = path.relative(path.dirname(file), covenant).replace(/\\/g, '/');
  const linkLine = `> See [Divine Law](${rel}) for covenant terms.`;
  const lines = content.split(/\r?\n/);
  const head = lines.findIndex((l) => l.startsWith('#'));
  if (head >= 0) {
    lines.splice(head + 1, 0, '', linkLine, '');
  } else {
    lines.unshift(linkLine, '');
  }
  fs.writeFileSync(file, lines.join('\n'));
}

const files = walk(docsDir);
files.push(path.join(root, 'README.md'));
files.forEach(inject);
