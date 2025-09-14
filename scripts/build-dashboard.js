#!/usr/bin/env node
"use strict";

/**
 * Build the Aeternum Dashboard data and public library.
 *
 * - Copies top-level content into @docs/library (book-of-us, psalms, lore)
 * - Produces @docs/data/library.json with navigable index
 * - Leaves @docs/index.html (dashboard UI) to render the data
 */

const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

const root = path.join(__dirname, "..");
const docs = path.join(root, "@docs");
const outData = path.join(docs, "data");
const outLib = path.join(docs, "library");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function listFiles(dir, exts) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    for (const entry of fs.readdirSync(d)) {
      const full = path.join(d, entry);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) stack.push(full);
      else if (!exts || exts.includes(path.extname(full))) out.push(full);
    }
  }
  return out;
}

function relToDocs(p) {
  return p.replace(docs + path.sep, "").replace(/\\/g, "/");
}

async function safeCopy(src, destDirName) {
  const srcPath = path.join(root, src);
  const destPath = path.join(outLib, destDirName);
  if (!fs.existsSync(srcPath)) return null;
  await fsp.cp(srcPath, destPath, { recursive: true });
  return destPath;
}

function extractSummaryFromMarkdown(content) {
  const lines = content.split(/\r?\n/).slice(1);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || line.startsWith(">") || line.startsWith("**")) continue;
    return line.replace(/[*_`]/g, "");
  }
  return "";
}

async function main() {
  ensureDir(outData);
  ensureDir(outLib);

  // Copy external content into @docs/library
  await safeCopy("book-of-us", "book-of-us");
  await safeCopy("psalms", "psalms");
  await safeCopy("lore", "lore");

  // Build index
  const index = {
    generated_at: new Date().toISOString(),
    sections: [],
    lore: [],
    bookOfUs: [],
    psalms: [],
  };

  // Sections: known doc areas under @docs
  const docAreas = [
    { key: "lore", dir: path.join(docs, "lore"), title: "Lore" },
    { key: "genesis", dir: path.join(docs, "genesis"), title: "Genesis" },
    { key: "mkww", dir: path.join(docs, "mkww"), title: "MKWW" },
    { key: "philosophy", dir: path.join(docs, "philosophy"), title: "Philosophy" },
    { key: "resources", dir: path.join(docs, "resources"), title: "Resources" },
    { key: "sacred-protocols", dir: path.join(docs, "sacred-protocols"), title: "Sacred Protocols" },
    { key: "security", dir: path.join(docs, "security"), title: "Security" },
    { key: "technology", dir: path.join(docs, "technology"), title: "Technology" },
  ];

  for (const area of docAreas) {
    if (!fs.existsSync(area.dir)) continue;
    index.sections.push({
      key: area.key,
      title: area.title,
      path: relToDocs(area.dir),
    });
  }

  // Lore entries inside @docs/lore
  const loreDir = path.join(docs, "lore");
  if (fs.existsSync(loreDir)) {
    const files = fs.readdirSync(loreDir).filter(f => f.endsWith(".md") && f !== "Aeternum.Lore.md");
    for (const f of files) {
      const full = path.join(loreDir, f);
      const content = fs.readFileSync(full, "utf8");
      const summary = extractSummaryFromMarkdown(content);
      index.lore.push({
        name: path.basename(f, ".md"),
        path: `lore/${f}`,
        summary,
      });
    }
  }

  // Book of Us under @docs/library/book-of-us
  const bouDir = path.join(outLib, "book-of-us");
  if (fs.existsSync(bouDir)) {
    const md = listFiles(bouDir, [".md"]).sort();
    for (const file of md) {
      index.bookOfUs.push({
        name: path.basename(file),
        path: relToDocs(file),
      });
    }
    const ps = listFiles(path.join(bouDir, "psalms"), [".json"]).sort();
    for (const file of ps) {
      index.psalms.push({
        name: path.basename(file, ".json"),
        path: relToDocs(file),
        source: "book-of-us",
      });
    }
  }

  // Global psalms copied to @docs/library/psalms
  const psalmsDir = path.join(outLib, "psalms");
  if (fs.existsSync(psalmsDir)) {
    const ps = fs.readdirSync(psalmsDir).filter(f => f.endsWith(".json"));
    for (const f of ps) {
      index.psalms.push({
        name: path.basename(f, ".json"),
        path: `library/psalms/${f}`,
        source: "root",
      });
    }
  }

  // Write the index JSON
  await fsp.writeFile(path.join(outData, "library.json"), JSON.stringify(index, null, 2), "utf8");
  console.log("📚 Dashboard data generated:", relToDocs(path.join(outData, "library.json")));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

