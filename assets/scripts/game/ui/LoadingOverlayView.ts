import { _decorator, Component, Node, UIOpacity, tween } from 'cc';

const { ccclass, property } = _decorator;

/**
 * Custom loading overlay view.
 * Attach this script to the root node of your loading overlay prefab.
 *
 * Required by UILoadingOverlayService (duck-typed):
 * - show(message?)
 * - hide()
 */
@ccclass('LoadingOverlayView')
export class LoadingOverlayView extends Component {
  @property({ type: Node, tooltip: 'Optional spinner node (rotates while visible).' })
  spinner: Node | null = null;
  
  @property({ tooltip: 'Spinner rotation speed in degrees/sec.',
    visible() {
      return this.spinner !== null;
    }
  })
  spinnerSpeed = 540;

  @property({ tooltip: 'Fade in/out when showing/hiding.' })
  useFade = true;

  @property({ tooltip: 'Fade duration in seconds.',
    visible() {
      return this.useFade;
    }
  })
  fadeDuration = 0.12;

  private _container: Node | null = null;
  private _opacity: UIOpacity | null = null;
  private _visible = false;

  onLoad(): void {
    this._container = this.node;

    // Ensure UIOpacity exists (used for fade).
    this._opacity = this._container.getComponent(UIOpacity);
    if (!this._opacity) {
      this._opacity = this._container.addComponent(UIOpacity);
    }

    // Default hidden.
    this._setActive(false, true);
  }

  update(dt: number): void {
    if (!this._visible) return;
    if (!this.spinner || !this.spinner.isValid) return;

    // UI-friendly 2D rotation.
    this.spinner.angle += this.spinnerSpeed * dt;
  }

  show(): void {
    this._setActive(true);
  }

  hide(): void {
    const c = this._container;
    if (!c || !c.isValid) return;

    this._visible = false;

    if (!this.useFade || !this._opacity) {
      c.active = false;
      return;
    }

    tween(this._opacity)
      .stop()
      .to(this.fadeDuration, { opacity: 0 })
      .call(() => {
        if (c.isValid) c.active = false;
      })
      .start();
  }

  private _setActive(active: boolean, immediateOpacity = false): void {
    const c = this._container;
    if (!c || !c.isValid) return;

    this._visible = active;
    c.active = active;

    if (!active) return;

    if (!this.useFade || !this._opacity) {
      if (this._opacity) this._opacity.opacity = 255;
      return;
    }

    if (immediateOpacity) this._opacity.opacity = 255;
    this._opacity.opacity = 0;
    tween(this._opacity)
      .stop()
      .to(this.fadeDuration, { opacity: 255 })
      .start();
  }
}
