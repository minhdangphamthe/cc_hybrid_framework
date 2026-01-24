import { ObservableValue } from '../../../framework/ui/mvvm/ObservableValue';
import { ViewModel } from '../../../framework/ui/mvvm/ViewModel';

export class HomeVM extends ViewModel {
  readonly title = new ObservableValue<string>('Home');
  readonly hint = new ObservableValue<string>('Press Play to start');
}
