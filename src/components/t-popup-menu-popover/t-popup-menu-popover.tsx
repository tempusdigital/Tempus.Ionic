import { Component, Prop, Method, h } from '@stencil/core';
import { PopupMenuButton } from '../t-popup-menu-controller/t-popup-menu-controller-interface';
import { popoverController } from '@ionic/core';

@Component({
  tag: 't-popup-menu-popover',
  styleUrl: 't-popup-menu-popover.scss'
})
export class TPopupMenuPopover {

  @Prop() header: string;

  @Prop() buttons: PopupMenuButton[];

  @Method()
  async dismiss() {
    await popoverController.dismiss();
  }

  handleButtonClick(button: PopupMenuButton) {
    button.handler && button.handler();
    this.dismiss();
  }

  render() {
    if (!this.buttons)
    return;
    
    return [
      <ion-list lines="none" no-margin>
        {
          this.header &&
          <ion-list-header>{this.header}</ion-list-header>
        }
        {
          this.buttons.map(button =>
            <ion-item button onClick={()=>this.handleButtonClick(button)}>
              {button.icon && <ion-icon name={button.icon} slot="start"></ion-icon>}
              {button.text}
            </ion-item>)
        }
      </ion-list>
    ];
  }
}
