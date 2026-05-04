# Playgama Bridge — Test Bench

A TypeScript test bench that exercises every module of [`playgama/bridge`](https://github.com/Playgama/bridge): platform, player, game, storage, advertisement, social, device, leaderboards, payments, achievements, remote config, clipboard, analytics, plus a live tail of every bridge event.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build → dist/
npm run preview    # preview the production build
npm run typecheck  # tsc --noEmit
```

## What's bundled

- `public/playgama-bridge.js` — prebuilt SDK bundle, loaded as a `<script>` and exposed as `window.bridge`.
- `public/playgama-bridge-config.json` — config the SDK reads on `initialize()`.
- `src/types/bridge.d.ts` — strict typed declaration for `window.bridge` (every module method, every enum).
- `src/sections/*.ts` — one module per file; each binds DOM controls + outputs and subscribes to module events.
- `src/sections/events.ts` — subscribes to every `EVENT_NAME.*` on the bridge and main modules, streams them into the live event log.

## Selecting a platform

The bridge picks a platform by URL detection (e.g. `crazygames.*`, `tgWebAppData`, `vk_app_id`) and falls back to `mock`. You can force one of these by:

- typing the id in the **Bootstrap** card before clicking `initialize()` — it sets `?platform_id=…` and reloads-state, or
- appending `?platform_id=mock|yandex|telegram|playgama|crazy_games|…` to the URL directly.

Valid ids live in `bridge.PLATFORM_ID` (mirrored in [src/types/bridge.d.ts](src/types/bridge.d.ts)).

## Updating the bundled SDK

The two files in `public/` come from the sibling [`playgama/bridge`](../bridge) repo's build output:

```bash
cp ../bridge/dist/playgama-bridge.js public/
cp ../bridge/dist/playgama-bridge-config.json public/
```

Re-run after a new `npm run build` in `bridge`.
