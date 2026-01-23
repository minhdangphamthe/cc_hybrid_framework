import { IDisposable } from './Lifetime';

export interface IState {
  readonly name: string;
  onEnter?(prevState: string | null, data?: any): void;
  onExit?(nextState: string | null): void;
  onUpdate?(dt: number): void;
}

/** Optional transition guard */
export type TransitionGuard = (from: string, to: string, data?: any) => boolean;

/** Minimal FSM */
export class FSM implements IDisposable {
  private _states = new Map<string, IState>();
  private _current: IState | null = null;
  private _guard: TransitionGuard | null = null;

  get currentName(): string | null { return this._current?.name ?? null; }

  setGuard(guard: TransitionGuard | null): void {
    this._guard = guard;
  }

  add(state: IState): this {
    this._states.set(state.name, state);
    return this;
  }

  has(name: string): boolean {
    return this._states.has(name);
  }

  get(name: string): IState {
    const s = this._states.get(name);
    if (!s) throw new Error(`[FSM] State not found: ${name}`);
    return s;
  }

  transition(to: string, data?: any): void {
    const next = this.get(to);
    const prev = this._current;

    if (prev && this._guard && !this._guard(prev.name, next.name, data)) return;

    if (prev?.onExit) prev.onExit(next.name);
    this._current = next;
    if (next.onEnter) next.onEnter(prev?.name ?? null, data);
  }

  update(dt: number): void {
    this._current?.onUpdate?.(dt);
  }

  dispose(): void {
    // exit current
    if (this._current?.onExit) this._current.onExit(null);
    this._current = null;
    this._states.clear();
    this._guard = null;
  }
}
