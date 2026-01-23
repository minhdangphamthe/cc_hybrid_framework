import { IService } from './IService';
import { ICancelable } from '../../core/Types';

export interface ITimeService extends IService {
  /** Delay in milliseconds. */
  delay(ms: number, cb: () => void): ICancelable;
  /** Repeat in milliseconds. */
  interval(ms: number, cb: () => void): ICancelable;

  /** Uses game pause/resume if you implement it; noop in default. */
  pauseAll?(): void;
  resumeAll?(): void;
}
