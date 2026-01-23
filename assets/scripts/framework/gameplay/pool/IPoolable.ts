export interface IPoolable {
  /** Called when spawned from pool */
  onSpawn?(data?: any): void;
  /** Called before returning to pool (cleanup listeners/tweens/timers) */
  onDespawn?(): void;
}
