import { Component, h, Prop } from '@stencil/core';
import { PagerButton, PagerMessages } from '../t-pager/interfaces';
import { popoverController } from '@ionic/core';

@Component({
  tag: 't-pager-popover',
})

export class TPagerPopover {

  @Prop() messages: PagerMessages = {

    nextPage: 'Próxima',
    previousPage: 'Anterior',
    firstPage: 'Primeira Página',
    lastPage: 'Ultima Página',

  }

  handleButtonClick(button: PagerButton) {

    popoverController.dismiss({ button });

  }

  render() {

    return [

      <ion-list class="ion-no-padding">

        <ion-item button lines="full" onClick={() => this.handleButtonClick('first-page')}>
          <ion-label>{this.messages.firstPage}</ion-label>
        </ion-item>

        <ion-item button lines="none" onClick={() => this.handleButtonClick('last-page')}>
          <ion-label>{this.messages.lastPage}</ion-label>
        </ion-item>

      </ion-list>

    ];
  }
}
