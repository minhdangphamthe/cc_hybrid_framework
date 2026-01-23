import { INetworkService, HttpOptions } from '../interfaces/INetworkService';

/** Fetch wrapper. Works on web/mobile (if fetch available). */
export class FetchNetworkService implements INetworkService {
  async get<T>(url: string, opts?: HttpOptions): Promise<T> {
    return this._request<T>('GET', url, undefined, opts);
  }
  async post<T>(url: string, body?: any, opts?: HttpOptions): Promise<T> {
    return this._request<T>('POST', url, body, opts);
  }

  private async _request<T>(method: string, url: string, body?: any, opts?: HttpOptions): Promise<T> {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeout = opts?.timeoutMs ?? 15000;

    let timer: any = null;
    if (controller) {
      timer = setTimeout(() => controller.abort(), timeout);
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(opts?.headers ?? {}),
        },
        body: body == null ? undefined : JSON.stringify(body),
        signal: controller?.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`[Network] ${method} ${url} failed: ${res.status} ${text}`);
      }
      const contentType = res.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        return (await res.json()) as T;
      }
      // fallback
      return (await res.text()) as unknown as T;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}
