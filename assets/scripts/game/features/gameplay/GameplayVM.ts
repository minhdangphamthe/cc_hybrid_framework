import { ObservableValue } from '../../../framework/ui/mvvm/ObservableValue';
import { ViewModel } from '../../../framework/ui/mvvm/ViewModel';

export class GameplayVM extends ViewModel {
  readonly scoreText = new ObservableValue<string>('Score: 0');

  setScore(score: number): void {
    this.scoreText.value = `Score: ${score}`;
  }
}
