import { _decorator } from 'cc';
import { UIView } from './UIView';

const { ccclass, property } = _decorator;

@ccclass('UIPopup')
export class UIPopup extends UIView {
  @property({ tooltip: 'If true, a click on backdrop should close the popup.' })
  closeOnBackdrop = true;
}
