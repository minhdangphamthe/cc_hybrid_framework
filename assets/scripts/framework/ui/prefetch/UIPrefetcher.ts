import { JsonAsset, Prefab, SpriteFrame } from 'cc';
import { ServiceLocator } from '../../core/ServiceLocator';
import { Services } from '../../services/ServiceTokens';
import type { IAssetsService } from '../../services/interfaces/IAssetsService';
import type { IUIService } from '../../services/interfaces/IUIService';
import type { UIPrefetchEntry, UIPrefetchManifest } from './UIPrefetchManifest';

/**
 * Prefetcher loads and optionally warms up UI assets in priority order.
 * - Use a manifest JSON under resources for portability.
 * - Safe to run in SceneMode.Single: it waits for Services.UI to be available.
 */
export class UIPrefetcher {
  private _assets: IAssetsService;
  private _ui: IUIService;

  constructor(assets: IAssetsService, ui: IUIService) {
    this._assets = assets;
    this._ui = ui;
  }

  static async tryRunFromManifest(path: string, opts?: { maxFrames?: number; budgetMsPerTick?: number }): Promise<void> {
    const assets = ServiceLocator.tryResolve<IAssetsService>(Services.Assets);
    if (!assets) return;

    const ui = await UIPrefetcher._waitForUI(opts?.maxFrames ?? 60);
    if (!ui) return;

    const manifest = await UIPrefetcher._loadManifest(path);
    if (!manifest) return;

    const prefetcher = new UIPrefetcher(assets, ui);
    await prefetcher.run(manifest, { budgetMsPerTick: opts?.budgetMsPerTick ?? 6 });
  }

  async run(manifest: UIPrefetchManifest, opts?: { budgetMsPerTick?: number }): Promise<void> {
    const budgetMsPerTick = opts?.budgetMsPerTick ?? 6;

    const groups = [...(manifest.groups ?? [])].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
    for (const g of groups) {
      const entries = [...(g.entries ?? [])].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
      await this._runEntries(entries, budgetMsPerTick);
    }
  }

  private async _runEntries(entries: UIPrefetchEntry[], budgetMsPerTick: number): Promise<void> {
    let start = Date.now();
    for (const e of entries) {
      await this._runEntry(e);

      // Soft budget: yield to next frame periodically.
      const now = Date.now();
      if (now - start >= budgetMsPerTick) {
        start = now;
        await UIPrefetcher._nextFrame();
      }
    }
  }

  private async _runEntry(e: UIPrefetchEntry): Promise<void> {
    if (!e?.path) return;

    if (e.type === 'view') {
      await this._ui.preloadView(e.path);
      if (e.warmup) {
        await this._ui.warmupView(e.path, e.params);
      }
      return;
    }

    if (e.type === 'prefab') {
      await this._assets.load(e.path, Prefab as any, { bundle: e.bundle });
      return;
    }

    if (e.type === 'spriteframe') {
      await this._assets.load(e.path, SpriteFrame as any, { bundle: e.bundle });
      return;
    }
  }

  private static async _loadManifest(path: string): Promise<UIPrefetchManifest | null> {
    const assets = ServiceLocator.tryResolve<IAssetsService>(Services.Assets);
    if (!assets) return null;

    try {
      const json = await assets.load(path, JsonAsset as any);
      return (json?.json ?? null) as UIPrefetchManifest | null;
    } catch {
      return null;
    }
  }

  private static async _waitForUI(maxFrames: number): Promise<IUIService | null> {
    for (let i = 0; i < maxFrames; i += 1) {
      const ui = ServiceLocator.tryResolve<IUIService>(Services.UI);
      if (ui) return ui;
      await UIPrefetcher._nextFrame();
    }
    return null;
  }

  private static async _nextFrame(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }
}
