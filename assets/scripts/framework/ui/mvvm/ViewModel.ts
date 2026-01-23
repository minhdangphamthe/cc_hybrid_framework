import { Lifetime } from '../../core/Lifetime';

/** Base ViewModel with a lifetime for subscriptions. */
export class ViewModel {
  private _life = new Lifetime();

  get life(): Lifetime {
    return this._life;
  }

  dispose(): void {
    this._life.dispose();
  }
}
