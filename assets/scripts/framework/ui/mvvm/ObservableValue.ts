import { IDisposable } from '../../core/Lifetime';

class OffHandle implements IDisposable {
  constructor(private _off: () => void) {}
  dispose(): void { this._off(); }
}

/** Minimal observable value for MVVM-lite */
export class ObservableValue<T> {
  private _v: T;
  private _subs = new Set<(v: T) => void>();

  constructor(initial: T) {
    this._v = initial;
  }

  get value(): T { return this._v; }
  set value(v: T) {
    if (Object.is(this._v, v)) return;
    this._v = v;
    for (const s of Array.from(this._subs)) {
      try { s(this._v); } catch {}
    }
  }

  subscribe(cb: (v: T) => void, fireImmediately = true): IDisposable {
    this._subs.add(cb);
    if (fireImmediately) {
      try { cb(this._v); } catch {}
    }
    return new OffHandle(() => this._subs.delete(cb));
  }
}
