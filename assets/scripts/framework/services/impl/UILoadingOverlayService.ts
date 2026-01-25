import { BlockInputEvents, Color, Label, Node, UIOpacity, UITransform, Widget, isValid } from 'cc';
import { IDisposable } from '../../core/Lifetime';
import { ILoadingOverlayService, LoadingOverlayOptions } from '../interfaces/ILoadingOverlayService';

/**
 * A tiny loading overlay built at runtime (no prefab needed).
 * - Ref-counted: multiple callers can show/hide safely.
 * - Null-safe: does not crash if layer is destroyed.
 */
export class UILoadingOverlayService implements ILoadingOverlayService {
  private _layer: Node;
  private _root: Node | null = null;
  private _opacity: UIOpacity | null = null;
  private _label: Label | null = null;
  private _blocker: BlockInputEvents | null = null;

  private _count = 0;
  private _visibleSinceMs = 0;
  private _minDurationMs = 0;
  private _hideTimer: any = null;

  constructor(layer: Node) {
    this._layer = layer;
  }

  show(opts: LoadingOverlayOptions = {}): IDisposable {
    this._count += 1;
    this._minDurationMs = Math.max(this._minDurationMs, opts.minDurationMs ?? 0);

    this._ensureNode(opts);

    if (this._count === 1) {
      this._visibleSinceMs = Date.now();
      this._setActive(true);
    }

    if (opts.message) this.setMessage(opts.message);

    let disposed = false;
    return {
      dispose: () => {
        if (disposed) return;
        disposed = true;
        this._hideOne();
      },
    };
  }

  setMessage(message: string): void {
    if (this._label && isValid(this._label.node, true)) {
      this._label.string = message;
    }
  }

  hideAll(): void {
    this._count = 0;
    this._minDurationMs = 0;
    this._clearHideTimer();
    this._setActive(false);
  }

  isVisible(): boolean {
    return !!(this._root && isValid(this._root, true) && this._root.active);
  }

  private _hideOne(): void {
    this._count = Math.max(0, this._count - 1);
    if (this._count > 0) return;

    const elapsed = Date.now() - this._visibleSinceMs;
    const remain = Math.max(0, this._minDurationMs - elapsed);

    if (remain > 0) {
      this._clearHideTimer();
      this._hideTimer = setTimeout(() => {
        this._hideTimer = null;
        // Only hide if nobody showed again.
        if (this._count === 0) {
          this._minDurationMs = 0;
          this._setActive(false);
        }
      }, remain);
      return;
    }

    this._minDurationMs = 0;
    this._setActive(false);
  }

  private _ensureNode(opts: LoadingOverlayOptions): void {
    if (this._root && isValid(this._root, true)) {
      // Update blocker on demand.
      if (this._blocker) this._blocker.enabled = opts.blockInput ?? true;
      return;
    }

    if (!isValid(this._layer, true)) return;

    const root = new Node('LoadingOverlay');
    root.layer = this._layer.layer;
    root.active = false;
    root.setParent(this._layer);

    // Fullscreen stretch.
    const t = root.addComponent(UITransform);
    t.setContentSize(99999, 99999);
    root.addComponent(Widget).alignFlags = 45;

    // Dim background (opacity only; keep it cheap).
    const op = root.addComponent(UIOpacity);
    op.opacity = 190;
    this._opacity = op;

    const blocker = root.addComponent(BlockInputEvents);
    blocker.enabled = opts.blockInput ?? true;
    this._blocker = blocker;

    // Center label.
    const labelNode = new Node('Label');
    labelNode.layer = root.layer;
    labelNode.setParent(root);
    const lt = labelNode.addComponent(UITransform);
    lt.setContentSize(600, 80);
    const w = labelNode.addComponent(Widget);
    w.alignFlags = 12; // center
    w.horizontalCenter = 0;
    w.verticalCenter = 0;

    const label = labelNode.addComponent(Label);
    label.string = 'Loading...';
    label.fontSize = 32;
    label.color = new Color(255, 255, 255, 255);
    label.horizontalAlign = 1;
    label.verticalAlign = 1;
    this._label = label;

    this._root = root;
  }

  private _setActive(active: boolean): void {
    if (!this._root || !isValid(this._root, true)) return;
    this._root.active = active;
  }

  private _clearHideTimer(): void {
    if (this._hideTimer != null) {
      clearTimeout(this._hideTimer);
      this._hideTimer = null;
    }
  }
}
