import { _decorator, Component } from 'cc';
import { ServiceLocator } from '../../framework/core/ServiceLocator';
import type { EventBus } from '../../framework/core/EventBus';
import { Lifetime } from '../../framework/core/Lifetime';
import { Services } from '../../framework/services/ServiceTokens';
import { AppEvent, AppState } from '../../framework/app/AppConstants';
import type { AppEvents } from '../../framework/app/AppEvents';
import type { IUIService } from '../../framework/services/interfaces/IUIService';
import { UIWarmup } from '../../framework/ui/utils/UIWarmup';

import { GameSessionVM } from '../shared/GameSessionVM';
import { HomeVM } from '../features/home/HomeVM';
import { GameplayVM } from '../features/gameplay/GameplayVM';
import { ResultVM } from '../features/results/ResultVM';

const { ccclass, property } = _decorator;

/**
 * GameEntry is the only place that wires "app state" -> "screens".
 * - Keep framework code and game code separate.
 * - SceneMode.Single recommended: one scene contains FrameworkBootstrap + UIRoot + GameEntry.
 */
@ccclass('GameEntry')
export class GameEntry extends Component {
  @property({ tooltip: 'Resources path for Home screen prefab.' })
  homeScreenPath = 'ui/screens/HomeScreen';

  @property({ tooltip: 'Resources path for Gameplay screen prefab.' })
  gameplayScreenPath = 'ui/screens/GameplayScreen';

  @property({ tooltip: 'Resources path for Result screen prefab.' })
  resultScreenPath = 'ui/screens/ResultScreen';

  @property({ tooltip: 'Preload and warm up heavy screens offscreen to reduce micro-glitches.' })
  enableUiPrewarm = true;

  private _life = new Lifetime();

  private _bus: EventBus<AppEvents> | null = null;
  private _ui: IUIService | null = null;

  private _session = new GameSessionVM();
  private _homeVM = new HomeVM();
  private _gameplayVM = new GameplayVM();
  private _resultVM = new ResultVM();

  onLoad(): void {
    // Defer resolving services until start() to avoid script execution order issues.
  }

  start(): void {
    this._bus = ServiceLocator.tryResolve<EventBus<AppEvents>>(Services.EventBus);
    this._ui = ServiceLocator.tryResolve<IUIService>(Services.UI);

    if (!this._bus || !this._ui) {
      // eslint-disable-next-line no-console
      console.warn('[GameEntry] Missing Services.EventBus or Services.UI. Ensure FrameworkBootstrap + UIRoot are in the scene.');
      return;
    }

    // Drive UI based on AppController state changes.
    if (this.enableUiPrewarm) void this._prewarmUi();

    this._life.own(this._bus.on(AppEvent.StateChanged, (p) => void this._onStateChanged(p)));

    // If AppController is not present, you can still start Home manually:
    // void this._showHome();
  }

  onDestroy(): void {
    this._life.dispose();
  }

  private async _prewarmUi(): Promise<void> {
    if (!this._ui) return;

    try {
      // Ensure current frame is free (don't block the first render).
      await UIWarmup.nextFrame();

      // Preload screen prefabs (engine caches them).
      await this._ui.preloadView(this.homeScreenPath);
      await this._ui.preloadView(this.gameplayScreenPath);
      await this._ui.preloadView(this.resultScreenPath);

      // Warm up non-home screens with light params (optional).
      await UIWarmup.nextFrame();
      await this._ui.warmupView(this.gameplayScreenPath, { vm: this._gameplayVM, session: this._session });
      await this._ui.warmupView(this.resultScreenPath, { vm: this._resultVM, session: this._session });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[GameEntry] UI prewarm failed', e);
    }
  }

  private async _onStateChanged(payload: { state: AppState; data?: any }): Promise<void> {
    if (!this._ui) return;

    if (payload.state === AppState.Home) {
      this._session.reset();
      await this._ui.replaceScreen(this.homeScreenPath, { vm: this._homeVM, session: this._session });
      return;
    }

    if (payload.state === AppState.Gameplay) {
      // Sync UI VM from session data (example).
      this._gameplayVM.setScore(this._session.score.value);
      await this._ui.replaceScreen(this.gameplayScreenPath, { vm: this._gameplayVM, session: this._session });
      return;
    }

    if (payload.state === AppState.Result) {
      const win = payload.data?.win ?? this._session.isWin.value ?? true;
      const score = payload.data?.score ?? this._session.score.value ?? 0;
      this._resultVM.setResult(win, score);

      await this._ui.replaceScreen(this.resultScreenPath, {
        vm: this._resultVM,
        session: this._session,
      });
    }
  }
}
