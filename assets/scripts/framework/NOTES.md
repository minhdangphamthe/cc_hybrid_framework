## Notes / Caveats v0.1
- `NodePool` uses `getComponentsInChildren(Object as any, true)` to call `onSpawn/onDespawn`.
  You can optimize this by only calling it on components that implement `IPoolable`
  (use a marker interface + a runtime check).
- `UIRouter` is currently a simple push/pop stack. For mid-core use cases, consider adding:
  modal types, async prefab loading, and fade transitions.
- `CocosInputService` currently unifies touch input. If you need mouse/keyboard support,
  add `Input.EventType.MOUSE_*` and keyboard events.
- Ads/Analytics/Push services are currently Noop. Replace them with real adapters
  wired to your platform SDK(s).
