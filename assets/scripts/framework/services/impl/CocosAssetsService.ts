import { assetManager, Asset, AssetManager, Prefab, resources, SpriteFrame, Texture2D } from 'cc';
import { AssetConstructor, IAssetsService, LoadOptions } from '../interfaces/IAssetsService';

/**
 * Minimal assets service.
 * - bundle defaults to 'resources'
 * - caching handled by engine; releasePath uses bundle.release() if available.
 */
export class CocosAssetsService implements IAssetsService {
  async preloadBundle(name: string): Promise<AssetManager.Bundle> {
    return this.loadBundle(name);
  }

  async loadBundle(name: string): Promise<AssetManager.Bundle> {
    return new Promise((resolve, reject) => {
      assetManager.loadBundle(name, (err, bundle) => {
        if (err || !bundle) reject(err ?? new Error('bundle null'));
        else resolve(bundle);
      });
    });
  }

  async load<T extends Asset>(path: string, type: AssetConstructor<T>, opts?: LoadOptions): Promise<T> {
    const bundle = opts?.bundle ? await this.loadBundle(opts.bundle) : null;
    return new Promise((resolve, reject) => {
      const loader = bundle ?? resources;
      loader.load(path, type, (err: any, asset: any) => {
        if (err || !asset) reject(err ?? new Error('asset null'));
        else resolve(asset as T);
      });
    });
  }

  loadPrefab(path: string, opts?: LoadOptions): Promise<Prefab> {
    return this.load(path, Prefab, opts);
  }
  loadSpriteFrame(path: string, opts?: LoadOptions): Promise<SpriteFrame> {
    return this.load(path, SpriteFrame, opts);
  }
  loadTexture(path: string, opts?: LoadOptions): Promise<Texture2D> {
    return this.load(path, Texture2D, opts);
  }

  release(asset: Asset): void {
    assetManager.releaseAsset(asset);
  }

  releasePath(path: string, opts?: LoadOptions): void {
    if (opts?.bundle) {
      const b = assetManager.getBundle(opts.bundle);
      b?.release(path);
    } else {
      resources.release(path);
    }
  }
}
