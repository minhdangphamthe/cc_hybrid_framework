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
See `assets/scripts/framework/NOTES.md` for caveats and future improvements.
