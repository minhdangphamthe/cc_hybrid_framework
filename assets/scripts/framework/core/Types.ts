export type Constructor<T> = new (...args: any[]) => T;

/** Utility: record of event name -> payload type */
export type EventMap = Record<string, any>;

/** Simple cancel handle */
export interface ICancelable {
  cancel(): void;
}
