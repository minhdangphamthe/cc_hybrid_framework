import { _decorator, Component, Node } from 'cc';
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

import { GameEvents } from './example/ExampleEvents';

const { ccclass, property } = _decorator;

/**
 * Attach this component to a persistent node in your first scene.
 * In production: replace Noop services with real implementations.
 */
@ccclass('FrameworkBootstrap')
export class FrameworkBootstrap extends Component {
  @property({ type: Node, tooltip: 'Optional: UI root for router/popups' })
  uiRoot: Node | null = null;

  onLoad(): void {
    // Register a typed event bus for your project (you can replace GameEvents with your own map).
    ServiceLocator.register('EventBus', new EventBus<GameEvents>());

    // Register default services
    ServiceLocator.register(Services.Assets, new CocosAssetsService());
    ServiceLocator.register(Services.Audio, new NoopAudioService());
    const input = new CocosInputService();
    input.init?.();
    ServiceLocator.register(Services.Input, input);
    ServiceLocator.register(Services.Save, new CocosSaveService('game_'));
    ServiceLocator.register(Services.Network, new FetchNetworkService());
    ServiceLocator.register(Services.Ads, new NoopAdsService());
    ServiceLocator.register(Services.Analytics, new NoopAnalyticsService());
    ServiceLocator.register(Services.Push, new NoopPushNotificationService());
    ServiceLocator.register(Services.Time, new JsTimeService());
  }

  onDestroy(): void {
    // Optional: cleanup services that need dispose
    ServiceLocator.tryResolve<any>(Services.Input)?.dispose?.();
    ServiceLocator.tryResolve<any>(Services.Assets)?.dispose?.();
    ServiceLocator.tryResolve<any>(Services.Audio)?.dispose?.();
    ServiceLocator.tryResolve<any>(Services.Network)?.dispose?.();
    ServiceLocator.tryResolve<any>(Services.Ads)?.dispose?.();
    ServiceLocator.tryResolve<any>(Services.Analytics)?.dispose?.();
    ServiceLocator.tryResolve<any>(Services.Push)?.dispose?.();
    ServiceLocator.tryResolve<any>(Services.Time)?.dispose?.();

    ServiceLocator.tryResolve<any>('EventBus')?.clear?.();
    ServiceLocator.reset();
  }
}
