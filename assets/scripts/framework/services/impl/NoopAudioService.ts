import { IAudioService, AudioChannel } from '../interfaces/IAudioService';

export class NoopAudioService implements IAudioService {
  init(): void {}
  dispose(): void {}

  setMuted(_muted: boolean): void {}
  setVolume(_channel: AudioChannel, _volume01: number): void {}
  playBGM(_key: string, _loop = true): void {}
  stopBGM(): void {}
  playSFX(_key: string): void {}
  playUI(_key: string): void {}
}
