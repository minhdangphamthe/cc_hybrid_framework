## Notes / Caveats v0.1.2

- `NodePool` calls IPoolable hooks by scanning child Components (`Component`, `includeInactive = true`).
  You can optimize this by tagging only poolable components (or caching).
- `UIRouter` is a minimal push/pop stack. For mid-core games, consider:
  - modal types (HUD vs popup),
  - async prefab loading,
  - transitions (fade/slide),
  - back-button handling.
- `CocosInputService` currently unifies touch events; add mouse/keyboard if your game needs it.
- Ads/Analytics/Push are Noop in this repo. Replace them with platform SDK adapters.

### Scene modes
- The framework supports both single-scene and multi-scene projects.
- `FrameworkBootstrap` is persistent by default and auto-adds `AppController`.
- For multi-scene mode, implement your Home UI to emit `app/play`, and gameplay to emit `app/restart` or `app/backToHome`.
