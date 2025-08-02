# Modules

> Atomic documentation for core functional modules. Each module is self-contained and designed for future-proof composition.

| Module | Purpose | Invocation |
|--------|---------|-----------|
| `nesshash-climate.js` | Mock integration with the Nesshash climate engine; writes configuration seed to `config/`. | `npm run climate` |
| `blueprint-generator.js` | Emits JSON blueprints for structures of divine resonance. | `npm run blueprint` |
| `atlantean-water-system.js` | Defines Atlantean HydroGrid and associated energy channels. | `npm run water` |
| `token-access.js` | Declares access control tiers, including **Sons of Ra** and **Builders of the Dawn**. | Imported by other scripts |

Each module exports a single function or object to keep interfaces clear and maintainable. Extend cautiously—prefer additive changes over mutation to honor the repo's immutable ethos.
