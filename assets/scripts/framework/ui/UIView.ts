import { _decorator, Component, Enum } from 'cc';
import { Lifetime } from '../core/Lifetime';
import { TransitionKind, UITransition } from './UITransition';

const { ccclass, property } = _decorator;

@ccclass('UIView')
export class UIView extends Component {
  @property({ type: Enum(TransitionKind), tooltip: 'Animation used when show/hide view.' })
  transition: TransitionKind = TransitionKind.ScaleFade;

  protected _life = new Lifetime();

  onCreate?(params?: any): void;
  onPreload?(params?: any): Promise<void> | void;
  onBeforeShow?(params?: any): Promise<void> | void;
  onAfterShow?(params?: any): void;
  onBeforeHide?(): Promise<void> | void;
  onDispose?(): void;

  async show(): Promise<void> {
    this.node.active = true;
    await UITransition.playIn(this.node, this.transition);
    try {
      this.onAfterShow?.();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e);
    }
  }

  async hide(): Promise<void> {
    try {
      await this.onBeforeHide?.();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e);
    }
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
