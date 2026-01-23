import { IService } from './IService';

export interface HttpOptions {
  timeoutMs?: number;
  headers?: Record<string, string>;
}

export interface INetworkService extends IService {
  get<T>(url: string, opts?: HttpOptions): Promise<T>;
  post<T>(url: string, body?: any, opts?: HttpOptions): Promise<T>;
}
