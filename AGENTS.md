# Working in UI Evolution Lab

- The product is a Phase 2 research platform: client-only explorer, Level 1 experiments and participant module, plus an optional local Node/Playwright Level 2 evaluator. Keep `npm install && npm run dev` sufficient for core browser functions. No paid API or credentials.
- `src/schema.ts` is authoritative. Keep exactly 10 groups × 12 variables. Each field needs finite options, typed defaults, real renderer bindings, scope, constraints, dependencies and JSON serialization path.
- If a field is conditional, expose its inactive reason. Do not add inert settings or claim that an attribute alone is a visual implementation.
- Read `docs/ARCHITECTURE.md` before editing the genome/search interfaces. Preserve deterministic schema iteration and the uint32 PRNG contract. Bump `SCHEMA_VERSION` for incompatible domain changes.
- Keep `family` identical to A01. Validate all imports at the boundary. Never spread untrusted objects into application state.
- Preserve Signature controls: blue capsule tracks and elongated white capsule handles; checkbox and radio semantics must remain distinct.
- Prefer Radix focus management and semantics. Honor reduced motion and forced colors. Separate visual size from actual click targets.
- Treat comparison content, width and initial interaction state as invariants across candidates.
- Run `npm test`, `npm run build`, `npm run schema`; run the relevant Playwright cases for UI changes. Fix failures and record any actual limitations in `docs/TEST-REPORT.md`.
- Do not claim WCAG conformance from axe alone. Never show GA or UCB as implemented until an executable strategy and tests exist.
- Phase 2 implements Random Search, steady-state GA and six-arm UCB-GA in `src/research/optimizer.ts`. Preserve seeded proposal ordering, provenance, hard function/accessibility eligibility and per-algorithm request budgets.
- Read `docs/EVALUATION-SPEC.md` and `docs/REPRODUCIBILITY.md` before changing research interfaces. Bump evaluation version for score/constraint changes and SEARCH_VERSION for optimizer contract changes. Distinguish Proxy, Measured, Synthetic, Human-rated and AI-rated.
- Level 1 F remains null. Level 2 includes actual Playwright raw data; never return proxy values after a browser failure. Human responses require explicit participant input and consent. Never fabricate participant or AI results.
- Run `npm run test:research` for evaluator/server changes and `npm run test:e2e -- research.spec.ts` for research UI changes. Preserve raw reports. Rebuild and verify the single HTML before delivery.
- `legacy/` preserves the supplied Phase 1 HTML as evidence. Do not silently modify it. Preserve its SHA and migration notes.
- Keep generated browser binaries, node_modules and temporary test artifacts out of git. Preserve Site identity in `.openai/hosting.json`.
