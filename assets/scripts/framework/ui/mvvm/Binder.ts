import { Label, Node, Sprite, SpriteFrame } from 'cc';
import { Lifetime } from '../../core/Lifetime';
import { ObservableValue } from './ObservableValue';

export class Binder {
  private _life = new Lifetime();

  bindLabelText(label: Label, obs: ObservableValue<string>): this {
    this._life.own(
      obs.subscribe((v) => {
        label.string = v;
      }),
    );
    return this;
  }

  bindNodeActive(node: Node, obs: ObservableValue<boolean>): this {
    this._life.own(
      obs.subscribe((v) => {
        node.active = v;
      }),
    );
    return this;
  }

  bindSpriteFrame(sprite: Sprite, obs: ObservableValue<SpriteFrame | null>): this {
    this._life.own(
      obs.subscribe((v) => {
        sprite.spriteFrame = v ?? null;
      }),
    );
    return this;
  }

  bindNumber(
    label: Label,
    obs: ObservableValue<number>,
    format: (n: number) => string = (n) => `${n}`,
  ): this {
    this._life.own(
      obs.subscribe((v) => {
        label.string = format(v);
      }),
    );
    return this;
  }

  dispose(): void {
    this._life.dispose();
  }
}
