import { Node } from 'cc';
import { ServiceLocator } from '../../core/ServiceLocator';
import { Services } from '../../services/ServiceTokens';
import type { ILoadingOverlayService } from '../../services/interfaces/ILoadingOverlayService';
import { UIWarmup } from '../utils/UIWarmup';
import { IUIHost } from '../IUIHost';
import { UIPopup } from '../UIPopup';
import { UIScreen } from '../UIScreen';
import { UIView } from '../UIView';

type StackItem<T extends UIView> = { path: string; view: T };

/**
 * High-level UI router:
 * - Screen stack: push/pop (full-screen pages)
 * - Popup stack: push/pop (modal overlays)
 *
 * Prefabs are loaded by path via UIRoot._loadPrefab().
 */
export class UIScreenRouter {
  private _screens: StackItem<UIScreen>[] = [];
  private _popups: StackItem<UIPopup>[] = [];
  private _keepAlive = new Map<string, UIScreen>();
  private _busy = false;

  constructor(private _root: IUIHost) { }

  async pushScreen(path: string, params?: any): Promise<UIScreen> {
    if (this._busy) throw new Error('[UIScreenRouter] Busy');
    this._busy = true;

    try {
      const next = await this._withWarmupOverlay(async () => {
        return this._getOrCreateScreen(path, params);
      });

      const cur = this._topScreen();
      if (cur) await cur.hide();

      this._screens.push({ path, view: next });
      await next.show();
      return next;
    } finally {
      this._busy = false;
    }
  }

  async popScreen(): Promise<void> {
    if (this._busy) return;
    if (this._screens.length <= 1) return;

    this._busy = true;
    try {
      const top = this._screens.pop();
      if (!top) return;

      await top.view.hide();
      await this._disposeOrCache(top);

      const cur = this._topScreen();
      if (cur) await cur.show();
    } finally {
      this._busy = false;
    }
  }

  async replaceScreen(path: string, params?: any): Promise<UIScreen> {
    if (this._busy) throw new Error('[UIScreenRouter] Busy');
    this._busy = true;

    try {
      const next = await this._withWarmupOverlay(async () => {
        return this._getOrCreateScreen(path, params);
      });

      const top = this._screens.pop();
      if (top) {
        await top.view.hide();
        await this._disposeOrCache(top);
      }

      this._screens.push({ path, view: next });
      await next.show();
      return next;
    } finally {
      this._busy = false;
    }
  }

  async pushPopup(path: string, params?: any): Promise<UIPopup> {
    if (this._busy) throw new Error('[UIScreenRouter] Busy');
    this._busy = true;

    try {
      const prefab = await this._root._loadPrefab(path);
      const layer = this._requireLayer(this._root.popupsLayer, 'popupsLayer');
      const pop = await this._withWarmupOverlay(async () => {
        return this._root._createViewPrepared
          ? await this._root._createViewPrepared<UIPopup>(prefab, layer, params)
          : this._root._createView<UIPopup>(prefab, layer, params);
      });

      this._popups.push({ path, view: pop });
      await pop.show();
      return pop;
    } finally {
      this._busy = false;
    }
  }

  async popPopup(): Promise<void> {
    if (this._busy) return;

    const top = this._popups.pop();
    if (!top) return;

    this._busy = true;
    try {
      await top.view.hide();
      top.view.node.destroy();
    } finally {
      this._busy = false;
    }
  }

  async closeAllPopups(): Promise<void> {
    while (this._popups.length > 0) {
      await this.popPopup();
    }
  }

  /**
   * Back handler for platforms with a back action (Android back, ESC, browser back, etc).
   * Priority:
   * 1) Close top popup if any.
   * 2) Call current screen.onBackPressed() if it returns true.
   * 3) Fallback: pop screen if there is a previous screen.
   */
  async handleBack(): Promise<boolean> {
    if (this._busy) return false;

    if (this._popups.length > 0) {
      await this.popPopup();
      return true;
    }

    const top = this._topScreen();
    if (!top) return false;

    try {
      const handled = await top.onBackPressed();
      if (handled) return true;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e);
    }

    if (this._screens.length > 1) {
      await this.popScreen();
      return true;
    }

    return false;
  }

  dispose(): void {
    // Best-effort cleanup without animations.
    for (const s of this._screens) {
      if (s.view.node?.isValid) s.view.node.destroy();
    }
    for (const p of this._popups) {
      if (p.view.node?.isValid) p.view.node.destroy();
    }
    for (const [, v] of this._keepAlive) {
      if (v.node?.isValid) v.node.destroy();
    }
    this._keepAlive.clear();
    this._screens.length = 0;
    this._popups.length = 0;
  }

  private async _getOrCreateScreen(path: string, params?: any): Promise<UIScreen> {
    const cached = this._keepAlive.get(path);
    if (cached?.node?.isValid) {
      this._keepAlive.delete(path);

      cached.onReuse?.(params);

      const layer = this._requireLayer(this._root.screensLayer, 'screensLayer');
      const staging = this._root.stagingLayer || this._root.overlayLayer || layer;
      const hidden = UIWarmup.ensureHiddenOpacity(cached.node);

      cached.node.active = true;
      cached.node.setParent(staging);

      cached.notifyWarmupStart?.();
      await cached.onPreload?.(params);
      await cached.onBeforeShow?.(params);
      await UIWarmup.warmup(cached.node, { frames: 2, refreshLayoutTree: true, keepActive: true });
      cached.notifyWarmupDone?.();

      cached.node.setParent(layer);
      cached.node.active = false;
      hidden.restore();

      return cached;
    }

    // Create new instance
    const prefab = await this._root._loadPrefab(path);
    const layer = this._requireLayer(this._root.screensLayer, 'screensLayer');
    return this._root._createViewPrepared
      ? await this._root._createViewPrepared<UIScreen>(prefab, layer, params)
      : this._root._createView<UIScreen>(prefab, layer, params);

  }

  private async _disposeOrCache(item: StackItem<UIScreen>): Promise<void> {
    const view = item.view;
    if (view.keepAlive && view.node && view.node.isValid) {
      const prev = this._keepAlive.get(item.path);
      if (prev && prev !== view && prev.node?.isValid) prev.node.destroy();
      this._keepAlive.set(item.path, view);

      // Park it under staging/overlay so it's not in active hierarchy.
      const parking = this._root.stagingLayer || this._root.overlayLayer || this._requireLayer(this._root.screensLayer, 'screensLayer');
      view.node.setParent(parking);
      view.node.active = false;
      return;
    }

    if (view.node && view.node.isValid) view.node.destroy();
  }

  private async _withWarmupOverlay<T>(work: () => Promise<T>): Promise<T> {
    const loading = ServiceLocator.tryResolve<ILoadingOverlayService>(Services.LoadingOverlay);
    if (!loading) return work();

    const delayMs = 120; // show overlay only if warmup takes noticeable time
    const minDurationMs = 220; // avoid flash
    let handle: { dispose: () => void } | null = null;
    let done = false;

    // Show after a short delay.
    void (async () => {
      await UIWarmup.delayMs(delayMs);
      if (done) return;
      handle = loading.show({ minDurationMs });
    })();

    try {
      return await work();
    } finally {
      done = true;
      handle?.dispose();
    }
  }

  private _topScreen(): UIScreen | null {
    if (this._screens.length === 0) return null;
    return this._screens[this._screens.length - 1].view;
  }

  private _requireLayer(layer: Node | null, name: string): Node {
    if (!layer) throw new Error(`[UIScreenRouter] Missing UIRoot.${name}`);
    return layer;
  }
}
