import { UIScreen, UIPopup } from '../../ui/UIView';

export interface IUIService {
  openScreen(path: string, params?: any): Promise<UIScreen>;
  closeTopScreen(): Promise<void>;
  openPopup(path: string, params?: any): Promise<UIPopup>;
  closeTopPopup(): Promise<void>;
  closeAllPopups(): Promise<void>;
  showToast(text: string, durationSec?: number): void;
}
