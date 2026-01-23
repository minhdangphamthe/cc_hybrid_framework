import { IAdsService } from '../interfaces/IAdsService';

export class NoopAdsService implements IAdsService {
  init(): void {}
  dispose(): void {}

  isReadyInterstitial(): boolean { return false; }
  async showInterstitial(): Promise<boolean> { return false; }

  isReadyRewarded(): boolean { return false; }
  async showRewarded(): Promise<{ success: boolean; rewarded: boolean }> {
    return { success: false, rewarded: false };
  }
}
