import { ObservableValue } from '../../../framework/ui/mvvm/ObservableValue';
import { ViewModel } from '../../../framework/ui/mvvm/ViewModel';

export type LeaderboardRow = { rank: number; name: string; score: number; isMe?: boolean };

export class LeaderboardVM extends ViewModel {
  title = new ObservableValue<string>('Leaderboard');
  rows = new ObservableValue<LeaderboardRow[]>([]);

  constructor() {
    super();
    const data: LeaderboardRow[] = [];
    for (let i = 1; i <= 200; i++) {
      data.push({
        rank: i,
        name: `Player ${i}`,
        score: 10000 - i * 17,
        isMe: i === 42,
      });
    }
    this.rows.value = data;
  }
}
