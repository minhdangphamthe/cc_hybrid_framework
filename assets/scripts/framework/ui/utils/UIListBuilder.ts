import { Node, NodePool, Prefab, instantiate, isValid } from 'cc';
import { UIWarmup } from './UIWarmup';

export interface ListBuildOptions {
  /**
   * How many items to build per frame. Smaller = smoother, larger = faster.
   */
  batchSize?: number;

  /** Yield this many frames between batches. */
  yieldFrames?: number;

  /** If true, update Layout/Widget after each batch. */
  refreshLayout?: boolean;
}

export class UIListBuilder {
  /**
   * Rebuild children asynchronously to avoid frame spikes.
   * - Uses NodePool if provided.
   * - `bindItem` must setup item UI based on data.
   */
  static async rebuildAsync<T>(
    container: Node,
    itemPrefab: Prefab,
    data: readonly T[],
    bindItem: (item: Node, datum: T, index: number) => void,
    pool: NodePool | null = null,
    opts: ListBuildOptions = {},
  ): Promise<void> {
    if (!isValid(container, true)) return;

    const batchSize = Math.max(1, opts.batchSize ?? 20);
    const yieldFrames = Math.max(0, opts.yieldFrames ?? 1);
    const refreshLayout = opts.refreshLayout ?? true;

    // Return existing items to pool (optional).
    while (container.children.length > 0) {
      const child = container.children[0];
      child.removeFromParent();
      if (pool) pool.put(child);
      else child.destroy();
    }

    for (let i = 0; i < data.length; i += 1) {
      const datum = data[i];
      const item = pool?.get() ?? instantiate(itemPrefab);
      item.setParent(container);
      bindItem(item, datum, i);

      // Chunking.
      const doneInBatch = (i + 1) % batchSize === 0 || i === data.length - 1;
      if (doneInBatch) {
        if (refreshLayout) UIWarmup.refreshLayoutTree(container);
        for (let f = 0; f < yieldFrames; f += 1) await UIWarmup.nextFrame();
      }
    }

    if (refreshLayout) UIWarmup.refreshLayoutTree(container);
  }
}
