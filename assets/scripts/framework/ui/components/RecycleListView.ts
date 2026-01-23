import { _decorator, Component, instantiate, Node, Prefab, ScrollView, UITransform, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

export interface IListAdapter<T> {
  getCount(): number;
  getItem(index: number): T;
  onCreateCell?(cell: Node): void;
  onBindCell(cell: Node, data: T, index: number): void;
}

@ccclass('RecycleListView')
export class RecycleListView extends Component {
  @property(ScrollView)
  scrollView: ScrollView | null = null;

  @property(Prefab)
  cellPrefab: Prefab | null = null;

  @property({ tooltip: 'Cell height in pixels (fixed-height list).' })
  cellHeight = 120;

  @property({ tooltip: 'Spacing between cells.' })
  spacing = 10;

  @property({ tooltip: 'Extra cells above/below viewport.' })
  buffer = 2;

  private _adapter: IListAdapter<any> | null = null;
  private _cells: Node[] = [];
  private _tmpPos = new Vec3();

  start(): void {
    this.scrollView?.node.on('scrolling', this._onScroll, this);
  }

  onDestroy(): void {
    this.scrollView?.node.off('scrolling', this._onScroll, this);
  }

  setAdapter<T>(adapter: IListAdapter<T>): void {
    this._adapter = adapter as any;
    this._rebuild();
  }

  refresh(): void {
    this._rebuild();
  }

  private _rebuild(): void {
    const sv = this.scrollView;
    const prefab = this.cellPrefab;
    if (!sv || !prefab || !sv.content || !this._adapter) return;

    for (const c of this._cells) c.destroy();
    this._cells.length = 0;

    const viewportH = sv.node.getComponent(UITransform)?.height ?? 600;
    const span = this.cellHeight + this.spacing;
    const visibleCount = Math.ceil(viewportH / span) + this.buffer * 2;
    const count = Math.min(visibleCount, this._adapter.getCount());

    for (let i = 0; i < count; i++) {
      const cell = instantiate(prefab);
      cell.setParent(sv.content);
      this._adapter.onCreateCell?.(cell);
      this._cells.push(cell);
    }

    const totalH = this._adapter.getCount() * span - this.spacing;
    const ct = sv.content.getComponent(UITransform);
    if (ct) ct.height = Math.max(viewportH, totalH);

    this._layoutAndBind();
  }

  private _onScroll(): void {
    this._layoutAndBind();
  }

  private _layoutAndBind(): void {
    const sv = this.scrollView;
    if (!sv || !sv.content || !this._adapter) return;

    const span = this.cellHeight + this.spacing;
    const offsetY = sv.getScrollOffset().y;
    const first = Math.max(0, Math.floor(offsetY / span) - this.buffer);
    const maxFirst = Math.max(0, this._adapter.getCount() - this._cells.length);
    const firstIndex = Math.min(maxFirst, first);

    for (let i = 0; i < this._cells.length; i++) {
      const dataIndex = firstIndex + i;
      const cell = this._cells[i];

      if (dataIndex >= this._adapter.getCount()) {
        cell.active = false;
        continue;
      }

      cell.active = true;

      const y = -(dataIndex * span + this.cellHeight * 0.5);
      this._tmpPos.set(0, y, 0);
      cell.setPosition(this._tmpPos);

      this._adapter.onBindCell(cell, this._adapter.getItem(dataIndex), dataIndex);
    }
  }
}
