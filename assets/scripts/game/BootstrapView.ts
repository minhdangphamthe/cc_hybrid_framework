import { _decorator, Component, director } from 'cc';
import { ServiceLocator } from '../framework/core/ServiceLocator';
import { Services } from '../framework/services/ServiceTokens';
import type { ISceneService } from '../framework/services/interfaces/ISceneService';

const { ccclass, property } = _decorator;

@ccclass('BootstrapView')
export class BootstrapView extends Component {
  @property({ tooltip: 'Scene name to enter after Boot/Bootstrap scene.' })
  homeScene = 'Home';

  @property({ tooltip: 'Auto load Home scene on start.' })
  autoEnterHome = true;

  @property({ tooltip: 'Retry a few times if services are not registered yet.' })
  maxRetries = 20;

  @property({ tooltip: 'Retry interval in seconds.' })
  retryDelaySec = 0.05;

  start(): void {
    if (!this.autoEnterHome) return;

    // Defer a tick so FrameworkBootstrap.onLoad() has time to register services.
    this.scheduleOnce(() => {
      this._tryEnterHome(0);
    }, 0);
  }

  private async _tryEnterHome(attempt: number): Promise<void> {
    const sceneSvc = ServiceLocator.tryResolve<ISceneService>(Services.Scene);
    if (sceneSvc) {
      await sceneSvc.loadScene(this.homeScene, { preload: true });
      return;
    }

    // Fallback if Scene service isn't present: load directly.
    // This is useful when a project doesn't register ISceneService.
    if (attempt === 0) {
      try {
        director.loadScene(this.homeScene);
        return;
      } catch {
        // keep retrying ServiceLocator path below
      }
    }

    if (attempt >= this.maxRetries) return;
    this.scheduleOnce(() => {
      void this._tryEnterHome(attempt + 1);
    }, this.retryDelaySec);
  }
}