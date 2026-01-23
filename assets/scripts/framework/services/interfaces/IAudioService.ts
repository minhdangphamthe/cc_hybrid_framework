import { IService } from './IService';

export type AudioChannel = 'BGM' | 'SFX' | 'UI';

export interface IAudioService extends IService {
  setMuted(muted: boolean): void;
  setVolume(channel: AudioChannel, volume01: number): void;
  playBGM(key: string, loop?: boolean): void;
  stopBGM(): void;
  playSFX(key: string): void;
  playUI(key: string): void;
}
