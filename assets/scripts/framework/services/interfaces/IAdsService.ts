import { IService } from './IService';

export type AdPlacement = string;

export interface IAdsService extends IService {
  isReadyInterstitial(placement?: AdPlacement): boolean;
  showInterstitial(placement?: AdPlacement): Promise<boolean>;

  isReadyRewarded(placement?: AdPlacement): boolean;
  showRewarded(placement?: AdPlacement): Promise<{ success: boolean; rewarded: boolean }>;

  /** Optional banner */
  showBanner?(placement?: AdPlacement): void;
  hideBanner?(): void;
}
