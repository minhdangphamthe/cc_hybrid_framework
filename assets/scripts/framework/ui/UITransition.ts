import { Node, tween, UIOpacity, Vec3 } from 'cc';
export type TransitionKind = 'none' | 'fade' | 'scaleFade';

export class UITransition {
  static async playIn(node: Node, kind: TransitionKind, duration = 0.18): Promise<void> {
    if (kind === 'none') return;
    if (kind === 'fade') return this._fade(node, 0, 255, duration);
    return this._scaleFade(node, 0.92, 1, 0, 255, duration);
  }

  static async playOut(node: Node, kind: TransitionKind, duration = 0.14): Promise<void> {
    if (kind === 'none') return;
    if (kind === 'fade') return this._fade(node, 255, 0, duration);
    return this._scaleFade(node, 1, 0.92, 255, 0, duration);
  }

  private static _ensureOpacity(node: Node): UIOpacity {
    let op = node.getComponent(UIOpacity);
    if (!op) op = node.addComponent(UIOpacity);
    return op;
  }

  private static _fade(node: Node, from: number, to: number, d: number): Promise<void> {
    const op = this._ensureOpacity(node);
    op.opacity = from;
    return new Promise<void>((res) => tween(op).to(d, { opacity: to }).call(res).start());
  }

  private static _scaleFade(node: Node, sFrom: number, sTo: number, oFrom: number, oTo: number, d: number): Promise<void> {
    const op = this._ensureOpacity(node);
    op.opacity = oFrom;
    node.setScale(new Vec3(sFrom, sFrom, 1));
    return new Promise<void>((res) => {
      tween(node).to(d, { scale: new Vec3(sTo, sTo, 1) }).start();
      tween(op).to(d, { opacity: oTo }).call(res).start();
    });
  }
}
