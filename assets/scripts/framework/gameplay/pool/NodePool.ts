import { Component, instantiate, Node, Prefab } from 'cc';
import { IPoolable } from './IPoolable';

/**
 * Simple prefab pool.
 * Ownership rule: Pool owns spawned nodes.
 *
 * Cleanup discipline:
 * - Implement IPoolable on components that need reset/cleanup.
 * - Prefer to cleanup tweens/timers/event subscriptions in onDespawn().
 */
export class NodePool {
  private _items: Node[] = [];

  constructor(private readonly _prefab: Prefab, private readonly _initialSize = 0) {
    for (let i = 0; i < this._initialSize; i++) {
      this._items.push(this.create());
    }
  }

  private create(): Node {
    const n = instantiate(this._prefab);
    n.active = false;
    return n;
  }

  spawn(parent?: Node, data?: any): Node {
    const node = this._items.pop() ?? this.create();
    if (parent) node.setParent(parent);
    node.active = true;

    this.callPoolable(node, 'onSpawn', data);
    return node;
  }

  despawn(node: Node): void {
    if (!node || !node.isValid) return;

    this.callPoolable(node, 'onDespawn');
    node.removeFromParent();
    node.active = false;
    this._items.push(node);
  }

  clear(destroyNodes = true): void {
    if (destroyNodes) {
      for (const n of this._items) {
        if (n.isValid) n.destroy();
      }
    }
    this._items.length = 0;
  }

  private callPoolable(node: Node, method: 'onSpawn' | 'onDespawn', data?: any): void {
    const comps = node.getComponentsInChildren(Component, true);
    for (const c of comps) {
      const p = c as unknown as IPoolable;
      const fn = (p as any)[method];
      if (typeof fn === 'function') {
        try { fn.call(p, data); } catch {}
      }
    }
  }
}
