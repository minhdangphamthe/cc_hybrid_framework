import { _decorator, Button, Label } from 'cc';
import { UIScreen } from '../../../framework/ui/UIScreen';
import { Binder } from '../../../framework/ui/mvvm/Binder';
import { ServiceLocator } from '../../../framework/core/ServiceLocator';
import type { EventBus } from '../../../framework/core/EventBus';
import { Services } from '../../../framework/services/ServiceTokens';
import { AppEvent } from '../../../framework/app/AppConstants';
import type { AppEvents } from '../../../framework/app/AppEvents';
import type { GameplayVM } from './GameplayVM';
import type { GameSessionVM } from '../../shared/GameSessionVM';

const { ccclass, property } = _decorator;

@ccclass('GameplayScreen')
export class GameplayScreen extends UIScreen {
  @property(Label) scoreLabel: Label | null = null;
  @property(Button) winButton: Button | null = null;
  @property(Button) loseButton: Button | null = null;
  @property(Button) backButton: Button | null = null;

  private _binder = new Binder();
  private _bus: EventBus<AppEvents> | null = null;
  private _session: GameSessionVM | null = null;
  private _vm: GameplayVM | null = null;

  onCreate(params?: { vm: GameplayVM; session: GameSessionVM }): void {
    this._bus = ServiceLocator.tryResolve<EventBus<AppEvents>>(Services.EventBus);
    this._session = params?.session ?? null;
    this._vm = params?.vm ?? null;

    if (this._vm && this.scoreLabel) {
      this._binder.bindLabelText(this.scoreLabel, this._vm.scoreText);
    }

    this.winButton?.node.on(Button.EventType.CLICK, this._onWin, this);
    this.loseButton?.node.on(Button.EventType.CLICK, this._onLose, this);
    this.backButton?.node.on(Button.EventType.CLICK, this._onBack, this);

    this._life.own({ dispose: () => this._binder.dispose() });
  }

  onDispose(): void {
    {
      const node = this.winButton?.node;
      if (node && node.isValid) node.off(Button.EventType.CLICK, this._onWin, this);
    }
    {
      const node = this.loseButton?.node;
      if (node && node.isValid) node.off(Button.EventType.CLICK, this._onLose, this);
    }
    {
      const node = this.backButton?.node;
      if (node && node.isValid) node.off(Button.EventType.CLICK, this._onBack, this);
    }
  }

  private _onWin(): void {
    if (!this._session) return;
    const score = this._session.score.value + 10;
    this._session.score.value = score;
    this._session.isWin.value = true;

    this._vm?.setScore(score);
    this._bus?.emit(AppEvent.Result, { win: true, score });
  }

  private _onLose(): void {
    if (!this._session) return;
    const score = this._session.score.value;
    this._session.isWin.value = false;
    this._bus?.emit(AppEvent.Result, { win: false, score });
  }

  private _onBack(): void {
    this._bus?.emit(AppEvent.BackToHome, {});
  }
}
