# Psalmic JSON — Spec (v0.1)

**Schema:** psalmic.json | **Seal:** sha256:PSALMIC_HASH

Fields: `id`, `title`, `tier`, `verses[]`, `resonance{keys[],checksum}`, `seal{authority,signature,timestamp}`. Parsers must refuse unsigned or mismatched checksums.
