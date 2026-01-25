import type { IDisposable } from '../../core/Lifetime';

export interface LoadingOverlayOptions {
  /** Optional message shown on overlay. */
  message?: string;

  /** If true, blocks clicks/touches while overlay is visible. Default: true. */
  blockInput?: boolean;

  /**
   * Keep overlay visible for at least this duration (ms) after being shown.
   * Useful to avoid "flash" when work finishes quickly.
   */
  minDurationMs?: number;
}

export interface ILoadingOverlayService {
  /** Show overlay; returns a handle that hides it when disposed. */
  show(opts?: LoadingOverlayOptions): IDisposable;

  /** Update message (no-op if overlay does not exist). */
  setMessage(message: string): void;

  /** Force hide and reset reference count. */
  hideAll(): void;

  /** True if overlay is currently visible. */
  isVisible(): boolean;
}
