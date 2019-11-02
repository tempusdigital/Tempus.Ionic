import { Component, h, Prop, State, Element, writeTask, readTask } from '@stencil/core';
import { popoverController } from '@ionic/core';
import { IComboboxOption } from '../../interface';
import { debounceAsync } from '../../utils/helpers';

@Component({
  tag: 't-combobox2',
  styleUrl: 't-combobox2.scss'
})
export class Combobox2 {

  @Prop() debounce: number = 300;

  @Element() host: HTMLElement;

  private popover: HTMLIonPopoverElement = null;

  private options: IComboboxOption[] = [];

  private visibleOptions: IComboboxOption[] = [];

  private isPopoverOpened: boolean = false;

  @State() inputText: string;

  componentWillLoad() {
    this.options = this.items();
    this.visibleOptions = this.options;

    this.syncPopover = debounceAsync(this.syncPopover.bind(this));
  }

  componentDidUnload() {
    this.clearPopoverVariables();
  }

  items() {
    let r: IComboboxOption[] = [];

    for (let i = 0; i < 1000; i++)
      r.push({ value: i.toString(), text: `Item ${i}` });

    return r;
  }

  private async getComboboxList(): Promise<HTMLTComboboxList2Element> {
    if (!this.popover)
      return null;

    await this.popover.componentOnReady();

    let comboboxList = this.popover.querySelector('t-combobox-list2');

    if (!comboboxList)
      return;

    await comboboxList.componentOnReady();

    return comboboxList;
  }

  private async openPopover(e: Event) {
    if (this.isPopoverOpened)
      return;

    this.isPopoverOpened = true;

    try {
      this.visibleOptions = this.options;

      let popover = document.createElement('ion-popover');

      popover.event = e;
      popover.component = 't-combobox-list2';
      popover.componentProps = {
        options: this.options,
        messages: {
          noResultsText: 'Nenhum item encontrado'
        }
      };
      popover.cssClass = 't-combobox-popover';
      popover.showBackdrop = false;
      popover.backdropDismiss = false;
      popover.keyboardClose = false;
      
      let container = this.getContainer();
      
      container.appendChild(popover);

      await popover.componentOnReady();

      await popover.present();

      this.popover = popover;

      await popover.onDidDismiss();
    }
    finally {
      this.clearPopoverVariables();
    }
  }

  getContainer(){
    let content = this.host.closest('ion-content');
    if (content)
      return content;

    return document.querySelector('ion-app');
  }

  private clearPopoverVariables() {
    if (this.popover && this.isPopoverOpened)
      this.popover.dismiss();

    this.isPopoverOpened = false;
    this.popover = null;
  }

  private async closePopover() {
    if (!this.popover)
      return;

    await this.popover.dismiss();
  }

  private async search(term: string) {
    if (!term)
      this.visibleOptions = this.options;
    else
      this.visibleOptions = this.options.filter(p => p.text.indexOf(term) >= 0);

    await this.syncPopover();
  }

  private async syncPopover() {
    if (!this.popover)
      return;

    let comboboxList = await this.getComboboxList();

    if (!comboboxList)
      return;

    if (comboboxList.options != this.visibleOptions)
      comboboxList.options = this.visibleOptions;

      writeTask(()=> {
        let comboboxListHeight = comboboxList.offsetHeight;
        this.popover.style.setProperty('--max-height', `${comboboxListHeight}px`);
      });
  }

  private handleInputFocus = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    this.openPopover(e);
  }

  private handleInputBlur = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    //this.closePopover();
  }

  private handleInputChange = (e: any) => {
    this.inputText = e.target.value && e.target.value.trim();

    this.search(this.inputText);
  }

  render() {
    return [
      <ion-input
        onIonFocus={this.handleInputFocus}
        onClick={this.handleInputFocus}
        onIonBlur={this.handleInputBlur}
        onIonChange={this.handleInputChange}
        debounce={this.debounce}
        clearInput={true}
        value={this.inputText}></ion-input>
    ];
  }
}
