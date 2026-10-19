# UI Evolution Lab architecture · Phase 2

## Product boundary

The user edits a finite genome, renders an interactive UI locally, compares candidates under controlled content and viewport conditions, and records evaluations. The explorer, Level 1 optimizer and participant module run in the browser. Level 2 uses an optional loopback-only Node/Playwright service; no paid model call, telemetry or remote product image request is needed.

## Data flow

`schema.ts → engine.ts → store.ts → tokens.ts + GenomeSurface → Shop / Gallery`

- **Schema** defines domains and rendering bindings, not separate editor-only descriptors. `Explorer` reads the same definitions used by import validation, randomization, combination counting and JSON Schema export.
- **Engine** is framework independent. It supplies defaults, strict import validation, deterministic randomization, mutation, canonical duplicate keys, differences, BigInt products and safe CSV serialization.
- **Store** records immutable genome snapshots. Locks protect direct editing, resetting, randomization and mutation. Explicit whole-genome loads bypass locks. localStorage is versioned; invalid saved data falls back visibly to defaults; quota/access failures are reported. The undo stack is bounded to 80 entries; candidates to 50; evaluations to 100 per candidate.
- **Tokens** produce CSS custom properties and palette checks. Primary button foreground is chosen by luminance, not a fixed white foreground. Requested low-contrast palettes remain inspectable, and checks report failures rather than claiming all random candidates are accessible.
- **GenomeSurface** emits schema attributes and token styles, observes the actual preview container, and computes responsive tier/orientation independently from the host app. System color scheme and reduced-motion preferences update reactively. Portaled dialogs/popovers carry a full theme wrapper.
- **Shop** shares `PRODUCTS`, filtering/sorting and inventory functions across all families. Standalone cart state is local to its preview. Comparison shares search, categories, price range, sorting, cart, preferences and feedback across variants; only transient modal/drawer opening stays local. Comparison controls share their values and motion trigger, so the same action runs simultaneously under each genome.
- **Gallery** contains 29 real components. Native text/select inputs and Radix controls preserve names, roles and keyboard behavior. Preview state selection is labeled as simulation. Non-applicable states on informational components are disclosed.
- **Inspector** computes exact token ratios and runs real axe-core on the current preview DOM on demand. Results retain the genome hash and are labeled stale after edits. Manual evaluation records are separate from automated checks.

## Theme and layout precedence

1. Family classes supply distinct baseline visual philosophy and structure.
2. Genome variables supply explicit structure, geometry, tokens and interaction choices.
3. Responsive container rules adapt products/navigation/filters. Narrow-screen controls take precedence over wide-screen column counts and sidebars.
4. System reduced motion and forced colors take precedence over requested animation/material styling.

The family picker changes only A01. Loading a baseline preset also applies the family-specific variable defaults. This lets users isolate family effects or compare complete recommended configurations.

`I02/I03` apply only to translucent material; `A08` only to split composition; menu depth only to expandable menus; shadow blur only to nonzero shadow strength; grid columns only to grid/featured product layout. Inactive values remain in JSON for reversible exploration. Responsive variables are evaluated only in their applicable viewport; the editor disables them with a reason outside that scope. Preview zoom changes the effective logical viewport, so reflow/stack/scroll policies can be exercised. Orientation uses the viewport rather than the entire scrollable document height. On mobile, on-demand axe temporarily reveals the preview before inspection; it never counts a hidden DOM as an accessibility pass.

## Genome wire format

Version 1 contains `version`, `schemaVersion`, `family`, `signature`, uint32 `seed` and exactly 120 typed `variables`. No arbitrary variable IDs or out-of-domain values are accepted. A01 and family must agree. Import creates a fresh object and discards no variable silently.

Canonical candidate identity is the full ordered tuple `(schemaVersion, signature, schema-ordered variable values)`. Seed is generation provenance and is excluded from duplicate detection. The 8-digit FNV display hash is **not** the uniqueness test; duplicates use the complete canonical string to avoid hash collision errors.

## Determinism

The engine uses Mulberry32. Randomization consumes exactly one sample for each schema definition in order, including locked and excluded IDs. Same schema version, input genome, seed, scope and locks reproduce the same result. Mutation samples up to four distinct unlocked IDs without replacement and selects a different valid value for each. A01 changes always synchronize `family`.

Conditional fields are valid but inactive, so random generation does not need to invent coercions. Invalid imported types/domains or a divergent family are rejected atomically. No invalid intermediate genome is committed.

## Counting

`combinationStats` multiplies finite domain cardinalities with BigInt. It returns the exact integer as a decimal string, scientific notation, digit count and log10. It includes inactive domain values; multiple genotypes can render the same phenotype. Conditional activation, responsive masking, global Signature and seed provenance mean this is not an exact count of valid or visually unique interfaces. Valid count is explicitly unknown.

## Historical Phase 0 search/evaluation extension points

