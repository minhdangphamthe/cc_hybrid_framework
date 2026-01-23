import { _decorator, Component, Node, ScrollView, UITransform } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('PagerView')
export class PagerView extends Component {
  @property(ScrollView)
  scrollView: ScrollView | null = null;

  @property([Node])
  pages: Node[] = [];

  @property(Node)
  indicatorRoot: Node | null = null;

  private _index = 0;

  start(): void {
    this.scrollView?.node.on('scroll-ended', this._onScrollEnded, this);
    this._updateIndicator();
  }

  onDestroy(): void {
    this.scrollView?.node.off('scroll-ended', this._onScrollEnded, this);
  }

  setIndex(i: number): void {
    const sv = this.scrollView;
    if (!sv) return;

    this._index = Math.max(0, Math.min(this.pages.length - 1, i));
    this._updateIndicator();

    const pageWidth = this._getPageWidth();
    sv.scrollToOffset({ x: this._index * pageWidth, y: 0 }, 0.2);
  }

  private _onScrollEnded(): void {
    const sv = this.scrollView;
    if (!sv || !sv.content) return;

    const x = -sv.content.position.x;
    const pageWidth = this._getPageWidth();
    const i = Math.round(x / Math.max(1, pageWidth));

    this._index = Math.max(0, Math.min(this.pages.length - 1, i));
    this._updateIndicator();
  }

  private _getPageWidth(): number {
    const first = this.pages[0];
    if (!first) return 1;
    return first.getComponent(UITransform)?.width ?? 1;
  }

  private _updateIndicator(): void {
    if (!this.indicatorRoot) return;

    for (let i = 0; i < this.indicatorRoot.children.length; i++) {
      this.indicatorRoot.children[i].active = i === this._index;
    }
  }
}
