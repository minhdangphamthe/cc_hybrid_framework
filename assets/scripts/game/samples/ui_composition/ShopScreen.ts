import { _decorator, Label } from 'cc';
import { ServiceLocator } from '../../../framework/core/ServiceLocator';
import { Services } from '../../../framework/services/ServiceTokens';
import { IAnalyticsService } from '../../../framework/services/interfaces/IAnalyticsService';
import { AnalyticsEvent } from '../../../framework/analytics/AnalyticsEvents';
import { RecycleListView, IListAdapter } from '../../../framework/ui/components/RecycleListView';
import { Binder } from '../../../framework/ui/mvvm/Binder';
import { UIScreen } from '../../../framework/ui/UIScreen';
import { ShopItemCell } from './ShopItemCell';
import { ShopVM, ShopItem } from './ShopVM';

const { ccclass, property } = _decorator;

class ShopAdapter implements IListAdapter<ShopItem> {
  constructor(private _vm: ShopVM, private _onBuy: (id: string) => void) {}

  getCount(): number {
    return this._vm.items.value.length;
  }

  getItem(i: number): ShopItem {
    return this._vm.items.value[i];
  }

  onBindCell(cell: any, data: ShopItem, _index: number): void {
    cell.getComponent(ShopItemCell)?.bind(data, this._onBuy);
  }
}

@ccclass('ShopScreen')
export class ShopScreen extends UIScreen {
  @property(Label)
  titleLabel: Label | null = null;

  @property(RecycleListView)
  list: RecycleListView | null = null;

  private _vm!: ShopVM;
  private _binder = new Binder();

  onCreate(): void {
    this._vm = new ShopVM();

    if (this.titleLabel) {
      this._binder.bindLabelText(this.titleLabel, this._vm.title);
    }

    this.list?.setAdapter(new ShopAdapter(this._vm, (id) => this._buy(id)));
  }

  onDispose(): void {
    this._binder.dispose();
    this._vm.dispose();
  }

  private _buy(id: string): void {
    const analytics = ServiceLocator.tryResolve<IAnalyticsService>(Services.Analytics);
    analytics?.logEvent(AnalyticsEvent.ShopBuyClick, { id });
  }
}
