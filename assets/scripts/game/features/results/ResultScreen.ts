import { _decorator, Button, Label } from 'cc';
import { UIScreen } from '../../../framework/ui/UIScreen';
import { Binder } from '../../../framework/ui/mvvm/Binder';
import { ServiceLocator } from '../../../framework/core/ServiceLocator';
import type { EventBus } from '../../../framework/core/EventBus';
import { Services } from '../../../framework/services/ServiceTokens';
import { AppEvent } from '../../../framework/app/AppConstants';
import type { AppEvents } from '../../../framework/app/AppEvents';
import type { ResultVM } from './ResultVM';
import type { GameSessionVM } from '../../shared/GameSessionVM';

const { ccclass, property } = _decorator;

@ccclass('ResultScreen')
export class ResultScreen extends UIScreen {
  @property(Label) titleLabel: Label | null = null;
  @property(Label) detailLabel: Label | null = null;
  @property(Button) restartButton: Button | null = null;
  @property(Button) backButton: Button | null = null;

  private _binder = new Binder();
  private _bus: EventBus<AppEvents> | null = null;

  onCreate(params?: { vm: ResultVM; session: GameSessionVM }): void {
    this._bus = ServiceLocator.tryResolve<EventBus<AppEvents>>(Services.EventBus);

    const vm = params?.vm;
    if (vm && this.titleLabel) this._binder.bindLabelText(this.titleLabel, vm.title);
    if (vm && this.detailLabel) this._binder.bindLabelText(this.detailLabel, vm.detail);

    this.restartButton?.node.on(Button.EventType.CLICK, this._onRestart, this);
    this.backButton?.node.on(Button.EventType.CLICK, this._onBack, this);

    this._life.own({ dispose: () => this._binder.dispose() });
  }

  onDispose(): void {
    this.restartButton?.node.off(Button.EventType.CLICK, this._onRestart, this);
    this.backButton?.node.off(Button.EventType.CLICK, this._onBack, this);
  }

  private _onRestart(): void {
    this._bus?.emit(AppEvent.Restart, {});
  }

  private _onBack(): void {
    this._bus?.emit(AppEvent.BackToHome, {});
  }
}
