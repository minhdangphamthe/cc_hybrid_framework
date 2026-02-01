import { BlockInputEvents, Color, Label, Node, Prefab, UIOpacity, UITransform, Widget, instantiate, isValid } from 'cc';
import { IDisposable } from '../../core/Lifetime';
import { ILoadingOverlayService, LoadingOverlayOptions } from '../interfaces/ILoadingOverlayService';

type LoadingOverlayViewApi = {
  show?: (message?: string) => void;
  hide?: () => void;
  setMessage?: (message: string) => void;
  setProgress?: (value01: number) => void;
};

/**
 * Loading overlay service (ref-counted).
 *
 * Supports:
 * - Default runtime overlay (no prefab needed).
 * - Custom overlay injection (prefab or node), so games can provide their own visuals.
 *
 * Notes:
 * - The custom overlay component is discovered by `componentName` (string).
 * - If component is missing, the service will fall back to a `Label` child search for `setMessage`.
 * - Input blocking for custom overlays is not forced (preferred: handle it in your prefab).
 */
export class UILoadingOverlayService implements ILoadingOverlayService {
  private _layer: Node;

  // Custom overlay source (optional)
  private _customPrefab: Prefab | null = null;
  private _customComponentName = '';

  // Active instance (default or custom)
  private _root: Node | null = null;
  private _rootOwnedByService = false;

  // Default overlay parts (runtime-built)
  private _opacity: UIOpacity | null = null;
  private _label: Label | null = null;
  private _blocker: BlockInputEvents | null = null;

  // Custom overlay view api (duck-typed)
  private _customView: LoadingOverlayViewApi | null = null;

  private _count = 0;
  private _visibleSinceMs = 0;
  private _minDurationMs = 0;
  private _hideTimer: any = null;

  constructor(layer: Node) {
    this._layer = layer;
  }

  /**
   * Provide a custom overlay prefab.
   * The prefab root (or one of its children) should include a component with `componentName`,
   * implementing optional methods: show/hide/setMessage/setProgress.
   */
  setCustomPrefab(prefab: Prefab, componentName = ''): void {
    this._customPrefab = prefab;
    this._customComponentName = componentName;
    this._resetInstance();
  }

  clearCustomOverlay(): void {
    this._customPrefab = null;
    this._customComponentName = '';
    this._resetInstance();
  }

  show(opts: LoadingOverlayOptions = {}): IDisposable {
    this._count += 1;
    this._minDurationMs = Math.max(this._minDurationMs, opts.minDurationMs ?? 0);

    this._ensureNode(opts);

    if (this._count === 1) {
      this._visibleSinceMs = Date.now();
      this._setActive(true, opts);
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
    // Custom overlay first.
    if (this._customView?.setMessage) {
      this._customView.setMessage(message);
      return;
    }

    // Try default overlay label.
    if (this._label && isValid(this._label.node, true)) {
      this._label.string = message;
      return;
    }

    // Best-effort fallback: find any Label on root.
    if (this._root && isValid(this._root, true)) {
      const label = this._root.getComponentInChildren(Label);
      if (label) label.string = message;
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
      // Update blocker on demand for default overlay only.
      if (this._blocker) this._blocker.enabled = opts.blockInput ?? true;
      return;
    }

    if (!isValid(this._layer, true)) return;

    // Custom overlay path
    if (this._customPrefab) {
      this._createCustomOverlay();
      return;
    }

    // Default runtime overlay path
    this._createDefaultOverlay(opts);
  }

  private _createCustomOverlay(): void {
    if (!isValid(this._layer, true)) return;
    
    const root = instantiate(this._customPrefab!);
    root.layer = this._layer.layer;
    root.setParent(this._layer);
    root.active = false;

    this._rootOwnedByService = !root;

    // Discover optional component API by name.
    const view = this._customComponentName ? (root.getComponent(this._customComponentName) as unknown as any) : null;
    this._customView = (view ?? null) as LoadingOverlayViewApi | null;

    this._root = root;
    this._opacity = null;
    this._label = null;
    this._blocker = null;
  }

  private _createDefaultOverlay(opts: LoadingOverlayOptions): void {
    const root = new Node('LoadingOverlay');
    root.layer = this._layer.layer;
    root.active = false;
    root.setParent(this._layer);
    this._rootOwnedByService = true;

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

    this._customView = null;
    this._root = root;
  }

  private _setActive(active: boolean, opts?: LoadingOverlayOptions): void {
    if (!this._root || !isValid(this._root, true)) return;

    this._root.active = active;

    // If a custom overlay provides show/hide, call it too.
    if (this._customView) {
      if (active) this._customView.show?.(opts?.message);
      else this._customView.hide?.();
    }
  }

  private _resetInstance(): void {
    if (this._root && isValid(this._root, true)) {
      if (this._rootOwnedByService) {
        this._root.destroy();
      } else {
        // Scene-provided node: just detach and hide.
        this._root.active = false;
        this._root.removeFromParent();
      }
    }

    this._root = null;
    this._rootOwnedByService = false;
    this._opacity = null;
    this._label = null;
    this._blocker = null;
    this._customView = null;
    this._count = 0;
    this._minDurationMs = 0;
    this._visibleSinceMs = 0;
    this._clearHideTimer();
  }

  private _clearHideTimer(): void {
    if (this._hideTimer != null) {
      clearTimeout(this._hideTimer);
      this._hideTimer = null;
    }
  }
}
