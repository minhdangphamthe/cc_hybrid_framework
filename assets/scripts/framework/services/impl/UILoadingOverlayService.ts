import { BlockInputEvents, Color, Label, Node, Prefab, UIOpacity, UITransform, Widget, instantiate, isValid } from 'cc';
import { IDisposable } from '../../core/Lifetime';
import { ILoadingOverlayService, LoadingOverlayOptions } from '../interfaces/ILoadingOverlayService';

type LoadingOverlayViewApi = {
  show?: (message?: string) => void;
  hide?: () => void;
};

export class UILoadingOverlayService implements ILoadingOverlayService {
  private _layer: Node;

  // Custom overlay source (optional)
  private _customPrefab: Prefab | null = null;
  private _customComponentName = '';

  // Active instance (default or custom)
  private _root: Node | null = null;
  private _rootOwnedByService = false;

  // Custom overlay view api (duck-typed)
  private _customView: LoadingOverlayViewApi | null = null;

  private _count = 0;
  private _visibleSinceMs = 0;
  private _minDurationMs = 0;
  private _hideTimer: any = null;

  constructor(layer: Node) {
    this._layer = layer;
  }

  setCustomPrefab(prefab: Prefab, componentName = ''): void {
    this._customPrefab = prefab;
    this._customComponentName = componentName;
    this._resetInstance();
  }

  show(opts: LoadingOverlayOptions = {}): IDisposable {
    this._count += 1;
    this._minDurationMs = Math.max(this._minDurationMs, opts.minDurationMs ?? 0);

    this._ensureNode();

    if (this._count === 1) {
      this._visibleSinceMs = Date.now();
      this._setActive(true);
    }

    let disposed = false;
    return {
      dispose: () => {
        if (disposed) return;
        disposed = true;
        this._hideOne();
      },
    };
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

  private _ensureNode(): void {
    if (this._root && isValid(this._root, true)) {
      return;
    }

    if (!isValid(this._layer, true)) return;

    if (!this._customPrefab) {
      console.warn('UILoadingOverlayService: Custom prefab is set but no instance exists; Please provide a valid prefab.');
      return;
    }
    if (!isValid(this._layer, true) || !this._customPrefab) return;

    const root = instantiate(this._customPrefab);
    root.layer = this._layer.layer;
    root.setParent(this._layer);
    root.active = false;

    this._rootOwnedByService = true;

    this._root = root;
    this._customView = this._findCustomViewApi(root);
  }

  private _findCustomViewApi(root: Node): LoadingOverlayViewApi | null {
    const name = (this._customComponentName || '').trim();
    if (!name) return null;
    if (!isValid(root, true)) return null;

    // Prefer component on root, then search children.
    const comp: any = (root.getComponent(name as any) || root.getComponentInChildren(name as any)) as any;
    if (!comp) return null;

    const api: LoadingOverlayViewApi = {};
    if (typeof comp.show === 'function') api.show = comp.show.bind(comp);
    if (typeof comp.hide === 'function') api.hide = comp.hide.bind(comp);

    // If it does not provide any known method, treat as missing.
    if (!api.show && !api.hide) return null;
    return api;
  }

  private _setActive(active: boolean): void {
    if (!this._root || !isValid(this._root, true)) return;

    this._root.active = active;

    // If a custom overlay provides show/hide, call it too.
    if (this._customView) {
      if (active) this._customView.show?.();
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
