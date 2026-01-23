import { __private, Asset, AssetManager, Prefab, SpriteFrame, Texture2D } from 'cc';
import { IService } from './IService';

export interface LoadOptions {
  bundle?: string; // default resources
  cache?: boolean; // default true
}

/** Asset abstraction (bundle/resources). */
export interface IAssetsService extends IService {
  preloadBundle(name: string): Promise<AssetManager.Bundle>;
  loadBundle(name: string): Promise<AssetManager.Bundle>;
  load<T extends Asset>(path: string, type: __private.__types_globals__Constructor<T>, opts?: LoadOptions): Promise<T>;
  loadPrefab(path: string, opts?: LoadOptions): Promise<Prefab>;
  loadSpriteFrame(path: string, opts?: LoadOptions): Promise<SpriteFrame>;
  loadTexture(path: string, opts?: LoadOptions): Promise<Texture2D>;
  release(asset: Asset): void;
  releasePath(path: string, opts?: LoadOptions): void;
}
