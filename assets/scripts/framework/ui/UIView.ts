import { _decorator, Component } from 'cc';
import { Lifetime } from '../core/Lifetime';
import { TransitionKind, UITransition } from './UITransition';

const { ccclass, property } = _decorator;

@ccclass('UIView')
export class UIView extends Component {
  @property({ tooltip: 'Animation used when show/hide view.' })
  transition: TransitionKind = TransitionKind.ScaleFade;

  protected _life = new Lifetime();

  onCreate?(params?: any): void;
  onDispose?(): void;

  async show(): Promise<void> {
    this.node.active = true;
    await UITransition.playIn(this.node, this.transition);
  }

  async hide(): Promise<void> {
    await UITransition.playOut(this.node, this.transition);
    if (this.node && this.node.isValid) this.node.active = false;
  }

  onDestroy(): void {
    try {
      this.onDispose?.();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e);
    }
    this._life.dispose();
  }
}
