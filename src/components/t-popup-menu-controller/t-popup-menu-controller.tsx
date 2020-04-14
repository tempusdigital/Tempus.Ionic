import { PopupMenuOptions } from "./t-popup-menu-controller-interface";
import { popoverController } from '@ionic/core';

export class PopupMenuController {
  public async create(options: PopupMenuOptions) {
    let popover = await popoverController.create({
      component: 't-popup-menu-popover',
      componentProps: {
        header: options.header,
        buttons: options.buttons,
        popoverController: popoverController
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
}

export const popupMenuController = new PopupMenuController();