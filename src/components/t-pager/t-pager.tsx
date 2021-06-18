import { Component, Prop, h, Event, EventEmitter } from '@stencil/core';
import { popoverController } from '@ionic/core';
import { PageChanged, PagerButton, PagerDefaultMessages, PagerMessages } from './interfaces';

@Component({
  tag: 't-pager'
})
export class tPager {
  @Prop() disabled: boolean = false;

  @Prop({ mutable: true }) page: number = 1;

  @Prop() pageSize: number = 20;

  @Prop() totalItems: number = 500;

  @Prop() messages: PagerMessages;

  @Event() pageChanged: EventEmitter<PageChanged>;

  private getMessages() {
    if (!this.messages)
      return PagerDefaultMessages;

    return { ...PagerDefaultMessages, ...this.messages };
  }

  private get start():number {
    return ((this.pageSize * this.page - 1) - this.pageSize) + 2;
  }

  private get end():number {
    if (this.pageSize * this.page <= this.totalItems) {
      return this.pageSize * this.page;
    } else {
      return this.totalItems;
    }
  }

  private emitChanges(pageToPass: number) {
    let buttons = this.callEnabled();

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
    } else {
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

  private async presentPopover(ev: any, messages: PagerMessages) {
    const tPagerPopover = await popoverController.create({
      component: 't-pager-popover',
      componentProps: { messages: messages },
      event: ev,
      translucent: false,
      showBackdrop: false
    });

    await tPagerPopover.present();
    let result = await tPagerPopover.onDidDismiss();

    if (!result || !result.data || !result.data.button)
      return;

    let button: PagerButton = result.data.button;

    if (button == 'first-page') {
      this.buttonsFirtPage();
    } else {
      this.buttonsLastPage();
    }
  }

  private formatString(messages: PagerMessages) {
    return messages.currentPage({
      start: this.start,
      end: this.end,
      page: this.page,
      pageSize: this.pageSize,
      totalItems: this.totalItems
    });
  }

  render() {
    let buttonsState = this.callEnabled();

    const messages = this.getMessages();

    return [

      <div>
        <ion-button disabled={buttonsState.hasPreviousPage} fill="clear"
          onClick={() => this.buttonsPreviousPage()}>
          {messages.previousPage}
        </ion-button>

        <ion-button disabled={buttonsState.hasButonCenter} fill="clear"
          onClick={(ev) => this.presentPopover(ev, messages)}>
          {this.formatString(messages)}
        </ion-button>

        <ion-button disabled={buttonsState.hasNextPage} fill="clear"
          onClick={() => this.buttonsNextPage()}>
          {messages.nextPage}
        </ion-button>

      </div>

    ]
  }
}
