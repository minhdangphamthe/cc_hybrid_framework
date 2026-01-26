import { EventKeyboard, EventTouch, input, Input, KeyCode, Node, Vec2, v2, sys } from 'cc';
import { IInputService, PointerDown } from '../interfaces/IInputService';

/**
 * Unified pointer input for touch/mouse.
 * Usage: bind(canvasOrRootNode)
 */
export class CocosInputService implements IInputService {
  private _enabled = true;
  private _boundNodes = new Set<Node>();

  private _down: ((e: PointerDown) => void)[] = [];
  private _move: ((e: PointerDown) => void)[] = [];
  private _up: ((e: PointerDown) => void)[] = [];

  private _back: (() => void)[] = [];

  // Web-only: consume ESC at DOM level (best-effort) to avoid browser default actions.
  private _webConsumeEscapeKey = false;
  private _domKeyDownHandler: ((e: any) => void) | null = null;

  init(): void {
    // global input listeners
    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
  }

  dispose(): void {
    input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    input.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    this._boundNodes.clear();
    this._down.length = this._move.length = this._up.length = 0;
    this._back.length = 0;
  }

  bind(node: Node): void {
    this._boundNodes.add(node);
  }

  unbind(node: Node): void {
    this._boundNodes.delete(node);
  }

  onPointerDown(cb: (e: PointerDown) => void): void {
    this._down.push(cb);
  }

  onPointerMove(cb: (e: PointerDown) => void): void {
    this._move.push(cb);
  }

  onPointerUp(cb: (e: PointerDown) => void): void {
    this._up.push(cb);
  }

  onBack(cb: () => void): () => void {
    this._back.push(cb);
    return () => {
      const idx = this._back.indexOf(cb);
      if (idx >= 0) this._back.splice(idx, 1);
    };
  }

  setBackKeyOptions(opts: { webConsumeEscapeKey?: boolean }): void {
    const next = !!opts?.webConsumeEscapeKey;
    if (this._webConsumeEscapeKey === next) return;
    this._webConsumeEscapeKey = next;
    this._syncDomBackKeyListener();
  }

  setEnabled(enabled: boolean): void {
    this._enabled = enabled;
  }

  private _syncDomBackKeyListener(): void {
    if (!sys.isBrowser) return;

    const doc = (globalThis as any).document as any;
    if (!doc || !doc.addEventListener) return;

    if (!this._webConsumeEscapeKey) {
      this._detachDomBackKeyListener();
      return;
    }

    if (this._domKeyDownHandler) return;

    this._domKeyDownHandler = (ev: any) => {
      if (!this._enabled) return;
      if (ev.key !== 'Escape') return;

      // Do not hijack typing in inputs.
      const target = ev.target as any;
      const tag = (target?.tagName ?? '').toString().toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;

      if (this._back.length <= 0) return;

      // Best-effort: prevent browser default behavior.
      // Note: browsers may still exit fullscreen on ESC for security reasons.
      ev.preventDefault?.();
      ev.stopPropagation?.();
      (ev as any).stopImmediatePropagation?.();

      // Call last registered first (stack behavior).
      for (let i = this._back.length - 1; i >= 0; i -= 1) {
        try {
          this._back[i]?.();
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn(err);
        }
      }
    };

    doc.addEventListener('keydown', this._domKeyDownHandler, true);
  }

  private _detachDomBackKeyListener(): void {
    if (!sys.isBrowser) return;

    const doc = (globalThis as any).document as any;
    if (!doc || !doc.removeEventListener) return;
    if (!this._domKeyDownHandler) return;

    doc.removeEventListener('keydown', this._domKeyDownHandler, true);
    this._domKeyDownHandler = null;
  }

  private onKeyDown(e: EventKeyboard): void {
    if (!this._enabled) return;

    const kc = (e as any).keyCode as number;
    const backKey = (KeyCode as any).BACK ?? (KeyCode as any).MOBILE_BACK ?? (KeyCode as any).ANDROID_BACK;

    const isEscape = kc === KeyCode.ESCAPE;
    const isBack = isEscape || (backKey != null && kc === backKey);
    if (!isBack) return;

    // Web: if DOM-level ESC consumption is enabled, handle ESC there to prevent browser defaults.
    if (sys.isBrowser && this._webConsumeEscapeKey && isEscape) return;

    // Call last registered first (stack behavior).
    for (let i = this._back.length - 1; i >= 0; i -= 1) {
      try {
        this._back[i]?.();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(err);
      }
    }
  }

  private onTouchStart(e: EventTouch): void {
    if (!this._enabled) return;
    const p = e.getLocation();
    const payload: PointerDown = { id: e.getID(), screenPos: v2(p.x, p.y) };
    for (const cb of this._down) cb(payload);
  }

  private onTouchMove(e: EventTouch): void {
    if (!this._enabled) return;
    const p = e.getLocation();
    const payload: PointerDown = { id: e.getID(), screenPos: v2(p.x, p.y) };
    for (const cb of this._move) cb(payload);
  }

  private onTouchEnd(e: EventTouch): void {
    if (!this._enabled) return;
    const p = e.getLocation();
    const payload: PointerDown = { id: e.getID(), screenPos: v2(p.x, p.y) };
    for (const cb of this._up) cb(payload);
  }
}
