import { Constructor } from './Types';

/**
 * ServiceLocator: minimal and practical for small-to-mid projects.
 * Convention: register by token (string/symbol/ctor) and resolve by token.
 */
export type ServiceToken<T> = string | symbol | Constructor<T>;

export class ServiceLocator {
  private static _services = new Map<ServiceToken<any>, any>();

  static register<T>(token: ServiceToken<T>, instance: T): void {
    this._services.set(token, instance);
  }

  static unregister<T>(token: ServiceToken<T>): void {
    this._services.delete(token);
  }

  static resolve<T>(token: ServiceToken<T>): T {
    const v = this._services.get(token);
    if (!v) {
      const name = typeof token === 'function' ? token.name : String(token);
      throw new Error(`[ServiceLocator] Service not found: ${name}`);
    }
    return v as T;
  }

  static tryResolve<T>(token: ServiceToken<T>): T | null {
    return (this._services.get(token) as T) ?? null;
  }

  static reset(): void {
    this._services.clear();
  }
}
