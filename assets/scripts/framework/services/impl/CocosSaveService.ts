import { sys } from 'cc';
import { ISaveService } from '../interfaces/ISaveService';

/** LocalStorage wrapper with optional prefix. */
export class CocosSaveService implements ISaveService {
  constructor(private _prefix = 'game_') {}

  private k(key: string): string { return `${this._prefix}${key}`; }

  getString(key: string, defaultValue = ''): string {
    const v = sys.localStorage.getItem(this.k(key));
    return v == null ? defaultValue : v;
  }
  setString(key: string, value: string): void {
    sys.localStorage.setItem(this.k(key), value);
  }

  getNumber(key: string, defaultValue = 0): number {
    const v = this.getString(key, '');
    const n = Number(v);
    return Number.isFinite(n) ? n : defaultValue;
  }
  setNumber(key: string, value: number): void {
    this.setString(key, String(value));
  }

  getBool(key: string, defaultValue = false): boolean {
    const v = this.getString(key, '');
    if (v === '') return defaultValue;
    return v === '1' || v === 'true';
  }
  setBool(key: string, value: boolean): void {
    this.setString(key, value ? '1' : '0');
  }

  getObject<T>(key: string, defaultValue: T): T {
    const v = this.getString(key, '');
    if (!v) return defaultValue;
    try { return JSON.parse(v) as T; } catch { return defaultValue; }
  }
  setObject<T>(key: string, value: T): void {
    this.setString(key, JSON.stringify(value));
  }

  remove(key: string): void {
    sys.localStorage.removeItem(this.k(key));
  }

  clearAll(prefix = this._prefix): void {
    // localStorage has no prefix enumeration helper; brute-force keys
    const ls = sys.localStorage as any;
    const len = ls.length ?? 0;
    const keys: string[] = [];
    for (let i = 0; i < len; i++) {
      const k = ls.key(i);
      if (typeof k === 'string' && k.startsWith(prefix)) keys.push(k);
    }
    for (const k of keys) {
      sys.localStorage.removeItem(k);
    }
  }
}
