import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { ServiceLocator } from '../core/ServiceLocator';
import { Services } from '../services/ServiceTokens';
import { IAssetsService } from '../services/interfaces/IAssetsService';
import { IUIService } from '../services/interfaces/IUIService';
import { UIScreen, UIPopup, UIView } from './UIView';
import { UIScreenRouter } from './router/UIScreenRouter';
import { ToastManager } from './components/ToastManager';

const { ccclass, property } = _decorator;

@ccclass('UIRoot')
export class UIRoot extends Component implements IUIService {
  @property(Node)
  screensLayer: Node | null = null;

  @property(Node)
  popupsLayer: Node | null = null;

  @property(Node)
  overlayLayer: Node | null = null;

  @property(Node)
  toastLayer: Node | null = null;

  router!: UIScreenRouter;
  toast!: ToastManager;

  onLoad(): void {
    if (!this.screensLayer) this.screensLayer = this.node;
    if (!this.popupsLayer) this.popupsLayer = this.node;
    if (!this.overlayLayer) this.overlayLayer = this.node;
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

  /** Internal: instantiates a prefab under parent and returns its UIView component. */
  _instantiate<T extends UIView>(prefab: Prefab, parent: Node, params?: any): T {
    const node = instantiate(prefab);
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
