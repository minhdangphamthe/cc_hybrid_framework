import { _decorator, Component } from 'cc';
import { ServiceLocator } from '../framework/core/ServiceLocator';
import { EventBus } from '../framework/core/EventBus';
import { Services } from '../framework/services/ServiceTokens';
import { AppEvents } from '../framework/app/AppEvents';
import { AppEvent } from '../framework/app/AppConstants';

const { ccclass } = _decorator;

@ccclass('ResultScreenView')
export class ResultScreenView extends Component {
  private _bus!: EventBus<AppEvents>;

  onLoad(): void {
    this._bus = ServiceLocator.resolve<EventBus<AppEvents>>(Services.EventBus);    
  }

  onClickHome(): void {
    this._bus.emit(AppEvent.BackToHome, {});
  }
  
  onClickRetry(): void {
    this._bus.emit(AppEvent.Restart, {});
  }
}