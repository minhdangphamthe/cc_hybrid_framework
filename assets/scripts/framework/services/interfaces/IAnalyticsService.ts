import { IService } from './IService';

export type AnalyticsValue = string | number | boolean | null;
export type AnalyticsParams = Record<string, AnalyticsValue>;

export interface IAnalyticsService extends IService {
  logEvent(name: string, params?: AnalyticsParams): void;
  setUserProperty(name: string, value: AnalyticsValue): void;
  setUserId(id: string | null): void;
}
