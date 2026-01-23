import { IService } from './IService';

export interface PushPermissionStatus {
  granted: boolean;
  provisional?: boolean;
}

export interface LocalNotification {
  id: string;
  title: string;
  body: string;
  fireTimeMs: number; // epoch ms
  data?: Record<string, any>;
}

export interface IPushNotificationService extends IService {
  requestPermission(): Promise<PushPermissionStatus>;
  getPermissionStatus(): Promise<PushPermissionStatus>;

  /** Local notifications (optional). */
  scheduleLocal(notification: LocalNotification): Promise<void>;
  cancelLocal(id: string): Promise<void>;
  cancelAllLocal(): Promise<void>;

  /** Remote push token (optional). */
  getDeviceToken?(): Promise<string | null>;
}
