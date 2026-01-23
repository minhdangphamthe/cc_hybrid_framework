import { IAnalyticsService, AnalyticsParams, AnalyticsValue } from '../interfaces/IAnalyticsService';

export class NoopAnalyticsService implements IAnalyticsService {
  init(): void {}
  dispose(): void {}

  logEvent(_name: string, _params?: AnalyticsParams): void {}
  setUserProperty(_name: string, _value: AnalyticsValue): void {}
  setUserId(_id: string | null): void {}
}
