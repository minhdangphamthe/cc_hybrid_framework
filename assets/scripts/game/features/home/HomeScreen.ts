import { _decorator, Button, Label } from 'cc';
import { UIScreen } from '../../../framework/ui/UIScreen';
import { Binder } from '../../../framework/ui/mvvm/Binder';
import { ServiceLocator } from '../../../framework/core/ServiceLocator';
import type { EventBus } from '../../../framework/core/EventBus';
import { Services } from '../../../framework/services/ServiceTokens';
import { AppEvent } from '../../../framework/app/AppConstants';
import type { AppEvents } from '../../../framework/app/AppEvents';
import type { HomeVM } from './HomeVM';
import type { GameSessionVM } from '../../shared/GameSessionVM';

const { ccclass, property } = _decorator;

@ccclass('HomeScreen')
export class HomeScreen extends UIScreen {
  @property(Label) titleLabel: Label | null = null;
  @property(Label) hintLabel: Label | null = null;
  @property(Button) playButton: Button | null = null;

  private _binder = new Binder();
  private _bus: EventBus<AppEvents> | null = null;

  onCreate(params?: { vm: HomeVM; session: GameSessionVM }): void {
    this._bus = ServiceLocator.tryResolve<EventBus<AppEvents>>(Services.EventBus);

    const vm = params?.vm;
    if (vm && this.titleLabel) this._binder.bindLabelText(this.titleLabel, vm.title);
    if (vm && this.hintLabel) this._binder.bindLabelText(this.hintLabel, vm.hint);

    if (this.playButton) {
      this.playButton.node.on(Button.EventType.CLICK, this._onPlay, this);
    }

    // Auto cleanup binder on destroy.
    this._life.own({ dispose: () => this._binder.dispose() });
  }

  onDispose(): void {
    if (this.playButton) {
      this.playButton.node.off(Button.EventType.CLICK, this._onPlay, this);
    }
  }

  private _onPlay(): void {
    this._bus?.emit(AppEvent.Play, {});
  }
}