```ts
interface SearchStrategy {
  id: string;
  propose(parent: Genome, context: {
    seed: number; locks: VarId[]; seen: Set<string>;
  }): Genome | null;
}
interface EvaluationAdapter {
  id: string;
  evaluate(genome: Genome, signal?: AbortSignal): Promise<Evaluation>;
}
```

The following describes the preserved Phase 0 interface. The implemented Phase 2 strategies are described below.

Implemented in the original explorer: `randomSearch`, `randomize`, `mutate`, canonical duplicate checking, candidate persistence, manual/axe evaluations, CSV.

Future GA: a strategy can select parents, crossover typed values, mutate, call validation and deduplicate before returning. Future UCB: represent mutation operators as arms and keep counts/reward statistics outside the genome. Reward must state objective, baseline, direction and measurement budget. Deterministic operator choice should retain its own seed and version. A future multi-objective adapter should record separate accessibility, consistency, performance and user preference dimensions; no synthetic single score is exposed as measured quality in Phase 0.

Optional future AI evaluation belongs behind `EvaluationAdapter`, with explicit authorization and backend credential isolation. It must never become a requirement for existing local features.

## Tests

Vitest covers finite domain acceptance/rejection, round trips for all options, deterministic randomization, locks/scope, mutation cardinality, duplicate identity, exact products, CSV injection safety, store history/persistence behavior, shared shop filtering/inventory and semantic controls. Playwright drives the actual production UI, editors, drag/keyboard actions, cart, files, comparison, responsive captures, state captures and axe checks. See the factual test report for executed coverage and remaining manual checks.


## Implemented Phase 2 modules

`research/types.ts` is the explicit data contract. `config.ts` validates bounded experiment conditions. `evaluation.ts` supplies separate Static Proxy, original Synthetic and Browser scoring; mandatory eligibility is independent of Q. `optimizer.ts` implements seeded random search, uniform crossover, mutation, unique elite preservation and UCB arms. `experiment.ts` orchestrates budgets, caching, failure retries, cancellation, SHA-256 provenance and replay-based resumption.

`ResearchLab.tsx` joins setup, monitor, results, raw evidence and storage. The component remains mounted when the explorer tab changes, so an active experiment does not silently disappear. `Charts.tsx` shows seven charts with accessible raw tables. `statistics.ts` distinguishes completed, partial and no-eligible runs. `data.ts` validates imports, preserves nulls, exports CSV/JSON and migrates Phase 1. `persistence.ts` uses separate IndexedDB stores for experiments and anonymous sessions. The original explorer localStorage format is unchanged.

`HumanEvaluation.tsx` presents seeded candidate order only after explicit consent. Four tasks have start/stop timing and participant-selected success/satisfaction; no defaults are generated as responses. The timer is wall elapsed performance time from the participant button, including interruptions. Saved sessions contain anonymous random IDs and no requested personal identifiers. Free comments should not include personal data.

## Browser boundary

`npm run research` builds the same app and starts `scripts/research-server.ts` on 127.0.0.1:4318. It serves the static bundle and status/evaluate/evidence routes. Origin allowlisting, an ephemeral connection token, request/domain/limit validation and loopback binding protect the local evaluation boundary. Requests contain only a validated genome and config; no arbitrary target URL or command is accepted.

`browser-evaluator.ts` lazily starts Chromium. A semaphore caps the whole runner to two contexts, even when two requests each ask for parallel viewports. Each viewport uses a new context with recorded browser/platform/Node/userAgent/DPR, fixed locale, light color scheme and real reduced-motion emulation. The `?evaluation=1` route mounts the actual Shop/GenomeSurface without the laboratory shell, using an init-script genome rather than URL-length JSON.

`layout.ts` is serialized into the page for real geometry and hit testing. It checks declared peer groups rather than every DOM pair. axe violation/incomplete nodes and independent keyboard tasks are retained. Each functional task starts a clean shop state. Screenshots are local files linked to candidate evidence; image bytes are deliberately outside raw JSON. `browser-client.ts` connects only to local loopback HTTP origins and refuses evaluator version mismatches.

A browser error returns a failed observation with null scores and a recorded error. It never substitutes Static Proxy results for Level 2. Imports validate provenance structure but do not cryptographically certify that an external data producer truly ran a browser. Preserve original evidence and environment for review.

## Standalone and hosted delivery

Vite's standalone mode uses inlineDynamicImports, then `build-standalone.mjs` embeds JavaScript, CSS, fonts and axe into a single HTML. The same source creates the static hosted app. Level 1, Synthetic and participant functions require no server. Playwright cannot run inside an ordinary static HTML and is offered as the explicit local service; measured results can also be imported on a tablet.

Phase 2 scores are versioned separately from the unchanged phase0-1.0.0 genome schema. Score/constraint changes require an evaluation version bump; optimizer changes bump the separately recorded SEARCH_VERSION. Interim records without that search version remain readable/exportable but are not resumed. Legacy Phase 1 records are historical Synthetic results and cannot be resumed by the changed optimizer. Future AI adapters must be explicit opt-in evaluators with AI-rated provenance; no paid API is part of the baseline.
