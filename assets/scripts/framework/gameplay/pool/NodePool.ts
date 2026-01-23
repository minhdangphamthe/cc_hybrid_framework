import { Component, instantiate, Node, Prefab } from 'cc';
import { IPoolable } from './IPoolable';

/**
 * Simple prefab pool.
 * - Use component implementing IPoolable for cleanup.
 * - Ownership rule: Pool owns spawned nodes.
 */
export class NodePool {
  private _items: Node[] = [];

  constructor(private _prefab: Prefab, private _initialSize = 0) {
    for (let i = 0; i < _initialSize; i++) {
      this._items.push(this._create());
    }
  }

  private _create(): Node {
    const n = instantiate(this._prefab);
    n.active = false;
    return n;
  }

  spawn(parent?: Node, data?: any): Node {
    const node = this._items.pop() ?? this._create();
    if (parent) node.setParent(parent);
    node.active = true;

    // call IPoolable if present
    // Traverse all components and call onSpawn if method exists
    for (const c of node.getComponentsInChildren(Component) as unknown as any[]) {
      const p = c as IPoolable;
      p.onSpawn?.(data);
    }
    return node;
  }

  despawn(node: Node): void {
    if (!node || !node.isValid) return;

    // cleanup
    for (const c of node.getComponentsInChildren(Component) as unknown as any[]) {
      const p = c as IPoolable;
      p.onDespawn?.();
    }

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
}
