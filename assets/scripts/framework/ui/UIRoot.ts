import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { UIWarmup } from './utils/UIWarmup';
import { ServiceLocator } from '../core/ServiceLocator';
import { Services } from '../services/ServiceTokens';
import { IAssetsService } from '../services/interfaces/IAssetsService';
import { IUIService } from '../services/interfaces/IUIService';
import { IUIHost } from './IUIHost';
import { UIPopup } from './UIPopup';
import { UIScreen } from './UIScreen';
import { UIView } from './UIView';
import { UIScreenRouter } from './router/UIScreenRouter';
import { ToastManager } from './components/ToastManager';

const { ccclass, property } = _decorator;

@ccclass('UIRoot')
export class UIRoot extends Component implements IUIService, IUIHost {
  @property(Node)
  screensLayer: Node | null = null;

  @property(Node)
  popupsLayer: Node | null = null;

  @property(Node)
  overlayLayer: Node | null = null;

  @property(Node)
  stagingLayer: Node | null = null;

  @property(Node)
  toastLayer: Node | null = null;

  router!: UIScreenRouter;
  toast!: ToastManager;

  onLoad(): void {
    if (!this.screensLayer) this.screensLayer = this.node;
    if (!this.popupsLayer) this.popupsLayer = this.node;
    if (!this.overlayLayer) this.overlayLayer = this.node;
    if (!this.stagingLayer) this.stagingLayer = this.overlayLayer;
    if (!this.toastLayer) this.toastLayer = this.node;

    this.router = new UIScreenRouter(this);
    this.toast = new ToastManager(this);

    ServiceLocator.register(Services.UI, this as unknown as IUIService);
  }

  onDestroy(): void {
    this.router?.dispose?.();
    this.toast?.dispose?.();

    const cur = ServiceLocator.tryResolve<IUIService>(Services.UI);
    if (cur === (this as unknown as IUIService)) {
      ServiceLocator.unregister(Services.UI);
    }
  }

  async openScreen(path: string, params?: any): Promise<UIScreen> {
    return this.router.pushScreen(path, params);
  }

  async replaceScreen(path: string, params?: any): Promise<UIScreen> {
    return this.router.replaceScreen(path, params);
  }

  async closeTopScreen(): Promise<void> {
    await this.router.popScreen();
  }

  async openPopup(path: string, params?: any): Promise<UIPopup> {
    return this.router.pushPopup(path, params);
  }

  async closeTopPopup(): Promise<void> {
    await this.router.popPopup();
  }

  async closeAllPopups(): Promise<void> {
    await this.router.closeAllPopups();
  }

  showToast(text: string, durationSec = 1.5): void {
    this.toast.show(text, durationSec);
  }

  /** Internal: loads a prefab using IAssetsService. */
  async _loadPrefab(path: string): Promise<Prefab> {
    const assets = ServiceLocator.resolve<IAssetsService>(Services.Assets);
    return assets.loadPrefab(path);
  }

  /**
   * Internal: instantiates a prefab and runs an optional warmup pipeline for heavy UIs.
   *
   * Why:
   * - Complex screens (nested lists, widgets, layouts) can cause micro-glitches if they are shown immediately.
   * - Warmup lets you build child items and refresh Layout/Widget before the first visible frame.
   *
   * Lifecycle order:
   * 1) onCreate(params)
   * 2) onPreload(params)            (optional async)
   * 3) onBeforeShow(params)         (optional async)  <-- build lists here (prefer chunked)
   * 4) warmup layout + yield frames
   * 5) router will call view.show() later
   */
  async _createViewPrepared<T extends UIView>(prefab: Prefab, parent: Node, params?: any): Promise<T> {
    const staging = this.stagingLayer ?? parent;

    const node = instantiate(prefab);
    node.active = true;
    node.setParent(staging);

    // Hide before any frame can render.
    const hidden = UIWarmup.ensureHiddenOpacity(node);

    const view = node.getComponent(UIView) as unknown as T;
    if (!view) throw new Error(`[UIRoot] Prefab must have a UIView component: ${prefab.name}`);

    try {
      view.onCreate?.(params);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e);
    }

    try {
      await view.onPreload?.(params);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e);
    }

    try {
      await view.onBeforeShow?.(params);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e);
    }

    // Warm up layout tree (Widgets/Layout) to avoid first-frame jumps.
    await UIWarmup.warmup(node, { frames: 2, refreshLayoutTree: true, keepActive: true });

    // Move into final parent, keep hidden until router calls show().
    node.setParent(parent);
    node.active = false;
    hidden.restore();

    return view;
  }

  /** Internal: instantiates a prefab under parent and returns its UIView component. */
  _createView<T extends UIView>(prefab: Prefab, parent: Node, params?: any): T {
    const node = instantiate(prefab);
    // Prevent one-frame "flash" before transitions can prepare initial state.
    // Router/Toast will activate via UIView.show().
    node.active = false;
    node.setParent(parent);

    const view = node.getComponent(UIView) as unknown as T;
    if (!view) throw new Error(`[UIRoot] Prefab must have a UIView component: ${prefab.name}`);

    try {
      view.onCreate?.(params);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e);
    }

    return view;
  }
}
