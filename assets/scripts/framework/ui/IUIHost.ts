import { Node, Prefab } from 'cc';
import { UIView } from './UIView';

/**
 * Interface for UI host operations needed by routers/managers.
 * Breaks circular dependency between UIRoot and its child managers.
 */
export interface IUIHost {
  readonly screensLayer: Node | null;
  readonly popupsLayer: Node | null;
  readonly overlayLayer: Node | null;
  readonly stagingLayer: Node | null;
  readonly toastLayer: Node | null;

  _loadPrefab(path: string): Promise<Prefab>;
  _createView<T extends UIView>(prefab: Prefab, parent: Node, params?: any): T;
  _createViewPrepared?<T extends UIView>(prefab: Prefab, parent: Node, params?: any): Promise<T>;
}
