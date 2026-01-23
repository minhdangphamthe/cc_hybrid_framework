import { Node, Vec2 } from 'cc';
import { IService } from './IService';

export interface PointerDown {
  id: number;
  screenPos: Vec2;
  worldPos?: Vec2;
}

export interface IInputService extends IService {
  /** Attach to a node to receive pointer events in a unified way. */
  bind(node: Node): void;
  unbind(node: Node): void;

  onPointerDown(cb: (e: PointerDown) => void): void;
  onPointerMove(cb: (e: PointerDown) => void): void;
  onPointerUp(cb: (e: PointerDown) => void): void;

  setEnabled(enabled: boolean): void;
}
