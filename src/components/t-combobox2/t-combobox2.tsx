import { Component, h, Prop, State, Element, Watch, Event, EventEmitter } from '@stencil/core';
import { IComboboxOption } from '../../interface';
import { debounceAsync } from '../../utils/helpers';
import { ICombobox, IComboboxMessages, ComboboxDefaultOptions } from '../t-combobox/t-combobox-interface';

@Component({
  tag: 't-combobox2',
  styleUrl: 't-combobox2.scss'
})
export class Combobox2 implements ICombobox {

  @Prop() placeholder: string;

  @Prop() name: string;

  @Prop() autofocus: boolean;

  @Prop() disabled: boolean;

  @Prop() required: boolean;

  multiple: boolean;

  @Prop() value: string | string[];

  @Prop() options: IComboboxOption[];

  @Event({ cancelable: false }) change: EventEmitter;

  @Prop() messages: IComboboxMessages = ComboboxDefaultOptions.messages;

  @Prop() debounce: number = ComboboxDefaultOptions.searchDebounce;

  @Element() host: HTMLElement;

  private popover: HTMLTComboboxList2Element = null;

  private visibleOptions: IComboboxOption[] = [];

  get isSearching() {
    return this.visibleOptions && this.options != this.visibleOptions;
  }

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
      this.search(this.inputText);
      this.syncPopover();
    }
    else {
      this.updateText();
    }
  }

  @Watch('value')
  valueChanged() {
    this.updateText();
  }

  private setValue(value: string | string[]) {
    this.value = value;
    this.change.emit();
    this.visibleOptions = null;
  }

  private updateText() {
    let item = this.options.find(o => o.value == this.value);

    if (item)
      this.inputText = item.text;
    else
      this.inputText = '';
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

  private async openPopover() {
    if (this.isPopoverOpened)
      return;

    this.isPopoverOpened = true;

    try {
      if (!this.visibleOptions)
        this.visibleOptions = this.options;

      let target = this.host;

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
      popover.options = this.visibleOptions;
      popover.messages = this.messages;
      popover.onselect = () => {
        this.closePopover();

        this.setValue(popover.value);

        this.updateText();
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

  private async search(term: string) {
    this.inputText = term.trim();

    if (!this.inputText)
      this.visibleOptions = this.options;
    else
      this.visibleOptions = this.options.filter(p => p.text.indexOf(this.inputText) >= 0);

    if (this.isPopoverOpened)
      await this.syncPopover();
    else
      await this.openPopover();
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

    this.openPopover();
  }

  private handleInputBlur = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    this.closePopover();

    let inputText = e.target.value;

    if (!inputText)
      this.setValue('');
    else if (this.options && this.options.length) {
      let same = this.options.find(f => f.text == inputText);

      if (same.text == inputText && same.value != this.value)
        this.setValue(same.value);
    }

    this.updateText();

    this.visibleOptions = null;
  }

  private handleInputChange = async (e: any) => {
    let { value } = e.target;

    if (!value || !value.trim() || this.inputText == value.trim())
      return;

    if (!this.isPopoverOpened)
      this.search(value);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        if (this.isPopoverOpened)
          this.popover && this.popover.focusNext();
        else
          this.openPopover();
        break;

      case 'ArrowUp':
        this.popover && this.popover.focusPrevious();
        break;

      case 'Enter':
        this.popover && this.popover.selectFocused();
        break;

      case 'Escape':
        this.popover && this.closePopover();
        break;
    }
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
        value={this.inputText}
        placeholder={this.placeholder}></ion-input>
    ];
  }
}
