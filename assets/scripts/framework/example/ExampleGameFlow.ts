import { _decorator, Component, director } from 'cc';
import { FSM, IState } from '../core/FSM';
import { EventBus } from '../core/EventBus';
import { ServiceLocator } from '../core/ServiceLocator';
import { Services } from '../services/ServiceTokens';
import { IAnalyticsService } from '../services/interfaces/IAnalyticsService';
import { GameEvents } from './ExampleEvents';

const { ccclass } = _decorator;

type AppStates = 'Boot' | 'Home' | 'Gameplay' | 'Result';

@ccclass('ExampleGameFlow')
export class ExampleGameFlow extends Component {
  private fsm = new FSM();
  private bus!: EventBus<GameEvents>;

  onLoad(): void {
    this.bus = ServiceLocator.resolve<EventBus<GameEvents>>('EventBus');
    const analytics = ServiceLocator.tryResolve<IAnalyticsService>(Services.Analytics);

    const boot: IState = {
      name: 'Boot',
      onEnter: () => {
        analytics?.logEvent('boot_enter');
        this.fsm.transition('Home');
      },
    };

    const home: IState = {
      name: 'Home',
      onEnter: () => {
        analytics?.logEvent('home_enter');
        // In real game: show home UI, wait user click play
        this.scheduleOnce(() => this.fsm.transition('Gameplay'), 0.2);
      },
    };

    const gameplay: IState = {
      name: 'Gameplay',
      onEnter: () => {
        analytics?.logEvent('gameplay_enter');
        this.bus.emit('game/start', {});
        // Simulate win after 2s
        this.scheduleOnce(() => {
          this.bus.emit('game/win', { score: 123 });
          this.fsm.transition('Result', { win: true, score: 123 });
        }, 2);
      },
      onExit: () => {
        // cleanup gameplay
      },
    };

    const result: IState = {
      name: 'Result',
      onEnter: (_prev, data) => {
        analytics?.logEvent('result_enter', { win: !!data?.win, score: data?.score ?? 0 });
        // Simulate back to home
        this.scheduleOnce(() => this.fsm.transition('Home'), 1);
      },
    };

    this.fsm.add(boot).add(home).add(gameplay).add(result);
  }

  start(): void {
    this.fsm.transition('Boot');
  }

  update(dt: number): void {
    this.fsm.update(dt);
  }

  onDestroy(): void {
    this.fsm.dispose();
  }
}
