import { Component, h, Prop, State, Element, Watch, Event, EventEmitter, Host } from '@stencil/core';
import { IComboboxOption } from '../../interface';
import { debounceAsync, normalizeValue, isEmptyValue, removeAccents } from '../../utils/helpers';
import { ICombobox, IComboboxMessages, ComboboxDefaultOptions } from '../t-combobox/t-combobox-interface';
import { HTMLStencilElement } from '@stencil/core/internal';
/*
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
*/
function asArray(values: any): any[] {
  if (values === null || values === undefined)
    return [];

  if (Array.isArray(values))
    return values;

  return [values];
}

function stopPropagation(e: Event) {
  e.stopImmediatePropagation();
  e.stopPropagation();
}

interface NormalizedOption {
  text: string;
  value: string;
  searchToken: string;
}

let ignoredSearchTokens = [
  'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das', 'para', 'em', 'com', 'como',
  'por', 'no', 'na', 'nos', 'nas', 'pelo', 'pela', 'pelos', 'pelas', 'ao', 'aos', 'd', 'sem'
];

function generateSearchToken(text: string) {
  if (!text)
    return '';

  return removeAccents(text.toString().toLowerCase())
    .split(/[\,\;\:\+\(\)\'\´\`\" ]/)
    .filter(s => !!s && !ignoredSearchTokens.includes(s))
    .map(s => s
      .replace(/[\W]+/, '') // removes special caracters
      .replace(/(ns)$|(oes)$|(eis)$|(is)$|(ies)$|(es)$|(s)$/, '')) //removes plural for pt-BR and en-US
    .join(' ');
}

function normalizeOptions(options: IComboboxOption[]): NormalizedOption[] {
  if (!options)
    return null;

  return options.filter(o => !!o).map(o => {
    return {
      value: normalizeValue(o.value) as string,
      text: o.text,
      searchToken: generateSearchToken(o.text)
    }
  })
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

  @Prop() readonly: boolean;

  @Prop() required: boolean;

  @Prop() multiple: boolean;

  @Prop({ mutable: true }) value: string | string[];

  @Prop() options: IComboboxOption[];

  @Event({ cancelable: false }) change: EventEmitter;

  @Event() ionStyle: EventEmitter;

  @Prop() messages: IComboboxMessages = ComboboxDefaultOptions.messages;

  @Prop() debounce: number = ComboboxDefaultOptions.searchDebounce;

  @Element() host: HTMLStencilElement;

  @State() inputText: string;

  private normalizedOptions: NormalizedOption[];

  private hasFocus: boolean = false;

  private popover: HTMLTComboboxList2Element = null;

  private visibleOptions: NormalizedOption[] = [];

  private isPopoverOpened: boolean = false;

  private searching: boolean = false;

  componentWillLoad() {
    this.syncPopover = debounceAsync(this.syncPopover.bind(this));

    this.valueChanged();
    this.optionsChanged();
  }

  componentDidLoad() {
    this.searchDebounced = debounceAsync(this.searchDebounced.bind(this));
  }

  componentDidUnload() {
    this.closePopover();
  }

  @Watch('options')
  optionsChanged() {
    this.normalizedOptions = normalizeOptions(this.options);

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
    let normalized = normalizeValue(this.value);

    if (this.value !== normalized)
      this.value = normalized;

    if (!this.isPopoverOpened)
      this.updateText();

    this.emitStyle();
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
      if (isEmptyValue(value))
        this.setValue(null);
      else
        this.setValue(value);
    }
  }

  private deselect(value?: string | string[]) {
    if (this.multiple) {
      if (isEmptyValue(value))
        return;

      let newValue = asArray(this.value);

      if (Array.isArray(value))
        newValue = newValue.filter(v => !value.includes(v));
      else
        newValue = newValue.filter(v => v != value);

      this.setValue(newValue);
    } else {
      this.setValue(null);
    }
  }

  private setValue(value: string | string[]) {
    this.value = normalizeValue(value);

    this.change.emit();
  }

  private updateText() {
    if (this.multiple) {
      this.inputText = '';

      return;
    }

    let item = this.normalizedOptions && this.value && this.normalizedOptions.find(o => o.value == this.value);

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
    if (this.isPopoverOpened || this.disabled || this.readonly)
      return;

    this.isPopoverOpened = true;

    try {
      if (!this.searching)
        this.visibleOptions = this.normalizedOptions;

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
        if (!this.multiple) {
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
    this.visibleOptions = this.normalizedOptions;

    if (this.isPopoverOpened)
      await this.syncPopover();
  }

  private async search(term: string) {
    this.inputText = term.trim();

    if (this.normalizedOptions) {
      if (!this.inputText)
        this.visibleOptions = this.normalizedOptions;
      else {
        let searchToken = generateSearchToken(this.inputText);

        this.visibleOptions = this.normalizedOptions.filter(p => p.searchToken.indexOf(searchToken) >= 0);
      }
    }
    else
      this.visibleOptions = [];

    if (this.isPopoverOpened)
      await this.syncPopover();
    else
      await this.openPopover();

    this.searching = true;
  }

  private searchDebounced(term: string) {
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

    this.hasFocus = true;

    this.openPopover();
  }

  private getOptionByText(text: string) {
    if (!text)
      return null;

    let searchToken = generateSearchToken(text);

    return this.normalizedOptions.find(f => f.searchToken == searchToken);
  }

  private emitStyle() {
    this.ionStyle.emit({
      'has-value': !isEmptyValue(this.value)
    });
  }

  private handleInputBlur = (e) => {
    e.stopPropagation();
    e.stopImmediatePropagation();

    this.hasFocus = false;

    let inputText = e.target.value;

    if (this.multiple) {
      if (inputText && this.normalizedOptions && this.normalizedOptions.length) {
        let same = this.getOptionByText(inputText);

        if (same)
          this.select(same.value);
      }
    }
    else {
      if (!inputText) {
        this.select(null);
      }
      else if (this.normalizedOptions && this.normalizedOptions.length) {
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

    if (!this.hasFocus) {
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

  private handleChipRemoveClick = (e: Event) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();

    let target = e.target as HTMLElement;
    let chip = target.closest('.t-chip') as HTMLElement;

    let value = chip.dataset.value;

    this.deselect(value);
  }

  private removeLastValue() {
    if (this.value !== null && this.value !== undefined) {
      let newValue = asArray(this.value);

      newValue.pop();

      this.setValue([...newValue]);
    }
  }

  private getSelectedOptions() {
    if (!this.normalizedOptions)
      return [];

    let values = asArray(this.value);

    return this.normalizedOptions.filter(o => values.includes(o.value));
  }

  private handleIonStyle = (e) => {
    e.detail['has-value'] = !isEmptyValue(this.value);
  }

  renderChips() {
    if (!this.multiple)
      return null;

    let selectedOptions = this.getSelectedOptions();

    return selectedOptions.map(item =>
      <div class="t-chip" key={item.value} data-value={item.value}>
        <div class="t-chip-text">
          {item.text}
        </div>
        {
          !this.disabled && !this.readonly &&
          <div class="t-chip-remove" onClick={this.handleChipRemoveClick}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M405 136.798L375.202 107 256 226.202 136.798 107 107 136.798 226.202 256 107 375.202 136.798 405 256 285.798 375.202 405 405 375.202 285.798 256z"></path></svg>
          </div>
        }
      </div>
    );
  }

  render() {
    let chips = this.renderChips();
    let value = Array.isArray(this.value) ? this.value.join(',') : this.value;

    return (
      <Host class={{ 't-multiple': this.multiple }}>
        {chips}
        {
          <ion-input
            type="text"
            autocomplete="off"
            autocorrect="off"
            spellcheck={false}
            autofocus={this.autofocus}
            disabled={this.disabled}
            readonly={this.readonly}
            onIonFocus={this.handleInputFocus}
            onClick={this.handleInputFocus}
            onIonBlur={this.handleInputBlur}
            onIonChange={this.handleInputChange}
            onIonStyle={this.handleIonStyle}
            onKeyDown={this.handleKeyDown}
            onChange={stopPropagation}
            onInput={stopPropagation}
            clearInput={false}
            value={this.inputText}
            placeholder={this.placeholder}></ion-input>
        }
        <input
          type="hidden"
          required={this.required}
          name={this.name}
          onChange={stopPropagation}
          onInput={stopPropagation}
          value={value} />
      </Host>
    );
  }
}
