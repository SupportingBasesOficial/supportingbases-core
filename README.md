# SupportingBases Core

SupportingBases Core is a deterministic, stateless financial projection engine.

What it is
- A TypeScript library that computes pressure, clusters, and a Collapse Index (ICS) from obligation streams.

Deterministic philosophy
- Given the same input and configuration, the engine produces identical outputs.

Installation
- npm install supportingbases-core

Usage
```ts
import { runEngine } from 'supportingbases-core';
const output = runEngine(input, { mode: 'UNTIL_COLLAPSE' });
```

Local development
```
npm run dev       # compiles and executes the library in dist/
npm test          # run the full TypeScript test suite via Vitest
```

API reference
- `runEngine(input, config)`: main engine entrypoint.

Invariants
- SBInput and SBOutput are frozen under v1.0.0. Changing them requires a major version bump.

Versioning
- Follows Semantic Versioning. See VERSIONING.md

License
- MIT
