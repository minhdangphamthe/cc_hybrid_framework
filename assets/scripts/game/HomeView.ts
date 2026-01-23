import { _decorator, Component } from 'cc';
import { ServiceLocator } from '../framework/core/ServiceLocator';
import { EventBus } from '../framework/core/EventBus';
import { Services } from '../framework/services/ServiceTokens';
import { AppEvents } from '../framework/app/AppEvents';
import { AppEvent } from '../framework/app/AppConstants';

const { ccclass } = _decorator;

@ccclass('HomeView')
export class HomeView extends Component {
  private _bus!: EventBus<AppEvents>;

  onLoad(): void {
    this._bus = ServiceLocator.resolve<EventBus<AppEvents>>(Services.EventBus);
  }

  onClickPlay(): void {
    this._bus.emit(AppEvent.Play, {});
  }
}