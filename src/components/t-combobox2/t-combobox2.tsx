import { Component, h, Prop, State, Element, Watch, Event, EventEmitter, Host } from '@stencil/core';
import { IComboboxOption } from '../../interface';
import { debounceAsync } from '../../utils/helpers';
import { ICombobox, IComboboxMessages, ComboboxDefaultOptions } from '../t-combobox/t-combobox-interface';
import { HTMLStencilElement } from '@stencil/core/internal';

function distinct(values: any[]): any[] {
  let result = [];
  let hasDuplicateItems = false;

  for (let value of values) {
    if (!result.includes(value))
      result.push(value);
    else
      hasDuplicateItems = true;
  }

  return hasDuplicateItems ? result : values;
}

function asArray(values: any): any[] {
  if (values === null || values === undefined)
    return [];

  if (Array.isArray(values))
    return values;

  return [values];
}

function normalizeComboboxValue(values: string | string[], multiple: boolean) {
  if (multiple) {
    if (values === null || values === undefined)
      return [];

    if (Array.isArray(values))
      return distinct(values);

    return [values];
  }
  else {
    if (values === undefined)
      return null;

    return values;
  }
}

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

  @Prop() multiple: boolean;

  @Prop({ mutable: true }) value: string | string[];

  @Prop() options: IComboboxOption[];

  @Event({ cancelable: false }) tpChange: EventEmitter;

  @Prop() messages: IComboboxMessages = ComboboxDefaultOptions.messages;

  @Prop() debounce: number = ComboboxDefaultOptions.searchDebounce;

  @Element() host: HTMLStencilElement;

  @State() inputText: string;

  private hasFocus : boolean=false;

  private popover: HTMLTComboboxList2Element = null;

  private visibleOptions: IComboboxOption[] = [];

  private isPopoverOpened: boolean = false;

  private searching: boolean = false;

  componentWillLoad() {
    this.visibleOptions = this.options;

    this.syncPopover = debounceAsync(this.syncPopover.bind(this));
  }

  componentDidLoad(){
    this.searchDebounced= debounceAsync(this.searchDebounced.bind(this));
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
    let normalized = normalizeComboboxValue(this.value, this.multiple);

    if (this.value !== normalized)
      this.value = normalized;

    if (!this.isPopoverOpened)
      this.updateText();
  }

  private select(value: string | string[]) {
    if (this.multiple) {
      if (value === null || value === undefined)
        throw new Error('Value must be defined');

      let newValue = this.value ? [...this.value] : [];
      let hasChanges = false;

      if (Array.isArray(value)) {
        for (let item of value)
          if (!newValue.includes(item)) {
            newValue.push(item);
            hasChanges = true;
          }
      }
      else if (!newValue.includes(value)) {
        newValue.push(value);
        hasChanges = true;
      }

      if (hasChanges)
        this.setValue(newValue);

      this.clearSearch();
    }
    else {
      if (value === null || value === undefined)
        this.setValue(null);
      else
        this.setValue(value);
    }
  }

  private setValue(value: string | string[]) {
    if (value === undefined)
      this.value = null;
    else
      this.value = value;

    this.tpChange.emit();
  }

  private updateText() {
    if (this.multiple) {
      this.inputText = '';

      return;
    }

    let item = this.options && this.value && this.options.find(o => o.value == this.value);

    if (item)
      this.inputText = item.text;
    else
      this.inputText = '';
  }

  private getOffset(el: HTMLElement) {
    var _x = 0;
    var _y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop) && el.tagName.toUpperCase() != 'ION-CONTENT') {
      _x += el.offsetLeft;
      _y += el.offsetTop;
      el = el.offsetParent as HTMLElement;
    }
    return { top: _y, left: _x };
  }

  private async openPopover() {
    if (this.isPopoverOpened)
      return;

    this.isPopoverOpened = true;

    try {
      if (!this.searching)
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
        if (!this.multiple){
          this.closePopover();
          this.clearSearch();
        }

        this.select(popover.value);

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

  private async clearSearch() {
    this.searching = false;
    this.visibleOptions = this.options;

    if (this.isPopoverOpened)
      await this.syncPopover();
  }

  private async search(term: string) {
    this.inputText = term.trim();

    if (this.options) {
      if (!this.inputText)
        this.visibleOptions = this.options;
      else
        this.visibleOptions = this.options.filter(p => p.text.indexOf(this.inputText) >= 0);
    }
    else
      this.visibleOptions = [];

    if (this.isPopoverOpened)
      await this.syncPopover();
    else
      await this.openPopover();

    this.searching = true;
  }

  private searchDebounced(term:string) {
    return this.search(term);
  }

  private async syncPopover() {
    if (!this.popover)
      return;

    if (this.popover.options != this.visibleOptions)
      this.popover.options = this.visibleOptions;
  }

  private handleInputFocus = (e: any) => {
    e.stopPropagation();
    e.stopImmediatePropagation();

    this.hasFocus=true;

    this.openPopover();
  }

  private getOptionByText(text: string) {
    if (!text)
      return null;

    return this.options.find(f => f.text == text);
  }

  private handleInputBlur = (e) => {
    e.stopPropagation();
    e.stopImmediatePropagation();

    this.hasFocus=false;

    let inputText = e.target.value;

    if (this.multiple) {
      if (inputText && this.options && this.options.length) {
        let same = this.getOptionByText(inputText);

        if (same)
          this.select(same.value);
      }
    }
    else {
      if (!inputText) {
        this.select(null);
      }
      else if (this.options && this.options.length) {
        let same = this.getOptionByText(inputText);

        if (same) {
          if (same.value != this.value)
            this.select(same.value);
        }
        else {
          this.select(null);
        }
      }
    }
    
    this.closePopover();

    this.clearSearch();

    this.updateText();
  }

  private handleInputChange = async (e: any) => {
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (!this.hasFocus){
      this.updateText();
      return;
    }

    if (!this.isPopoverOpened)
      return;

    let { value } = e.target;

    if (value && this.inputText == value.trim())
      return;

    this.searchDebounced(value);
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

      case 'Backspace':
        !this.inputText && this.removeLastValue();
        break;
    }
  }

  private removeLastValue() {
    if (this.value !== null && this.value !== undefined) {
      let newValue = asArray(this.value);

      newValue.pop();

      this.setValue([...newValue]);
    }
  }

  private getSelectedOptions() {
    if (!this.options)
      return [];

    let values = asArray(this.value);

    return this.options.filter(o => values.includes(o.value.toString()));
  }

  renderMultiple() {
    let selectedOptions = this.getSelectedOptions();

    let chips = selectedOptions.map(item =>
      <div class="t-chip">
        <div class="t-chip-text">
          {item.text}
        </div>
        <ion-icon name="close"></ion-icon>
      </div>
    );

    return (
      <Host class={{ 't-multiple': this.multiple }}>
        {chips}
        <ion-input
          type="text"
          name={this.name}
          autofocus={this.autofocus}
          disabled={this.disabled}
          onIonFocus={this.handleInputFocus}
          onClick={this.handleInputFocus}
          onIonBlur={this.handleInputBlur}
          onIonChange={this.handleInputChange}
          onKeyDown={this.handleKeyDown}
          clearInput={false}
          value={this.inputText}
          placeholder={this.placeholder}></ion-input>
      </Host>
    );
  }

  renderSingle() {
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

  render() {
    if (this.multiple)
      return this.renderMultiple();

    return this.renderSingle();
  }
}
