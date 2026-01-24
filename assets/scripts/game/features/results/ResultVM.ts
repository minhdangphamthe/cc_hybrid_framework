import { ObservableValue } from '../../../framework/ui/mvvm/ObservableValue';
import { ViewModel } from '../../../framework/ui/mvvm/ViewModel';

export class ResultVM extends ViewModel {
  readonly title = new ObservableValue<string>('Result');
  readonly detail = new ObservableValue<string>('');

  setResult(win: boolean, score: number): void {
    this.title.value = win ? 'You Win!' : 'You Lose';
    this.detail.value = `Score: ${score}`;
  }
}
