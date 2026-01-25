import { UIPopup } from '../../ui/UIPopup';
import { UIScreen } from '../../ui/UIScreen';

export interface IUIService {
  openScreen(path: string, params?: any): Promise<UIScreen>;
  replaceScreen(path: string, params?: any): Promise<UIScreen>;

  /** Preload a view prefab into cache (no instantiation). */
  preloadView(path: string): Promise<void>;

  /** Warm up a screen/popup offscreen (instantiate + run hooks + destroy). */
  warmupView(path: string, params?: any): Promise<void>;

  closeTopScreen(): Promise<void>;
  openPopup(path: string, params?: any): Promise<UIPopup>;
  closeTopPopup(): Promise<void>;
  closeAllPopups(): Promise<void>;
  showToast(text: string, durationSec?: number): void;
}
