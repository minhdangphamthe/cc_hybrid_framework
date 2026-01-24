import { ObservableValue } from '../../framework/ui/mvvm/ObservableValue';
import { ViewModel } from '../../framework/ui/mvvm/ViewModel';

/**
 * Shared session state across screens.
 * Keep it small: it should represent current run/session only.
 */
export class GameSessionVM extends ViewModel {
  readonly score = new ObservableValue<number>(0);
  readonly isWin = new ObservableValue<boolean>(true);

  reset(): void {
    this.score.value = 0;
    this.isWin.value = true;
  }
}
