import { _decorator, Component, Label, Node } from 'cc';
import type { LeaderboardRow } from './LeaderboardVM';

const { ccclass, property } = _decorator;

@ccclass('LeaderboardRowCell')
export class LeaderboardRowCell extends Component {
  @property(Label)
  rankLabel: Label | null = null;

  @property(Label)
  nameLabel: Label | null = null;

  @property(Label)
  scoreLabel: Label | null = null;

  @property(Node)
  highlight: Node | null = null;

  bind(row: LeaderboardRow): void {
    if (this.rankLabel) this.rankLabel.string = `${row.rank}`;
    if (this.nameLabel) this.nameLabel.string = row.name;
    if (this.scoreLabel) this.scoreLabel.string = `${row.score}`;
    if (this.highlight) this.highlight.active = !!row.isMe;
  }
}
