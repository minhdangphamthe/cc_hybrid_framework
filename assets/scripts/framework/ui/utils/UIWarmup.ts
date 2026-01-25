import { Director, Layout, Node, UIOpacity, Widget, director, isValid } from 'cc';

export interface WarmupOptions {
  /**
   * How many frames to yield during warmup.
   * 1 is usually enough, 2 is safer for complex Widget/Layout hierarchies.
   */
  frames?: number;

  /** If true, force update Layout and Widget components before yielding. */
  refreshLayoutTree?: boolean;

  /** If true, keep view active after warmup. Default: false (router will show later). */
  keepActive?: boolean;
}

export class UIWarmup {
  static async warmup(root: Node, opts: WarmupOptions = {}): Promise<void> {
    const frames = Math.max(0, opts.frames ?? 1);
    const refresh = opts.refreshLayoutTree ?? true;

    if (!isValid(root, true)) return;

    // Ensure node is active so Layout/Widget can be computed.
    const prevActive = root.active;
    root.active = true;

    if (refresh) {
      this.refreshLayoutTree(root);
    }

    for (let i = 0; i < frames; i += 1) {
      await this.nextFrame();
      if (refresh) this.refreshLayoutTree(root);
    }

    if (!opts.keepActive) {
      root.active = prevActive;
    }
  }

  static refreshLayoutTree(root: Node): void {
    if (!isValid(root, true)) return;

    const stack: Node[] = [root];
    while (stack.length > 0) {
      const n = stack.pop()!;
      if (!isValid(n, true)) continue;

      // Layout
      const layout = n.getComponent(Layout);
      if (layout && layout.enabled) {
        try {
          layout.updateLayout();
        } catch {
          // ignore
        }
      }

      // Widget
      const widget = n.getComponent(Widget);
      if (widget && widget.enabled) {
        try {
          widget.updateAlignment();
        } catch {
          // ignore
        }
      }

      for (const c of n.children) stack.push(c);
    }
  }

  static ensureHiddenOpacity(root: Node): { restore: () => void } {
    const op = root.getComponent(UIOpacity) ?? root.addComponent(UIOpacity);
    const prev = op.opacity;
    op.opacity = 0;

    return {
      restore: () => {
        if (!isValid(root, true)) return;
        const o = root.getComponent(UIOpacity);
        if (o) o.opacity = prev;
      },
    };
  }

  static nextFrame(): Promise<void> {
    return new Promise((resolve) => {
      director.once(Director.EVENT_AFTER_UPDATE, resolve);
    });
  }
}
