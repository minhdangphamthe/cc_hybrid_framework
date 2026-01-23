import { _decorator, Component, director, Enum, Node } from 'cc';
import { EventBus } from './core/EventBus';
import { ServiceLocator } from './core/ServiceLocator';
import { Services } from './services/ServiceTokens';

import { AppController } from './app/AppController';
import { CocosAssetsService } from './services/impl/CocosAssetsService';
import { CocosInputService } from './services/impl/CocosInputService';
import { CocosSaveService } from './services/impl/CocosSaveService';
import { CocosSceneService } from './services/impl/CocosSceneService';
import { FetchNetworkService } from './services/impl/FetchNetworkService';
import { JsTimeService } from './services/impl/JsTimeService';
import { NoopAdsService } from './services/impl/NoopAdsService';
import { NoopAnalyticsService } from './services/impl/NoopAnalyticsService';
import { NoopAudioService } from './services/impl/NoopAudioService';
import { NoopPushNotificationService } from './services/impl/NoopPushNotificationService';
import {  SceneMode } from './app/AppConstants';

const { ccclass, property } = _decorator;

const DEFAULT_SAVE_PREFIX = 'game_';

/**
 * Attach this component to a node in your first scene.
 * - By default, the node is made persistent (survives scene changes).
 * - Registers core services into ServiceLocator.
 * - Optionally auto-adds AppController to drive the app flow.
 */
@ccclass('FrameworkBootstrap')
export class FrameworkBootstrap extends Component {
  @property({ tooltip: 'Keep this node alive across scene changes (recommended).' })
  persistAcrossScenes = true;

  @property({ tooltip: 'Auto add AppController to drive AppFlow FSM.' })
  autoAddAppController = true;

  @property({
    type: Enum(SceneMode),
    tooltip: 'App mode: Single uses one scene; Multi loads scenes via ISceneService.',
  })
  sceneMode: SceneMode = SceneMode.Single;

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

    // Register a global event bus (your project can also register its own typed bus).
    ServiceLocator.register(Services.EventBus, new EventBus<any>());

    this._registerServices();

    if (this.autoAddAppController) {
      const app = this.getComponent(AppController) ?? this.addComponent(AppController);      
      app.configure({
        mode: this.sceneMode,
        scenes:
          this.sceneMode === SceneMode.Multi
            ? {
                home: this.homeScene,
                gameplay: this.gameplayScene,
                result: this.resultScene || undefined,
              }
            : undefined,
      });
    }
  }

  onDestroy(): void {
    // Cleanup services that support dispose().
    const tokens = [
      Services.Input,
      Services.Assets,
      Services.Audio,
      Services.Save,
      Services.Network,
      Services.Ads,
      Services.Analytics,
      Services.Push,
      Services.Time,
      Services.Scene,
      Services.UI,
    ];

    for (const t of tokens) {
      ServiceLocator.tryResolve<any>(t)?.dispose?.();
    }

    ServiceLocator.tryResolve<any>(Services.EventBus)?.clear?.();
    ServiceLocator.reset();
  }

  private _registerServices(): void {
    const assets = new CocosAssetsService();
    const audio = new NoopAudioService();
    const input = new CocosInputService();
    const save = new CocosSaveService(DEFAULT_SAVE_PREFIX);
    const network = new FetchNetworkService();
    const ads = new NoopAdsService();
    const analytics = new NoopAnalyticsService();
    const push = new NoopPushNotificationService();
    const time = new JsTimeService();
    const scene = new CocosSceneService();

    ServiceLocator.register(Services.Assets, assets);
    ServiceLocator.register(Services.Audio, audio);
    ServiceLocator.register(Services.Input, input);
    ServiceLocator.register(Services.Save, save);
    ServiceLocator.register(Services.Network, network);
    ServiceLocator.register(Services.Ads, ads);
    ServiceLocator.register(Services.Analytics, analytics);
    ServiceLocator.register(Services.Push, push);
    ServiceLocator.register(Services.Time, time);
    ServiceLocator.register(Services.Scene, scene);

    // Call init() if provided (safe).
    const all = [assets, audio, input, save, network, ads, analytics, push, time, scene];
    for (const s of all) {
      try {
        (s as any).init?.();
      } catch {
        // No-op
      }
    }
  }
}
