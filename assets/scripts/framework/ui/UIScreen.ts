import { _decorator, BlockInputEvents, Node, UITransform, Widget } from 'cc';
import { UIView } from './UIView';

const { ccclass, property } = _decorator;

@ccclass('UIScreen')
export class UIScreen extends UIView {
  /**
   * Keep this screen instance alive when it is replaced/closed.
   * Router may cache it and reuse later to avoid re-instantiation for heavy UIs.
   */
  @property({ tooltip: 'Keep this screen instance alive when replaced/closed (router cache).' })
  keepAlive = false;

  /**
   * If enabled, the screen can temporarily block user input via an invisible blocker node.
   * This is useful for heavy UI warmup or async list rebuilds to avoid micro-glitches.
   */
  @property({ tooltip: 'Block input while this screen is warming up / rebuilding heavy UI.' })
  blockInputUntilWarmupDone = true;

  /**
   * Optional back handler. Router will call this before default back behavior.
   * Return true to consume the back action.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async onBackPressed(): Promise<boolean> {
    return false;
  }

  private _blocker: Node | null = null;
  private _blockCount = 0;

  /** Called by router/host before warmup. You may call this manually for heavy rebuilds. */
  notifyWarmupStart(): void {
    if (!this.blockInputUntilWarmupDone) return;
    this.blockInput('warmup');
  }

  /** Called by router/host after warmup. You may call this manually after heavy rebuilds. */
  notifyWarmupDone(): void {
    if (!this.blockInputUntilWarmupDone) return;
    this.unblockInput('warmup');
  }

  /** Blocks input with reference counting (safe to call multiple times). */
  blockInput(_reason?: string): void {
    this._blockCount += 1;
    this._ensureBlocker();
    if (this._blocker && this._blocker.isValid) this._blocker.active = true;
  }

  /** Unblocks input with reference counting. Never goes below 0. */
  unblockInput(_reason?: string): void {
    this._blockCount = Math.max(0, this._blockCount - 1);
    if (this._blockCount === 0) {
      if (this._blocker && this._blocker.isValid) this._blocker.active = false;
    }
  }

  /** Optional hook called by router when reusing a cached keepAlive screen. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onReuse?(params?: any): void;

  private _ensureBlocker(): void {
    if (this._blocker && this._blocker.isValid) return;

    const blocker = new Node('InputBlocker');
    blocker.layer = this.node.layer;
    blocker.active = false;

    // Full-screen UITransform + Widget stretch.
    const trans = blocker.addComponent(UITransform);
    // Let Widget control size; contentSize will be updated by layout system.
    trans.setContentSize(1, 1);

    const w = blocker.addComponent(Widget);
    w.isAlignLeft = true;
    w.isAlignRight = true;
    w.isAlignTop = true;
    w.isAlignBottom = true;
    w.left = 0;
    w.right = 0;
    w.top = 0;
    w.bottom = 0;
    w.alignMode = Widget.AlignMode.ALWAYS;

    blocker.addComponent(BlockInputEvents);

    // Ensure it is above the screen content.
    blocker.setParent(this.node);
    blocker.setSiblingIndex(this.node.children.length - 1);

    this._blocker = blocker;
  }

  onDestroy(): void {
    // Ensure blocker is removed with screen.
    this._blocker = null;
    super.onDestroy();
  }
}
