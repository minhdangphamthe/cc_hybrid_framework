import { _decorator, Button, Component, Node } from 'cc';

const { ccclass, property } = _decorator;

export type TabChanged = (index: number) => void;

@ccclass('TabView')
export class TabView extends Component {
  @property([Button])
  tabButtons: Button[] = [];

  @property([Node])
  pages: Node[] = [];

  private _index = 0;
  private _onChanged: TabChanged | null = null;
  private _clickHandlers: Array<(() => void) | null> = [];

  start(): void {
    this._clickHandlers.length = this.tabButtons.length;
    this.tabButtons.forEach((btn, i) => {
      const handler = () => this.setIndex(i);
      this._clickHandlers[i] = handler;
      btn.node.on(Button.EventType.CLICK, handler, this);
    });

    this._apply();
  }

  onDestroy(): void {
    this.tabButtons.forEach((btn, i) => {
      const node = btn?.node;
      const handler = this._clickHandlers[i];
      if (node && node.isValid && handler) node.off(Button.EventType.CLICK, handler, this);
    });
    this._clickHandlers.length = 0;
  }

  setIndex(i: number): void {
    if (i < 0 || i >= this.pages.length) return;
    if (this._index === i) return;

    this._index = i;
    this._apply();
    this._onChanged?.(i);
  }

  onChanged(cb: TabChanged): void {
    this._onChanged = cb;
  }

  private _apply(): void {
    for (let i = 0; i < this.pages.length; i++) {
      this.pages[i].active = i === this._index;
    }

    for (let i = 0; i < this.tabButtons.length; i++) {
      this.tabButtons[i].interactable = i !== this._index;
    }
  }
}
