import { Component, Method, Prop, h } from "@stencil/core";
import { PopupMenuOptions } from "./t-popup-menu-controller-interface";

@Component({
  tag: 't-popup-menu-controller',
  styleUrl: 't-popup-menu-controller.scss'
})
export class TPopupMenuController {
  @Prop({ context: 'window' }) win!: Window;

  popoverController: any;

  @Method()
  async create(options: PopupMenuOptions) {
    await this.popoverController.componentOnReady();

    let popover = await this.popoverController.create({
      component: 't-popup-menu-popover',
      componentProps: {
        header: options.header,
        buttons: options.buttons,
        popoverController: this.popoverController
      },
      animated: options.animated,
      backdropDismiss: options.backdropDismiss,
      cssClass: options.cssClass,
      id: options.id,
      keyboardClose: options.keyboardClose,
      mode: options.mode,
      showBackdrop: false,
      translucent: options.translucent,
      event: options.event
    });

    return popover;
  }

  render() {
    return [
      <ion-popover-controller ref={e => this.popoverController = e as any}></ion-popover-controller>,
      <t-popup-menu-popover></t-popup-menu-popover> // Fixes a problem that causes the menu to not be rendered on apps developed with Stencil
    ];
  }
}
