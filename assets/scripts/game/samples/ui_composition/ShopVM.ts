import { ObservableValue } from '../../../framework/ui/mvvm/ObservableValue';
import { ViewModel } from '../../../framework/ui/mvvm/ViewModel';

export type ShopItem = { id: string; title: string; price: string; owned?: boolean; badge?: string };

export class ShopVM extends ViewModel {
  title = new ObservableValue<string>('Shop');
  items = new ObservableValue<ShopItem[]>([]);

  constructor() {
    super();
    this.items.value = [
      { id: 'pack_small', title: 'Small Pack', price: '$0.99', badge: 'BEST' },
      { id: 'pack_medium', title: 'Medium Pack', price: '$2.99' },
      { id: 'pack_large', title: 'Large Pack', price: '$4.99', badge: 'SALE' },
      { id: 'skin_1', title: 'Skin #1', price: '500 Coins', owned: true },
      { id: 'skin_2', title: 'Skin #2', price: '800 Coins' },
    ];
  }
}
