---
name: bridge-sync
description: Sync the bridge-core-examples test bench to a target branch of playgama/bridge. Diffs upstream commits, classifies impact (enums, module APIs, platforms, events), rebuilds the SDK bundle, copies it into public/, then upgrades types + section bindings + HTML + the events log to match. Use when the user asks to "check bridge changes", "upgrade test bench", "sync to develop-v2" (or any other branch), "rebuild bridge", "drop fresh playgama-bridge.js", or after switching branches in ../bridge.
---

# bridge-sync

Mechanical workflow for keeping this test bench in lockstep with `playgama/bridge`. Run end-to-end on every upstream change; never skip Step 5 (typecheck/build) — it's how stale interface usage is caught.

## Layout assumptions

- This project lives at `<root>/bridge-core-examples/`.
- The SDK lives at the sibling path `<root>/bridge/` (same parent dir). Verify with `ls ../bridge/package.json` first; abort if missing.
- A pin file `.bridge-baseline` in this project's root records the last-synced state, format on a single line:
  ```
  <full-commit-sha> <branch-name>
  ```
  If absent: treat current `public/playgama-bridge.js` as opaque baseline and tell the user.

## Step 1 — Detect drift

1. `cd ../bridge && git fetch origin <branch>` (target branch comes from user, fall back to whatever `.bridge-baseline` recorded, or `main`).
2. Read `.bridge-baseline` to get `<baseline-sha>`.
3. List commits: `git log --oneline <baseline-sha>..origin/<branch>`.
4. List source files: `git diff --name-status <baseline-sha>..origin/<branch> -- src/`.

If commit list is empty → report "no changes since `<baseline-sha>` on `<branch>`" and stop.

## Step 2 — Classify changes

For each file touched under `src/`, map to the test bench file(s) it impacts:

| Upstream surface | Test bench surface to update |
|---|---|
| `src/constants.{js,ts}` enum entries (`PLATFORM_ID`, `EVENT_NAME`, `STORAGE_TYPE`, `MODULE_NAME`, new enums like `CLOUD_STORAGE_MODE`) | `src/types/bridge.d.ts` |
| `src/PlaygamaBridge.{js,ts}` module getters | `src/types/bridge.d.ts` `PlaygamaBridge` interface (add/remove/rename), possibly a new `<x>Module` interface and section file |
| `src/modules/<X>Module.{js,ts}` public methods/getters | `src/types/bridge.d.ts` `<X>ModuleApi` interface, `src/sections/<x>.ts`, `index.html` `#<x>-section` |
| `src/platform-bridges/*` add/remove | `PlatformId` union in `src/types/bridge.d.ts` only — platform-specific behaviour is invisible to the bench |
| New `EVENT_NAME.*` value | `EventName` union in `src/types/bridge.d.ts` **and** `TRACKED_EVENTS` in `src/sections/events.ts` |

To enumerate a module's public API on the target branch:

```bash
cd ../bridge
git show origin/<branch>:src/modules/<X>Module.ts \
  | grep -E "^\s+(get [a-zA-Z]+\(\)|[a-zA-Z]+\s*\()" \
  | grep -v "if\|return\|new \|throw\|console\|then\|catch\|this\.\|=>"
```

Compare against `src/types/bridge.d.ts` `<X>ModuleApi`. Diff = work to do.

For added/removed platforms compare:

```bash
cd ../bridge
git show origin/<branch>:src/constants.ts | sed -n '/PLATFORM_ID = /,/^}/p'
```
…against the `PlatformId` union.

## Step 3 — Rebuild the SDK bundle

```bash
cd ../bridge
npm install                     # only when package.json/lock changed upstream
npm run lint:fix                # if a previous run failed with blocking eslint errors
npm run build                   # webpack --config-name bundled
```

The build emits `dist/playgama-bridge.js`. Verify it's actually from the target branch by grepping for branch-specific markers (e.g. for `develop-v2`):

