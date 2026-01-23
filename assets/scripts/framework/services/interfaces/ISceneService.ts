import { IService } from './IService';

export interface SceneProgress {
  finished: number;
  total: number;
  item?: string;
}

export interface LoadSceneOptions {
  /** If true, preload first for smoother transition. Default true. */
  preload?: boolean;
  onProgress?: (p: SceneProgress) => void;
}

/** Scene loading abstraction to support single-scene or multi-scene projects. */
export interface ISceneService extends IService {
  preloadScene(name: string, onProgress?: (p: SceneProgress) => void): Promise<void>;
  loadScene(name: string, opts?: LoadSceneOptions): Promise<void>;
}
