import { Component, Prop, h, Event, EventEmitter } from '@stencil/core';
import { popoverController } from '@ionic/core';
import { PageChanged, PagerButton, Messages } from './interfaces';

@Component({
  tag: 't-pager'
})
  
export class tPager {
  private start: number = 1;
  private end: number = 20;
  @Prop() disabled: boolean = false;
  @Prop({ mutable: true }) page: number = 1;
  @Prop() pageSize: number = 20;
  @Prop() totalItems: number = 500;

  @Prop() messages: Messages = {
    nextPage: 'Próxima',
    previousPage: 'Anterior',
    firstPage: 'Primeira Página',
    lastPage: 'Ultima Página'
  }

  @Event() pageChanged: EventEmitter<PageChanged>;

  private getStart() {
    this.start = ((this.pageSize * this.page - 1) - this.pageSize) + 2;
    return this.start;
  }

  private getEnd() {
    if (this.pageSize * this.page <= this.totalItems) {
      this.end = (this.pageSize * this.page);
    } else {
      this.end = this.totalItems;
    }

    return this.end;
  }

  private emitChanges(pageToPass: number) {
    let buttons = this.callEnabled();

    if (this.pageSize * pageToPass <= this.totalItems) {
      this.end = (this.pageSize * pageToPass);
    } else {
      this.end = this.totalItems;
    }

    this.start = ((this.pageSize * pageToPass - 1) - this.pageSize) + 2;

    this.pageChanged.emit({
      start: this.start,
      end: this.end,
      page: pageToPass,
      pageSize: this.pageSize,
      totalItems: this.totalItems,
      hasNextPage: buttons.hasNextPage,
      hasPreviousPage: buttons.hasPreviousPage
    });

  }

  private buttonsNextPage() {
    this.emitChanges(this.page + 1);
    this.page++;
  }

  private buttonsPreviousPage() {
    this.emitChanges(this.page - 1);
    this.page--;
  }

  private buttonsFirtPage() {
    this.emitChanges(1);
    this.page = 1;
  }

  private buttonsLastPage() {
    this.emitChanges(Math.ceil(this.totalItems / this.pageSize));
    this.page = Math.ceil(this.totalItems / this.pageSize);
  }

  private callEnabled() {
    let hasPreviousPage: boolean;
    let hasButonCenter: boolean;
    let hasNextPage: boolean;

    if (this.disabled || this.totalItems <= 0 || this.totalItems <= this.pageSize) {
      hasPreviousPage = !false;
      hasButonCenter = !false;
      hasNextPage = !false;
    }else {
      hasButonCenter = !true;

      if (this.page >= 2) {
        hasPreviousPage = !true;
      } else {
        hasPreviousPage = !false;
      }

      if (this.page < (this.totalItems / this.pageSize)) {
        hasNextPage = !true;
      } else {
        hasNextPage = !false;
      }
    }

    return {
      hasPreviousPage,
      hasButonCenter,
      hasNextPage
    }
  }

  private async presentPopover(ev: any) {

    const tPagerPopover = await popoverController.create({
      component: 't-pager-popover',
      componentProps: { messages: this.messages },
      event: ev,
      translucent: false
    });

    await tPagerPopover.present();
    let result = await tPagerPopover.onDidDismiss();

    if (!result || !result.data || !result.data.button)
      return;

    let button: PagerButton = result.data.button;

    if (button == 'first-page') {
      this.buttonsFirtPage();
    }else {
      this.buttonsLastPage();
    }
  }

  private formatString() {
    return this.getStart() + " - " + this.getEnd() + " de " + this.totalItems;
  }

  render() {
    let buttonsState = this.callEnabled();
    return [

      <div>
        <ion-button disabled={buttonsState.hasPreviousPage} fill="clear"
          onClick={() => this.buttonsPreviousPage()}>
          {this.messages.previousPage}
        </ion-button>

        <ion-button disabled={buttonsState.hasButonCenter} fill="clear"
          onClick={(ev) => this.presentPopover(ev)}>
          {this.formatString()}
        </ion-button>

        <ion-button disabled={buttonsState.hasNextPage} fill="clear"
          onClick={() => this.buttonsNextPage()}>
          {this.messages.nextPage}
        </ion-button>

      </div>

    ]
  }
}
