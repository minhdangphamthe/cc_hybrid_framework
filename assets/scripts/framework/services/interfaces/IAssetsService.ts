import { Asset, AssetManager, Prefab, SpriteFrame, Texture2D } from 'cc';
import { IService } from './IService';

export interface LoadOptions {
  bundle?: string; // default resources
  cache?: boolean; // default true
}

/** Type alias for constructor function (similar to cc's internal __private._types_globals__Constructor) */
export type AssetConstructor<T> = new (...args: any[]) => T;

/** Asset abstraction (bundle/resources). */
export interface IAssetsService extends IService {
  preloadBundle(name: string): Promise<AssetManager.Bundle>;
  loadBundle(name: string): Promise<AssetManager.Bundle>;
  load<T extends Asset>(path: string, type: AssetConstructor<T>, opts?: LoadOptions): Promise<T>;
  loadPrefab(path: string, opts?: LoadOptions): Promise<Prefab>;
  loadSpriteFrame(path: string, opts?: LoadOptions): Promise<SpriteFrame>;
  loadTexture(path: string, opts?: LoadOptions): Promise<Texture2D>;
  release(asset: Asset): void;
  releasePath(path: string, opts?: LoadOptions): void;
}
