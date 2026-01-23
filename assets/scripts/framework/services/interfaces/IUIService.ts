import { UIPopup } from '../../ui/UIPopup';
import { UIScreen } from '../../ui/UIScreen';

export interface IUIService {
  openScreen(path: string, params?: any): Promise<UIScreen>;
  closeTopScreen(): Promise<void>;
  openPopup(path: string, params?: any): Promise<UIPopup>;
  closeTopPopup(): Promise<void>;
  closeAllPopups(): Promise<void>;
  showToast(text: string, durationSec?: number): void;
}
