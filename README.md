# Hybrid Framework v0.1.2 (Unity -> Cocos Creator 3.8.x)

A lightweight but scalable hybrid architecture for **hypercasual / casual / mid-core** games.
Designed to speed up porting from Unity to Cocos Creator (TypeScript) while keeping the codebase clean.

## Architecture
- **Core (Infrastructure):** Service Locator + EventBus + Lifetime + FSM
- **Gameplay (In-game):** AppFlow FSM + InGame FSM + Object Pooling
- **UI & Meta:** MVVM-lite + simple UI Router

## Services included (v0.1.2)
Scaffolded with Noop implementations where platform SDKs are not wired yet:
- `IAssetsService`
- `IAudioService`
- `IInputService`
- `ISaveService`
- `INetworkService`
- `IAdsService`
- `IAnalyticsService`
- `IPushNotificationService`
- `ITimeService`
- `ISceneService` (multi-scene helper)

## Quick start
1) Copy `assets/scripts/framework` into your Cocos project.
2) In your first scene, create a node named `Framework` and attach **FrameworkBootstrap**.
3) Run. By default, FrameworkBootstrap:
   - makes its node **persistent** (survives scene changes),
   - registers services into **ServiceLocator**,
   - auto-adds **AppController** (AppFlow FSM).

### Single-scene vs Multi-scene
- Single-scene: keep everything in one scene and enable/disable feature root nodes via FSM.
- Multi-scene: set `sceneMode = 'multi'` in FrameworkBootstrap and provide scene names.

## Playbook (interactive HTML)
Open `docs/playbook/index.html` in your browser.
It includes navigation, search, a mode toggle, and copyable code examples.

## Coding standard (project-wide)

Formatting
- Indentation: **2 spaces**, no tabs.
- Quotes: **single quotes** for strings.
- Semicolons: **required**.
- Spacing:
  - `if (cond) { ... }` (space after keywords, space before `{`)
  - `{ a: 1, b: 2 }` (spaces inside object braces)
  - `fn(a, b)` (space after commas)
- Trailing commas: **recommended** for multi-line objects/arrays.

Naming
- Files:
  - Components / Services: `PascalCase.ts` (e.g. `AppController.ts`).
  - Interfaces: `IThing.ts` (e.g. `IAudioService.ts`).
- Types/classes/enums: `PascalCase`.
- Methods/functions/variables: `camelCase`.
- Private fields: `private _likeThis` (leading underscore).
- Public fields: no underscore.
- Constants: `UPPER_SNAKE_CASE` (rare; prefer `const` at module scope when needed).

Comments
- English only.
- Explain **why** (intent/constraints), not the obvious "what".


## Notes

## UI Kit
See `docs/uikit/README_UIKIT_EN.md`.

## Minimal single-scene template (GameEntry + Home/Gameplay/Result)
This zip includes a minimal project template under `assets/scripts/game`:

- `game/bootstrap/GameEntry.ts` wires AppState -> Screens.
- `game/features/*` contains feature skeletons (VM + Screen).
- `game/shared/GameSessionVM.ts` stores a tiny session state.

### How to use (SceneMode.Single)
1) In your startup scene, create these nodes:
   - `Framework` node with `FrameworkBootstrap` (sceneMode = Single).
   - `UIRoot` node (or instantiate `assets/resources/ui/UIRoot.prefab`) with `UIRoot` component.
   - Add `GameEntry` to any node (recommended: `Framework` node).

2) Create screen prefabs (already included):
   - `assets/resources/ui/screens/HomeScreen.prefab`
   - `assets/resources/ui/screens/GameplayScreen.prefab`
   - `assets/resources/ui/screens/ResultScreen.prefab`

3) Press Play:
   - Home emits `app/play`
   - Gameplay emits `app/result` with `{ win, score }`
   - Result emits `app/restart` or `app/backToHome`

Note: `UIRoot` now supports `replaceScreen()` to avoid unbounded screen stacks.


## Smooth UI for complex screens (preload + warmup)
When a screen contains nested lists, many Widgets, or expensive binding, it can cause micro-glitches on the first visible frame.
This framework supports an optional warmup pipeline for any `UIView` (screens and popups).

### Lifecycle hooks (optional)
Add these methods to your `UIScreen` / `UIPopup` (they are detected automatically):

- `onPreload(params): Promise<void> | void`
  - Load extra assets you will need (item prefabs, sprite frames, etc).
  - Runs after `onCreate`, before the view is shown.

- `onBeforeShow(params): Promise<void> | void`
  - Build list items, apply bindings, precompute layouts.
  - Runs while the view is hidden (opacity 0) and attached to a staging layer.

- `onAfterShow(): void`
  - Runs after `UIView.show()` finishes (after transition).

- `onBeforeHide(): Promise<void> | void`
  - Runs before `UIView.hide()` starts (optional cleanup).

### Chunked list building (avoid frame spikes)
Use `UIListBuilder.rebuildAsync()` to render many items without a single long frame:

```ts
import { UIListBuilder } from '../../framework/ui/utils/UIListBuilder';

await UIListBuilder.rebuildAsync(
  this.contentNode,
  this.itemPrefab,
  data,
  (item, datum, index) => {
    // bind item UI here
  },
  this._pool,                 // optional NodePool
  { batchSize: 20, yieldFrames: 1 },
);
```

### Notes
- The router automatically runs warmup for screens/popups if the host (`UIRoot`) implements `_createViewPrepared`.
- Warmup updates `Layout` and `Widget` trees and yields a couple of frames before the view becomes visible.
