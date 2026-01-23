import { Lifetime } from '../../core/Lifetime';

/** Base ViewModel with lifetime for subscriptions */
export class ViewModel {
  readonly life = new Lifetime();

  dispose(): void {
    this.life.dispose();
  }
}
