import type { IDisposable } from '../../core/Lifetime';

export interface LoadingOverlayOptions {
  /**
   * Keep overlay visible for at least this duration (ms) after being shown.
   * Useful to avoid "flash" when work finishes quickly.
   */
  minDurationMs?: number;
}

export interface ILoadingOverlayService {
  /** Show overlay; returns a handle that hides it when disposed. */
  show(opts?: LoadingOverlayOptions): IDisposable;

  /** Force hide and reset reference count. */
  hideAll(): void;

  /** True if overlay is currently visible. */
  isVisible(): boolean;
}
