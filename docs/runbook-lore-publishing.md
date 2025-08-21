# Runbook: Publishing Lore

1) Create/modify lore doc.
2) Generate checksum: `shasum -a 256 <file>` → write to Seal.
3) Sign seal: `age/miniSign/ed25519` per Keeper policy.
4) Update `galactica.json` lore.index with id + seal.
5) Run tests: `npm test`.
6) Open PR titled: `feat(lore): add <id>`.
