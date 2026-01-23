import { EventMap } from './Types';
import { IDisposable } from './Lifetime';

type Handler<P> = (payload: P) => void;

class OffHandle implements IDisposable {
  constructor(private _off: () => void) {}
  dispose(): void { this._off(); }
}

/**
 * Typed EventBus.
 * - on() returns IDisposable for auto-unsubscribe
 * - emit() synchronous by default (predictable)
 */
export class EventBus<E extends EventMap> {
  private _handlers = new Map<keyof E, Set<Function>>();

  on<K extends keyof E>(event: K, handler: Handler<E[K]>): IDisposable {
    let set = this._handlers.get(event);
    if (!set) {
      set = new Set();
      this._handlers.set(event, set);
    }
    set.add(handler as any);
    return new OffHandle(() => this.off(event, handler));
  }

  off<K extends keyof E>(event: K, handler: Handler<E[K]>): void {
    const set = this._handlers.get(event);
    if (!set) return;
    set.delete(handler as any);
    if (set.size === 0) this._handlers.delete(event);
  }

  emit<K extends keyof E>(event: K, payload: E[K]): void {
    const set = this._handlers.get(event);
    if (!set) return;
    // copy to avoid mutation issues during emit
    const arr = Array.from(set);
    for (const fn of arr) {
      try { (fn as Handler<E[K]>)(payload); } catch (e) { /* swallow */ }
    }
  }

  clear(): void {
    this._handlers.clear();
  }
}
