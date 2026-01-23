import { instantiate, Node, Prefab } from 'cc';
import { UIView } from '../UIView';

export interface IUIView {
  onShow?(): void;
  onHide?(): void;
  onDestroyView?(): void;
}

/**
 * Simple router: push/pop views onto a root node.
 * Use for HUD stack / modal popups.
 */
export class UIRouter {
  private _stack: Node[] = [];
  constructor(private _root: Node) {}

  get count(): number { return this._stack.length; }

  push(prefab: Prefab): Node {
    const node = instantiate(prefab);
    node.setParent(this._root);
    node.active = true;
    this._stack.push(node);

    const view = node.getComponent(UIView) as any as IUIView;
    view?.onShow?.();
    return node;
  }

  pop(): void {
    const node = this._stack.pop();
    if (!node || !node.isValid) return;
    const view = node.getComponent(UIView) as any as IUIView;
    view?.onHide?.();
    view?.onDestroyView?.();
    node.destroy();
  }

  popAll(): void {
    while (this._stack.length > 0) this.pop();
  }

  dispose(): void {
    this.popAll();
  }
}
