import { _decorator, Component } from 'cc';
import { ServiceLocator } from '../framework/core/ServiceLocator';
import { EventBus } from '../framework/core/EventBus';
import { Services } from '../framework/services/ServiceTokens';
import { AppEvents } from '../framework/app/AppEvents';
import { AppEvent } from '../framework/app/AppConstants';

const { ccclass } = _decorator;

@ccclass('GameplayController')
export class GameplayController extends Component {
  private _bus!: EventBus<AppEvents>;

  onLoad(): void {
    this._bus = ServiceLocator.resolve<EventBus<AppEvents>>(Services.EventBus);
    this._bus.emit(AppEvent.Play, {});
  }

  onClickHome(): void {
    this._bus.emit(AppEvent.BackToHome, {});
  }
  
  onClickNext(): void {
    this._bus.emit(AppEvent.Restart, {});
  }
}