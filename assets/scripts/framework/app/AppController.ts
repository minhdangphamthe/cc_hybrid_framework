import { _decorator, Component } from 'cc';
import { FSM, IState } from '../core/FSM';
import { EventBus } from '../core/EventBus';
import { IDisposable, Lifetime } from '../core/Lifetime';
import { ServiceLocator } from '../core/ServiceLocator';
import { Services } from '../services/ServiceTokens';
import { ISceneService } from '../services/interfaces/ISceneService';
import { IAnalyticsService } from '../services/interfaces/IAnalyticsService';
import { AppControllerOptions } from './AppTypes';
import { AppEvents } from './AppEvents';
import { AppEvent, SceneMode, AppState } from './AppConstants';
import { AnalyticsEvent } from '../analytics/AnalyticsEvents';

const { ccclass } = _decorator;

@ccclass('AppController')
export class AppController extends Component {
  private _fsm = new FSM();
  private _life = new Lifetime();
  private _pendingWait: IDisposable | null = null;
  private _bus!: EventBus<AppEvents>;
  private _scene!: ISceneService;
  private _analytics: IAnalyticsService | null = null;

  private _opts: AppControllerOptions = {
    mode: SceneMode.Single,
    autoPlayFromHome: false,
    autoPlayDelaySec: 0.2,
  };

  /** Called by FrameworkBootstrap (optional) */
  configure(opts: Partial<AppControllerOptions>): void {
    this._opts = { ...this._opts, ...opts };
  }

  onLoad(): void {
    this._bus = ServiceLocator.resolve<EventBus<AppEvents>>(Services.EventBus);
    this._scene = ServiceLocator.tryResolve<ISceneService>(Services.Scene) as any;
    this._analytics = ServiceLocator.tryResolve<IAnalyticsService>(Services.Analytics);

    const boot: IState = {
      name: 'Boot',
      onEnter: async () => {
        this._analytics?.logEvent(AnalyticsEvent.AppBootEnter);
        // Go next immediately; preload can be done by services/feature layer.
        this._fsm.transition(AppState.Home);
      },
    };

    const home: IState = {
      name: 'Home',
      onEnter: async () => {
        this._analytics?.logEvent(AnalyticsEvent.AppHomeEnter);
        this._bus.emit(AppEvent.StateChanged, { state: AppState.Home });

        if (this._opts.mode === SceneMode.Multi && this._opts.scenes?.home) {
          await this.safeLoadScene(this._opts.scenes.home);
        }

        if (this._opts.autoPlayFromHome) {
          this.scheduleOnce(() => this._fsm.transition(AppState.Gameplay), this._opts.autoPlayDelaySec ?? 0.2);
          return;
        }

        // Wait for UI to emit app/play
        await this.waitEvent(AppEvent.Play);
        this._fsm.transition(AppState.Gameplay);
      },
      onExit: () => {
        this.unscheduleAllCallbacks();
      },
    };

    const gameplay: IState = {
      name: 'Gameplay',
      onEnter: async () => {
        this._analytics?.logEvent(AnalyticsEvent.AppGameplayEnter);
        this._bus.emit(AppEvent.StateChanged, { state: AppState.Gameplay });

        if (this._opts.mode === SceneMode.Multi && this._opts.scenes?.gameplay) {
          await this.safeLoadScene(this._opts.scenes.gameplay);
        }

        // In production: your GameplayController should emit app/restart, app/result, or app/backToHome.
        const which = await this.waitAny([AppEvent.Restart, AppEvent.Result, AppEvent.BackToHome] as const);
        if (which === AppEvent.Restart) {
          // Most games restart gameplay directly.
          this._fsm.transition(AppState.Gameplay);
          return;
        }

        if (which === AppEvent.Result) {
          // Go to Result when available; otherwise fall back to Home.
          if (this._opts.mode === SceneMode.Multi && !this._opts.scenes?.result) {
            this._fsm.transition(AppState.Home);
          } else {
            this._fsm.transition(AppState.Result);
          }
          return;
        }

        this._fsm.transition(AppState.Home);
      },
      onExit: () => {
        this.unscheduleAllCallbacks();
      },
    };

    const result: IState = {
      name: 'Result',
      onEnter: async () => {
        this._analytics?.logEvent(AnalyticsEvent.AppResultEnter);
        this._bus.emit(AppEvent.StateChanged, { state: AppState.Result });

        if (this._opts.mode === SceneMode.Multi && this._opts.scenes?.result) {
          await this.safeLoadScene(this._opts.scenes.result);
        }

        // Wait user action
        const which = await this.waitAny([AppEvent.Restart, AppEvent.BackToHome] as const);
        this._fsm.transition(which === AppEvent.Restart ? AppState.Gameplay : AppState.Home);
      },
    };

    this._fsm.add(boot).add(home).add(gameplay).add(result);
  }

  start(): void {
    // Start app
    this._fsm.transition(AppState.Boot);
  }

  update(dt: number): void {
    this._fsm.update(dt);
  }

  onDestroy(): void {
    this._pendingWait?.dispose();
    this._life.dispose();
    this._fsm.dispose();
  }

  private waitEvent<K extends keyof AppEvents>(event: K): Promise<AppEvents[K]> {
    return new Promise((resolve) => {
      const off = this._bus.on(event, (payload) => {
        this._pendingWait = null;
        off.dispose();
        resolve(payload);
      });
      this._pendingWait = off;
    });
  }

  private waitAny<const T extends readonly (keyof AppEvents)[]>(events: T): Promise<T[number]> {
    return new Promise((resolve) => {
      const offs = events.map((ev) =>
        this._bus.on(ev, () => {
          // dispose all
          for (const o of offs) o.dispose();
          resolve(ev);
        })
      );
    });
  }

  private async safeLoadScene(sceneName: string): Promise<void> {
    if (!this._scene) return;
    try {
      await this._scene.loadScene(sceneName, {
        preload: true,
        onProgress: (p) => {
          // Optional: broadcast progress to UI
          this._bus.emit(AppEvent.StateChanged, { state: AppState.Loading, data: p });
        },
      });
    } catch (e: any) {
      // Keep running even if scene fails (fail-safe)
      // eslint-disable-next-line no-console
      console.warn('[AppController] loadScene failed:', e?.message ?? e);
    }
  }
}
