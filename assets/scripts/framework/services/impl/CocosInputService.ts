import { EventTouch, input, Input, Node, Vec2, v2 } from 'cc';
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

  init(): void {
    // global input listeners
    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  dispose(): void {
    input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    input.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    this._boundNodes.clear();
    this._down.length = this._move.length = this._up.length = 0;
  }

  bind(node: Node): void {
    this._boundNodes.add(node);
  }

  unbind(node: Node): void {
    this._boundNodes.delete(node);
  }

  onPointerDown(cb: (e: PointerDown) => void): void { this._down.push(cb); }
  onPointerMove(cb: (e: PointerDown) => void): void { this._move.push(cb); }
  onPointerUp(cb: (e: PointerDown) => void): void { this._up.push(cb); }

  setEnabled(enabled: boolean): void { this._enabled = enabled; }

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
