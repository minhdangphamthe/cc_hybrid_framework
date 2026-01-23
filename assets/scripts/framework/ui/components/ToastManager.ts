import { Node, Prefab } from 'cc';
import { IUIHost } from '../IUIHost';
import { ToastView } from './ToastView';

const TOAST_PREFAB_PATH = 'ui/components/ToastView';

/**
 * Toast queue that renders into UIRoot.toastLayer.
 *
 * Important: Toasts should NOT use the popup stack, otherwise they can interfere with
 * real modals (closeTopPopup would close the wrong view).
 */
export class ToastManager {
  private _queue: Array<{ text: string; duration: number }> = [];
  private _showing = false;
  private _prefab: Prefab | null = null;

  constructor(private _root: IUIHost) {}

  dispose(): void {
    this._queue.length = 0;
    this._showing = false;
    this._prefab = null;
  }

  show(text: string, duration = 1.5): void {
    this._queue.push({ text, duration });
    if (!this._showing) void this._drain();
  }

  private async _drain(): Promise<void> {
    this._showing = true;
    try {
      while (this._queue.length > 0) {
        const item = this._queue.shift()!;
        const view = await this._spawnToastView(item.text, item.duration);
        await view.play(item.text, item.duration);
        view.node.destroy();
      }
    } finally {
      this._showing = false;
    }
  }

  private async _spawnToastView(text: string, duration: number): Promise<ToastView> {
    const layer = this._requireLayer(this._root.toastLayer, 'toastLayer');

    if (!this._prefab) {
      this._prefab = await this._root._loadPrefab(TOAST_PREFAB_PATH);
    }

    const view = this._root._createView<ToastView>(this._prefab, layer, { text, duration });
    view.node.active = true;
    return view;
  }

  private _requireLayer(layer: Node | null, name: string): Node {
    if (!layer) throw new Error(`[ToastManager] Missing UIRoot.${name}`);
    return layer;
  }
}
