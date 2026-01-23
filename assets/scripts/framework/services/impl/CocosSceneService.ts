import { director } from 'cc';
import { ISceneService, LoadSceneOptions, SceneProgress } from '../interfaces/ISceneService';

export class CocosSceneService implements ISceneService {
  async preloadScene(name: string, onProgress?: (p: SceneProgress) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      director.preloadScene(
        name,
        (completedCount: number, totalCount: number, item?: any) => {
          onProgress?.({ finished: completedCount, total: totalCount, item: String(item ?? '') });
        },
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async loadScene(name: string, opts?: LoadSceneOptions): Promise<void> {
    const preload = opts?.preload ?? true;
    if (preload) {
      await this.preloadScene(name, opts?.onProgress);
    }

    return new Promise((resolve, reject) => {
      director.loadScene(name, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
