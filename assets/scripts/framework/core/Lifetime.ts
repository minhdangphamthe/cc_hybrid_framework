/** Disposable helper used for auto-cleanup (events, timers, tweens, etc.) */
export interface IDisposable {
  dispose(): void;
}

/** Collects disposables and disposes all at once. */
export class CompositeDisposable implements IDisposable {
  private _items: IDisposable[] = [];
  private _isDisposed = false;

  get isDisposed(): boolean {
    return this._isDisposed;
  }

  add(d: IDisposable): IDisposable {
    if (this._isDisposed) {
      // Dispose immediately if already disposed.
      try { d.dispose(); } catch {}
      return d;
    }
    this._items.push(d);
    return d;
  }

  dispose(): void {
    if (this._isDisposed) return;
    this._isDisposed = true;
    const items = this._items;
    this._items = [];
    for (let i = items.length - 1; i >= 0; i--) {
      try { items[i].dispose(); } catch {}
    }
  }
}

/** Lightweight ownership wrapper. */
export class Lifetime implements IDisposable {
  private _cd = new CompositeDisposable();
  get isDisposed(): boolean { return this._cd.isDisposed; }

  own(d: IDisposable): IDisposable {
    return this._cd.add(d);
  }

  dispose(): void {
    this._cd.dispose();
  }
}
