import { _decorator, Label } from 'cc';
import { UIPopup } from '../UIView';

const { ccclass, property } = _decorator;

@ccclass('ToastView')
export class ToastView extends UIPopup {
  @property(Label)
  label: Label | null = null;

  onCreate(params?: { text: string; duration: number }): void {
    this.closeOnBackdrop = false;
    if (this.label && params?.text) this.label.string = params.text;
  }

  async play(text: string, duration: number): Promise<void> {
    if (this.label) this.label.string = text;

    await this.show();
    await this._wait(Math.max(0.2, duration));
    await this.hide();
  }

  private _wait(seconds: number): Promise<void> {
    return new Promise<void>((resolve) => {
      this.scheduleOnce(() => resolve(), seconds);
    });
  }
}
