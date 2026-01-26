export type UIPrefetchEntryType = 'view' | 'prefab' | 'spriteframe';

export interface UIPrefetchEntry {
  type: UIPrefetchEntryType;

  /** Resources path. Example: 'ui/screens/HomeScreen' (without extension). */
  path: string;

  /** Optional: bundle name. Default is 'resources'. */
  bundle?: string;

  /** Optional: when type = 'view', run warmupView (instantiate + hooks + destroy). */
  warmup?: boolean;

  /** Optional params passed into warmupView. Keep it small (ids/counts), no heavy objects. */
  params?: any;

  /** Optional priority inside group (lower first). */
  priority?: number;
}

export interface UIPrefetchGroup {
  name: string;
  priority?: number;
  entries: UIPrefetchEntry[];
}

export interface UIPrefetchManifest {
  version: number;
  groups: UIPrefetchGroup[];
}
