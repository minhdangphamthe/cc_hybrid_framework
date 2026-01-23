import { _decorator, Component, director, Node } from 'cc';
import { ServiceLocator } from './core/ServiceLocator';
import { EventBus } from './core/EventBus';
import { Services } from './services/ServiceTokens';

import { CocosAssetsService } from './services/impl/CocosAssetsService';
import { NoopAudioService } from './services/impl/NoopAudioService';
import { CocosInputService } from './services/impl/CocosInputService';
import { CocosSaveService } from './services/impl/CocosSaveService';
import { FetchNetworkService } from './services/impl/FetchNetworkService';
import { NoopAdsService } from './services/impl/NoopAdsService';
import { NoopAnalyticsService } from './services/impl/NoopAnalyticsService';
import { NoopPushNotificationService } from './services/impl/NoopPushNotificationService';
import { JsTimeService } from './services/impl/JsTimeService';
import { CocosSceneService } from './services/impl/CocosSceneService';

import { AppController } from './app/AppController';

const { ccclass, property } = _decorator;

type SceneMode = 'single' | 'multi';

/**
 * Attach this component to a node in your first scene.
 * - Default: node is made persistent (survives scene changes).
 * - Registers core services into ServiceLocator.
 * - Optionally auto-adds AppController to drive the app flow.
 */
@ccclass('FrameworkBootstrap')
export class FrameworkBootstrap extends Component {
  @property({ tooltip: 'Keep this node alive across scene changes (recommended).' })
  persistAcrossScenes = true;

  @property({ tooltip: 'Auto add AppController to drive AppFlow FSM.' })
  autoAddAppController = true;

  @property({ tooltip: "App mode: 'single' uses one scene; 'multi' loads scenes via ISceneService." })
  sceneMode: SceneMode = 'single';

  @property({ tooltip: 'Home scene name (multi-scene mode).' })
  homeScene = 'Home';

  @property({ tooltip: 'Gameplay scene name (multi-scene mode).' })
  gameplayScene = 'Gameplay';

  @property({ tooltip: 'Result scene name (optional, multi-scene mode).' })
  resultScene = 'Result';

  @property({ tooltip: 'Optional: UI root for router/popups.' })
  uiRoot: Node | null = null;

  onLoad(): void {
    if (this.persistAcrossScenes) {
      director.addPersistRootNode(this.node);
    }

    // Register a global event bus (type is project-defined; keep it generic here).
    ServiceLocator.register('EventBus', new EventBus<any>());

    // Register default services
    this.registerServices();

    if (this.autoAddAppController) {
      const app = this.getComponent(AppController) ?? this.addComponent(AppController);
      app.configure({
        mode: this.sceneMode,
        scenes: this.sceneMode === 'multi'
          ? { home: this.homeScene, gameplay: this.gameplayScene, result: this.resultScene || undefined }
          : undefined,
      });
    }
  }

  onDestroy(): void {
    // Optional: cleanup services that need dispose
    const tokens = [
      Services.Input,
      Services.Assets,
      Services.Audio,
      Services.Network,
      Services.Ads,
      Services.Analytics,
      Services.Push,
      Services.Time,
      Services.Scene,
    ];

    for (const t of tokens) {
      ServiceLocator.tryResolve<any>(t)?.dispose?.();
    }

    ServiceLocator.tryResolve<any>('EventBus')?.clear?.();
    ServiceLocator.reset();
  }

  private registerServices(): void {
    const assets = new CocosAssetsService();
    ServiceLocator.register(Services.Assets, assets);

    const audio = new NoopAudioService();
    ServiceLocator.register(Services.Audio, audio);

    const input = new CocosInputService();
    input.init?.();
    ServiceLocator.register(Services.Input, input);

    const save = new CocosSaveService('game_');
    ServiceLocator.register(Services.Save, save);

    const network = new FetchNetworkService();
    ServiceLocator.register(Services.Network, network);

    const ads = new NoopAdsService();
    ServiceLocator.register(Services.Ads, ads);

    const analytics = new NoopAnalyticsService();
    ServiceLocator.register(Services.Analytics, analytics);

    const push = new NoopPushNotificationService();
    ServiceLocator.register(Services.Push, push);

    const time = new JsTimeService();
    ServiceLocator.register(Services.Time, time);

    const scene = new CocosSceneService();
    ServiceLocator.register(Services.Scene, scene);

    // Call init() if provided (safe).
    const all = [assets, audio, save, network, ads, analytics, push, time, scene];
    for (const s of all) {
      try { (s as any).init?.(); } catch {}
    }
  }
}
