#!/usr/bin/env node
"use strict";

/**
 * Pre-deployment utility.
 *
 * - Scans the lore directory for entries and rebuilds the index.
 * - Surfaces the latest entry on the docs landing page.
 * - Emits a cache-busting token and optional webhook notification.
 *
 * The goal is hands-free lore curation: every new entry is wired into the
 * documentation and broadcast to subscribers without manual edits.
 */

const fs = require("fs/promises");
const path = require("path");

// Root paths kept dynamic for portability across environments.
const loreDir = path.join(__dirname, "../@docs/lore");
const loreIndexFile = path.join(loreDir, "Aeternum.Lore.md");
const docsIndexFile = path.join(__dirname, "../@docs/index.md");
const stampFile = path.join(__dirname, ".lore-last-seen.json"); // persistent cache
const webhookFormat = process.env.LORE_WEBHOOK_FORMAT || "json"; // downstream payload shape

/**
 * Builds a webhook payload compatible with common downstream systems.
 * Defaults to raw JSON but can mimic Discord or Matrix shapes.
 */
function buildWebhookPayload(format, meta) {
  const message = `New lore entry: ${meta.latestName}${meta.summary ? " — " + meta.summary : ""}`;
  switch (format) {
    case "discord":
      // Discord webhooks expect a "content" field.
      return { content: message };
    case "matrix":
      // Matrix bots typically ingest plain text payloads.
      return { text: message };
    default:
      // Generic JSON for custom handlers.
      return {
        latest: meta.latestName,
        summary: meta.summary,
        timestamp: meta.timestamp,
      };
  }
}

/**
 * Extracts a concise summary from a lore file.
 * Heuristic: grab the first meaningful line after the heading and strip
 * markdown flourishes. This keeps the index lightweight while preserving
 * tone.
 */
function extractSummary(content) {
  const lines = content.split(/\r?\n/).slice(1); // skip title line
  for (const raw of lines) {
    const line = raw.trim();
    // Skip empties, headings, quotes, or common metadata markers
    if (
      !line ||
      line.startsWith("#") ||
      line.startsWith(">") ||
      line.startsWith("**")
    ) {
      continue;
    }
    // Remove markdown emphasis for clarity
    return line.replace(/[*_`]/g, "");
  }
  return ""; // no meaningful summary found
}

/**
 * Main orchestration routine.
 */
async function main() {
  const files = await fs.readdir(loreDir);
  const entries = [];

  for (const file of files) {
    if (!file.endsWith(".md") || file === "Aeternum.Lore.md") continue;
    const filePath = path.join(loreDir, file);
    const content = await fs.readFile(filePath, "utf8");
    const summary = extractSummary(content);
    const match = file.match(/^ENTRY-(\d{8})-/); // capture date tokens
    const sortKey = match ? Number(match[1]) : 0;
    entries.push({ file, summary, sortKey });
  }

  // Newest entries first so the archive and index always surface fresh lore.
  // Non-dated scrolls (sortKey=0) lead the list, followed by dated entries
  // in chronological order. This mirrors how foundational texts precede
  // timeline-driven lore.
  entries.sort((a, b) => {
    if (a.sortKey === 0 && b.sortKey === 0) return a.file.localeCompare(b.file);
    if (a.sortKey === 0) return -1;
    if (b.sortKey === 0) return 1;
    return a.sortKey - b.sortKey; // oldest first
  });

  // Build markdown list for the lore index.
  const bullets = entries
    .map((e) => {
      const name = path.basename(e.file, ".md");
      const link = `- [${name}](./${e.file})`;
      return e.summary ? `${link} — ${e.summary}` : link;
    })
    .join("\n");

  // Replace the generated section in Aeternum.Lore.md.
  let loreIndex = await fs.readFile(loreIndexFile, "utf8");
  loreIndex = loreIndex.replace(
    /(## 📜 Lore Entries\n)([\s\S]*?)(\n## ⏳ Living Lore)/,
    `$1${bullets}\n$3`
  );
  await fs.writeFile(loreIndexFile, loreIndex, "utf8");

  // Surface the latest lore entry on the docs home.
  // Identify the newest entry for surfacing and notifications.
  const latest = entries.reduce((max, e) => (e.sortKey > max.sortKey ? e : max), entries[0]);
  const cacheBuster = Date.now();
  const latestName = path.basename(latest.file, ".md");
  const latestLink = `- [${latestName}](./lore/${latest.file}?v=${cacheBuster})`;
  const latestLine = latest.summary
    ? `${latestLink} — ${latest.summary}`
    : latestLink;

  let docsIndex = await fs.readFile(docsIndexFile, "utf8");
  docsIndex = docsIndex.replace(
    /(## Latest Lore Update\n\n)(- .*\n)/,
    `$1${latestLine}\n`
  );
  // Emit build token to nudge page caches. Existing tokens are replaced to
  // avoid file churn and stray whitespace.
  docsIndex = docsIndex.replace(/\n<!-- build:\d+ -->\n?$/, "");
  docsIndex = docsIndex.trimEnd();
  docsIndex += `\n<!-- build:${cacheBuster} -->\n`;
  await fs.writeFile(docsIndexFile, docsIndex, "utf8");

  // Optional webhook notification for subscribers.
  let lastSeen = {};
  try {
    lastSeen = JSON.parse(await fs.readFile(stampFile, "utf8"));
  } catch {
    // No cache yet; proceed as first run.
  }

  const alreadyNotified =
    lastSeen.file === latest.file && lastSeen.timestamp === latest.sortKey;

  if (process.env.LORE_WEBHOOK_URL && !alreadyNotified) {
    try {
      const payload = buildWebhookPayload(webhookFormat, {
        latestName,
        summary: latest.summary,
        timestamp: cacheBuster,
      });
      await fetch(process.env.LORE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("Lore webhook dispatched");
      await fs.writeFile(
        stampFile,
        JSON.stringify({ file: latest.file, timestamp: latest.sortKey }),
        "utf8",
      );
    } catch (err) {
      console.error("Lore webhook failed", err);
    }
  } else if (process.env.LORE_WEBHOOK_URL) {
    console.log("No new lore; webhook suppressed");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1); // fail fast to avoid silent deploy errors
});

