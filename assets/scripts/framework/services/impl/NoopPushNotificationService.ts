import { IPushNotificationService, PushPermissionStatus, LocalNotification } from '../interfaces/IPushNotificationService';

export class NoopPushNotificationService implements IPushNotificationService {
  init(): void {}
  dispose(): void {}

  async requestPermission(): Promise<PushPermissionStatus> {
    return { granted: false };
  }
  async getPermissionStatus(): Promise<PushPermissionStatus> {
    return { granted: false };
  }

  async scheduleLocal(_notification: LocalNotification): Promise<void> {}
  async cancelLocal(_id: string): Promise<void> {}
  async cancelAllLocal(): Promise<void> {}
}