```bash
grep -oE "default_storage_type_changed|cloudStorageMode|loadCloudKey|loadCloudSnapshot" dist/playgama-bridge.js
```

If nothing matches → the bundle was stale or eslint silently blocked emission. Re-run `lint:fix` then `build` and check again.

Copy artifacts:

```bash
cp ../bridge/dist/playgama-bridge.js          public/playgama-bridge.js
cp ../bridge/dist/playgama-bridge-config.json public/playgama-bridge-config.json
```

## Step 4 — Apply test bench changes

For each item from Step 2's classification, edit the smallest set of files. Common patterns:

### Removed platform (e.g. Samsung)
- Remove the string literal from `type PlatformId = …` union in `src/types/bridge.d.ts`. Done.

### New `EVENT_NAME.*`
- Add literal to `type EventName = …` union.
- Add string to `TRACKED_EVENTS` in `src/sections/events.ts`.
- If the event is emitted by a module not yet wired into the events log (`bridge.storage`, `bridge.payments`, etc.), add `wire(bridge.<x>, '<x>')`.

### New module method / getter
- Add to corresponding `<X>ModuleApi` in `src/types/bridge.d.ts`.
- Add control in the section's `index.html` markup. Conventions:
  - Read-only state → `<div class="kv__row"><span class="kv__key">…:</span><span class="kv__val" id="…">?</span></div>`
  - Action with no input → `<button class="action" id="…"><span class="action__icon">EMOJI</span><span class="action__label">VERB\nNOUN</span></button>` inside `.actions`
  - Action with input → `<input>` in `.row` then a `<button class="btn">`
- Bind it in `src/sections/<x>.ts` using the existing `el<…>(…)`, `setText(…)`, and async-wrap try/catch helpers from `src/util.ts`.

### Removed / renamed method
- Strip from interface.
- Strip the section binding and the corresponding DOM node from `index.html`.

### Changed signature (e.g. v2 storage dropped `storageType` arg)
- Update interface signature in `src/types/bridge.d.ts`.
- Update every callsite in `src/sections/<x>.ts`.
- If a UI control is now meaningless (e.g. the storage-type `<select>`), delete it from `index.html` too.

### New module exposed on `bridge.*`
- Add an `<X>ModuleApi` interface in `src/types/bridge.d.ts` and a getter on `PlaygamaBridge`.
- Create `src/sections/<x>.ts` modeled on the simplest existing section (clipboard, remoteConfig).
- Add a new `<section class="module module--<x>" id="<x>-section">` to `index.html` with an accent color (add `--c-<x>` CSS variable + `.module--<x>` selector in `src/styles.css`).
- Import + call `bind<X>Section(bridge)` in `src/main.ts`.

## Step 5 — Verify

```bash
npm run typecheck     # tsc --noEmit; flags every stale interface use
npm run build         # full vite build; should be clean
```

If typecheck fails → fix the missed spot from Step 4. Don't move on until both succeed.

## Step 6 — Update baseline

```bash
echo "$(cd ../bridge && git rev-parse origin/<branch>) <branch>" > .bridge-baseline
```

Then tell the user:
- Bullet list of meaningful changes applied (one line per upstream commit, mention which test bench files moved).
- "Re-upload `dist/` to Playgama" if production deploy is relevant.

## Constraints

- **Never edit `../bridge` source files** beyond what `npm run lint:fix` does. Surface upstream errors but don't patch them locally.
- **Recorder module is intentionally unwired** — `PlaygamaBridge` doesn't expose `recorder`. Skip it even if it changes upstream.
- **Don't add `forciblySetPlatformId`** to `public/playgama-bridge-config.json` to "fix" the mock badge — that's an expected upload-preview state on Playgama; the real game player appends `?platform_id=playgama`.
- **Don't merge reward flags** — `addToHomeScreen` / `addToHomeScreenReward` and the favorites pair are separate flags by design.
- The `vite.config.ts` has `base: './'` because Playgama serves from a sub-path. Don't change it.
