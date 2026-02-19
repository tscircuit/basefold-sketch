# AGENTS.md

Guidance for coding agents working in `@basefold/sketch`.

## Project Snapshot

- Language: TypeScript (`strict` mode).
- Runtime/tooling: Bun for tests, tsup for builds, Biome for lint/format.
- Package type: ESM package with dual ESM/CJS output via `tsup`.
- Main source: `src/`.
- Tests: `tests/` (Bun test runner).

## Prefer XY-less positioning

- Use constraints instead of setting x y positions

## Repository Rules Files

- Cursor rules: none found (`.cursorrules` and `.cursor/rules/` not present).
- Copilot rules: none found (`.github/copilot-instructions.md` not present).
- If these files are added later, treat them as higher-priority constraints.

## Setup Commands

- Install dependencies:
  - `bun install`
- Type-check only (no emit):
  - `bunx tsc --noEmit`
- Build distributables (`dist/`):
  - `bun run build`
- Dev watch build:
  - `bun run dev`

## Test Commands (Bun)

- Run all tests:
  - `bun test`
- Run a single test file:
  - `bun test tests/readme-drawing.test.ts`
- Run a single test by name pattern:
  - `bun test -t "README drawing snapshot"`
- Run a single test file + name pattern:
  - `bun test tests/readme-drawing.test.ts -t "README drawing snapshot"`

Notes:

- Test preload is configured in `bunfig.toml` (`tests/fixtures/preload.ts`).
- Prefer targeted test runs while iterating; run full suite before finalizing.

## Lint and Formatting Commands

Biome config is present in `biome.json`.

- Lint and format check:
  - `bunx @biomejs/biome check .`
- Apply Biome fixes:
  - `bunx @biomejs/biome check --write .`
- Format only:
  - `bunx @biomejs/biome format --write .`

If `@biomejs/biome` is not installed locally, use `bunx` as above.

## Quick Command Recipe (Before Opening a PR)

1. `bunx tsc --noEmit`
2. `bunx @biomejs/biome check --write .`
3. `bun test`
4. `bun run build`

## Source Layout Conventions

- `src/core.ts`: shared core types/interfaces (`Point`, `Constraint`, `Shape`).
- `src/Sketch.ts`: main orchestration API (`Sketch`).
- `src/constraints/*`: user-facing constraint implementations.
- `src/shapes/*`: shape implementations.
- `src/solver/lm.ts`: Levenberg-Marquardt solver.
- `src/index.ts`: public package exports.

## Code Style Guidelines

### Imports and Exports

- Use ESM imports/exports.
- Use `import type` for type-only imports.
- Keep exports centralized in `src/index.ts` and feature `index.ts` files.
- Prefer relative imports within `src/`.
- Let Biome organize imports; do not hand-micro-optimize ordering.

### Formatting

- Follow Biome defaults in this repo:
  - spaces for indentation,
  - double quotes,
  - trailing commas,
  - semicolons omitted,
  - parentheses required around arrow params.
- Keep lines readable; prefer short helper functions over deeply nested logic.

### TypeScript and Types

- `strict: true` is enabled; keep code fully type-safe.
- Avoid `any` even though the linter permits it.
- Prefer explicit interfaces/type aliases for public options/results.
- Use narrow option object types in constructors and public APIs.
- Favor immutable/public-readonly fields where appropriate.
- Use non-null assertions (`!`) only when invariants are guaranteed by control flow.

### Naming Conventions

- Filenames: kebab-case or export-aligned naming per Biome rule.
- Classes: PascalCase (`Sketch`, `Distance`, `Rectangle`).
- Interfaces/types: PascalCase (`SolveOptions`, `Residual`).
- Functions/variables: camelCase.
- Constants: camelCase unless true module-level constants that merit UPPER_SNAKE_CASE.
- Point references use string format `"ShapeName.pointName"`.
- All test file names should be enumerated (i.e. `circle01.test.ts`, `circle02.test.ts`, etc.) and there should be only one test per file

### API and Class Design

- Keep constructors validating input early; throw clear `Error` messages.
- Keep computational logic pure where possible (solver helpers are pure functions).
- Keep public API minimal and explicit.
- Return `this` from mutating builder-style methods when chaining is intended.

### Error Handling

- Fail fast on invalid user input (non-finite values, invalid refs, duplicates).
- Throw `Error` with actionable messages including offending values when useful.
- Do not silently coerce invalid inputs.
- In numeric algorithms, return structured status for non-convergence (`converged`, `finalError`).

### Numerical/Solver Code

- Prefer small, testable helper functions (`l2Norm`, `evalResiduals`, etc.).
- Document mathematically non-obvious steps with concise comments.
- Avoid unnecessary allocations in hot loops unless clarity tradeoff is worth it.
- Preserve determinism and stability defaults unless intentionally changing solver behavior.

### SVG/Rendering Code

- Keep shape `toSvg` methods focused: emit inner SVG only (no outer `<svg>` wrapper).
- Keep coordinate transform logic centralized (see `createSvgFromSketch`).
- Preserve current output structure to avoid snapshot churn unless behavior changes intentionally.

### Testing Guidelines

- Use `bun:test` (`test`, `expect`).
- Keep tests deterministic and snapshot-friendly.
- For geometry assertions, prefer explicit values or structured snapshots.
- Add/update tests for any behavior or API change.
- For README/example behavior changes, update corresponding snapshot tests.
- One test per file, always include an svg snapshot test (use toMatchSvgSnapshot)

## Change Management for Agents

- Make focused, minimal diffs; avoid unrelated refactors.
- When touching public exports or options, update docs and tests together.
- If adding new scripts, keep names aligned with existing `build`/`dev` conventions.
- Do not modify generated `dist/` manually.

## Agent Checklist Per Task

1. Read relevant files in `src/` and `tests/` first.
2. Implement smallest viable change.
3. Run targeted test(s): single file and/or `-t` pattern.
4. Run `bunx tsc --noEmit`.
5. Run `bunx @biomejs/biome check --write .`.
6. Run full `bun test` for final verification.
7. Run `bun run build` if exports/build output may be affected.

## Known Defaults to Preserve

- `tsconfig.json` includes only `src`.
- Package exports map points to `dist/index.{js,cjs,d.ts}`.
- Bun test preload file remains `tests/fixtures/preload.ts`.
