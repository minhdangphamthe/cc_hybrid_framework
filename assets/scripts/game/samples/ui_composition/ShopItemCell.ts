import { _decorator, Button, Component, Label, Node } from 'cc';
import type { ShopItem } from './ShopVM';

const { ccclass, property } = _decorator;

@ccclass('ShopItemCell')
export class ShopItemCell extends Component {
  @property(Label)
  titleLabel: Label | null = null;

  @property(Label)
  priceLabel: Label | null = null;

  @property(Node)
  badgeNode: Node | null = null;

  @property(Label)
  badgeLabel: Label | null = null;

  @property(Button)
  actionButton: Button | null = null;

  private _item: ShopItem | null = null;
  private _onBuy: ((id: string) => void) | null = null;

  start(): void {
    this.actionButton?.node.on(Button.EventType.CLICK, this._onClick, this);
  }

  onDestroy(): void {
    const node = this.actionButton?.node;
    if (node && node.isValid) node.off(Button.EventType.CLICK, this._onClick, this);
  }

  bind(item: ShopItem, onBuy?: (id: string) => void): void {
    this._item = item;
    this._onBuy = onBuy ?? null;

    if (this.titleLabel) this.titleLabel.string = item.title;
    if (this.priceLabel) this.priceLabel.string = item.owned ? 'Owned' : item.price;

    if (this.badgeNode) this.badgeNode.active = !!item.badge;
    if (this.badgeLabel) this.badgeLabel.string = item.badge ?? '';

    if (this.actionButton) this.actionButton.interactable = !item.owned;
  }

  private _onClick(): void {
    if (!this._item || this._item.owned) return;
    this._onBuy?.(this._item.id);
  }
}
