# cc_hybrid_framework
A hybrid architecture that use Service Locator (hoặc Singleton) for game service, FSM (State Machine) in gameplay, and MVVM-lite for UI

# Hybrid Framework v0.1 (Unity → Cocos Creator 3.8.x)

Goal: a framework that is **lightweight but clean**, suitable for **hypercasual / casual / mid-core**, easy to reuse across many projects, and easy to port gameplay logic from Unity to Cocos.

## Architecture
- **Core (Infrastructure):** Service Locator + EventBus + Lifetime + FSM
- **Gameplay (In-game):** FSM (AppFlow + InGame) + Object Pooling
- **UI & Meta-game:** MVVM-lite + UI Router/Popup stack

## Services (available in v0.1)
Required / scaffolded out of the box (each has a Noop implementation so the project can run immediately):
- `IAssetsService`
- `IAudioService`
- `IInputService`
- `ISaveService`
- `INetworkService`
- `IAdsService`
- `IAnalyticsService`
- `IPushNotificationService`
- `ITimeService`

### Suggested services to add later (depending on the game)
- `IRemoteConfigService` (feature flags, balancing, A/B testing)
- `ICrashReportingService` (crashes + non-fatal errors)
- `IHapticsService` (vibration/haptics)
- `IDeviceInfoService` (device model, OS, locale, safe-area, notch…)
- `IPermissionsService` (tracking/notifications…)
- `ILocalizationService` (i18n)
- `ISceneService` (scene transitions + loading screen)
- `ICommerceService` (higher-level IAP wrapper, receipts, restore)

## Quick start
1) Copy the folder `assets/scripts/framework` into your Cocos project.
2) In the first scene, create a node named `Framework` and add the component `FrameworkBootstrap`.
3) Implement real services by registering them, e.g. `ServiceLocator.register(Services.Ads, new MyAdsService())`…

See `assets/scripts/framework/example/ExampleGameFlow.ts` for a basic flow example.

