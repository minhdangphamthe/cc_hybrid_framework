import { _decorator, Component } from 'cc';
import { EventBus } from '../core/EventBus';
import { FSM, IState } from '../core/FSM';
import { ServiceLocator } from '../core/ServiceLocator';
import { Services } from '../services/ServiceTokens';
import { IAnalyticsService } from '../services/interfaces/IAnalyticsService';
import { GameEvents } from './ExampleEvents';

const { ccclass } = _decorator;

@ccclass('ExampleGameFlow')
export class ExampleGameFlow extends Component {
  private _fsm = new FSM();
  private _bus!: EventBus<GameEvents>;

  onLoad(): void {
    this._bus = ServiceLocator.resolve<EventBus<GameEvents>>(Services.EventBus);
    const analytics = ServiceLocator.tryResolve<IAnalyticsService>(Services.Analytics);

    const boot: IState = {
      name: 'Boot',
      onEnter: () => {
        analytics?.logEvent('boot_enter');
        this._fsm.transition('Home');
      },
    };

    const home: IState = {
      name: 'Home',
      onEnter: () => {
        analytics?.logEvent('home_enter');
        // In a real game: show Home UI and wait for user action.
        this.scheduleOnce(() => this._fsm.transition('Gameplay'), 0.2);
      },
    };

    const gameplay: IState = {
      name: 'Gameplay',
      onEnter: () => {
        analytics?.logEvent('gameplay_enter');
        this._bus.emit('game/start', {});
        // Simulate win after 2s.
        this.scheduleOnce(() => {
          this._bus.emit('game/win', { score: 123 });
          this._fsm.transition('Result', { win: true, score: 123 });
        }, 2);
      },
      onExit: () => {
        // Cleanup gameplay here.
      },
    };

    const result: IState = {
      name: 'Result',
      onEnter: (_prev, data) => {
        analytics?.logEvent('result_enter', { win: !!data?.win, score: data?.score ?? 0 });
        // Simulate back to home.
        this.scheduleOnce(() => this._fsm.transition('Home'), 1);
      },
    };

    this._fsm.add(boot).add(home).add(gameplay).add(result);
  }

  start(): void {
    this._fsm.transition('Boot');
  }

  update(dt: number): void {
    this._fsm.update(dt);
  }

  onDestroy(): void {
    this._fsm.dispose();
  }
}
