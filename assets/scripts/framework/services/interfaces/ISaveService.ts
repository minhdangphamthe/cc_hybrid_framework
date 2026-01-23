import { IService } from './IService';

export interface ISaveService extends IService {
  getString(key: string, defaultValue?: string): string;
  setString(key: string, value: string): void;

  getNumber(key: string, defaultValue?: number): number;
  setNumber(key: string, value: number): void;

  getBool(key: string, defaultValue?: boolean): boolean;
  setBool(key: string, value: boolean): void;

  getObject<T>(key: string, defaultValue: T): T;
  setObject<T>(key: string, value: T): void;

  remove(key: string): void;
  clearAll(prefix?: string): void;
}
