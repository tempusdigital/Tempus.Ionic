import { Component, h, Prop, State, Element, Watch } from '@stencil/core';
import { IComboboxOption } from '../../interface';
import { debounceAsync } from '../../utils/helpers';
import { ICombobox, IComboboxMessages, ComboboxDefaultOptions } from '../t-combobox/t-combobox-interface';
import { EventEmitter } from 'events';

@Component({
  tag: 't-combobox2',
  styleUrl: 't-combobox2.scss'
})
export class Combobox2 implements ICombobox {

  placeholder: string;

  @Prop() name: string;

  @Prop() autofocus: boolean;

  @Prop() disabled: boolean;

  @Prop() required: boolean;

  multiple: boolean;

  value: string | string[];

  @Prop() options: IComboboxOption[];

  change: EventEmitter;

  @Prop() messages: IComboboxMessages = ComboboxDefaultOptions.messages;

  debounce: number = ComboboxDefaultOptions.searchDebounce;

  @Element() host: HTMLElement;

  private popover: HTMLTComboboxList2Element = null;

  private visibleOptions: IComboboxOption[] = [];

  private isPopoverOpened: boolean = false;

  @State() inputText: string;

  componentWillLoad() {
    this.visibleOptions = this.options;

    this.syncPopover = debounceAsync(this.syncPopover.bind(this));
  }

  componentDidUnload() {
    this.closePopover();
  }

  @Watch('options')
  optionsChanged() {
    if (this.isPopoverOpened) {
      this.search();
      this.syncPopover();
    }
  }

  private getOffset(el: HTMLElement) {
    var _x = 0;
    var _y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      _x += el.offsetLeft - el.scrollLeft;
      _y += el.offsetTop - el.scrollTop;
      el = el.offsetParent as HTMLElement;
    }
    return { top: _y, left: _x };
  }

  private async openPopover(e: UIEvent) {
    if (this.isPopoverOpened)
      return;

    this.isPopoverOpened = true;

    try {
      this.visibleOptions = this.options;

      let target = e.target as HTMLElement;

      let offset = this.getOffset(target);

      let top = offset.top + target.offsetHeight;
      let left = offset.left;
      let width = target.offsetWidth;

      let popover = document.createElement('t-combobox-list2');

      popover.style.top = `${top}px`;
      popover.style.left = `${left}px`;
      popover.style.width = `${width}px`;

      popover.classList.add('t-combobox-popover');

      popover.value = this.value;
      popover.options = this.options;
      popover.messages = this.messages;
      popover.onselect = () => {        
        this.value = popover.value;

        this.closePopover();

        let item = this.options.find(o => o.value == this.value);

        if (item)
          this.inputText = item.text;
        else {
          this.inputText = '';
          this.value = null;
        }
      };

      let container = this.getContainer();

      container.appendChild(popover);
      this.popover = popover;

      await popover.componentOnReady();
    }
    catch (err) {
      this.closePopover();

      throw err;
    }
  }

  private getContainer() {
    let content = this.host.closest('ion-content');
    if (content)
      return content;

    return document.querySelector('ion-app');
  }

  private closePopover() {
    try {
      if (this.popover) {
        this.popover.remove();
        this.popover = null;
      }
    }
    finally {
      this.isPopoverOpened = false;
    }
  }

  private async search() {
    if (!this.inputText)
      this.visibleOptions = this.options;
    else
      this.visibleOptions = this.options.filter(p => p.text.indexOf(this.inputText) >= 0);

    await this.syncPopover();
  }

  private async syncPopover() {
    if (!this.popover)
      return;

    if (this.popover.options != this.visibleOptions)
      this.popover.options = this.visibleOptions;
  }

  private handleInputFocus = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    this.openPopover(e);
  }

  private handleInputBlur = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    this.closePopover();
  }

  private handleInputChange = (e: any) => {
    this.inputText = e.target.value && e.target.value.trim();

    this.search();
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key == 'ArrowDown')
      this.popover && this.popover.focusNext();
    else if (e.key == 'ArrowUp')
      this.popover && this.popover.focusPrevious();
  }

  render() {
    return [
      <ion-input
        type="text"
        name={this.name}
        autofocus={this.autofocus}
        disabled={this.disabled}
        required={this.required}
        onIonFocus={this.handleInputFocus}
        onClick={this.handleInputFocus}
        onIonBlur={this.handleInputBlur}
        onIonChange={this.handleInputChange}
        onKeyDown={this.handleKeyDown}
        debounce={this.debounce}
        clearInput={true}
        value={this.inputText}></ion-input>
    ];
  }
}
