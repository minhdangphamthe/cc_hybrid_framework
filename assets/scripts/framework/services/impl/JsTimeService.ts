import { ITimeService } from '../interfaces/ITimeService';
import { ICancelable } from '../../core/Types';

class Cancelable implements ICancelable {
  constructor(private _cancel: () => void) {}
  cancel(): void { this._cancel(); }
}

/** Simple JS timer implementation (ms). */
export class JsTimeService implements ITimeService {
  delay(ms: number, cb: () => void): ICancelable {
    const id = setTimeout(() => cb(), Math.max(0, ms));
    return new Cancelable(() => clearTimeout(id));
  }

  interval(ms: number, cb: () => void): ICancelable {
    const id = setInterval(() => cb(), Math.max(1, ms));
    return new Cancelable(() => clearInterval(id));
  }
}
