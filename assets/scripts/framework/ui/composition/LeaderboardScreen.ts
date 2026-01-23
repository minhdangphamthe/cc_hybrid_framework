import { _decorator, Label } from 'cc';
import { RecycleListView, IListAdapter } from '../components/RecycleListView';
import { Binder } from '../mvvm/Binder';
import { UIScreen } from '../UIView';
import { LeaderboardRowCell } from './LeaderboardRowCell';
import { LeaderboardVM, LeaderboardRow } from './LeaderboardVM';

const { ccclass, property } = _decorator;

class RowAdapter implements IListAdapter<LeaderboardRow> {
  constructor(private _vm: LeaderboardVM) {}

  getCount(): number {
    return this._vm.rows.value.length;
  }

  getItem(i: number): LeaderboardRow {
    return this._vm.rows.value[i];
  }

  onBindCell(cellNode: any, data: LeaderboardRow, _index: number): void {
    cellNode.getComponent(LeaderboardRowCell)?.bind(data);
  }
}

@ccclass('LeaderboardScreen')
export class LeaderboardScreen extends UIScreen {
  @property(Label)
  titleLabel: Label | null = null;

  @property(RecycleListView)
  list: RecycleListView | null = null;

  private _vm!: LeaderboardVM;
  private _binder = new Binder();

  onCreate(): void {
    this._vm = new LeaderboardVM();

    if (this.titleLabel) {
      this._binder.bindLabelText(this.titleLabel, this._vm.title);
    }

    this.list?.setAdapter(new RowAdapter(this._vm));
  }

  onDispose(): void {
    this._binder.dispose();
    this._vm.dispose();
  }
}
