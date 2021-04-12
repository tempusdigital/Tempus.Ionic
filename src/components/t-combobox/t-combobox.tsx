import { Component, h, Prop, State, Element, Watch, Event, EventEmitter, Host } from '@stencil/core';
import { IComboboxOption } from '../../interface';
import { debounceAsync, normalizeValue, isEmptyValue, stopPropagation, normalizeOptions, asArray, generateSearchToken } from '../../utils/helpers';
import { IComboboxMessages, ComboboxDefaultOptions, NormalizedOption } from '../t-combobox/t-combobox-interface';
import { HTMLStencilElement } from '@stencil/core/internal';

@Component({
  tag: 't-combobox',
  styleUrl: 't-combobox.scss'
})
export class TCombobox {

  @Prop() placeholder: string;

  @Prop() name: string;

  @Prop() autofocus: boolean;

  @Prop() disabled: boolean;

  @Prop() readonly: boolean;

  @Prop() required: boolean;

  @Prop() multiple: boolean;

  @Prop({ mutable: true }) value: string | string[];

  @Prop({ mutable: true }) options: IComboboxOption[];

  @Prop() optionValue: string;

  @Prop() optionText: string;

  @Prop() optionDetail: string;

  @Prop() messages: IComboboxMessages = ComboboxDefaultOptions.messages;

  @Prop() debounce: number = ComboboxDefaultOptions.searchDebounce;

  @Prop() addTokens: string;

  @Prop() allowAdd: boolean = false;

  @Event({ cancelable: false }) change: EventEmitter;

  @Event({ cancelable: true }) search: EventEmitter;

  @Event() ionStyle: EventEmitter;

  @Element() private host: HTMLStencilElement;

  private searchText: string;

  private _internalMessages: IComboboxMessages;

  private normalizedOptions: NormalizedOption[];

  private hasFocus: boolean = false;

  private popover: HTMLTComboboxListElement = null;

  private visibleOptions: NormalizedOption[] = [];

  private get isPopoverOpened() {
    return !!this.popover;
  }

  @State() private searching: boolean = false;

  private customSearching: boolean = false;

  componentWillLoad() {
    this.value = normalizeValue(this.value, this.multiple);

    this.optionsChanged();
    this.messagesChanged();

    this.emitStyle();
  }

  componentDidLoad() {
    this.searchDebounced = debounceAsync(this.searchDebounced.bind(this), this.debounce);
    this.syncPopover = debounceAsync(this.syncPopover.bind(this));
    this.updateVisibleOptions = debounceAsync(this.updateVisibleOptions.bind(this));
  }

  disconnectedCallback() {
    this.closePopover();
  }

  @Watch('options')
  optionsChanged() {
    this.normalizedOptions = normalizeOptions(this.options, this.optionValue, this.optionText, this.optionDetail);

    this.updateVisibleOptions();
  }

  @Watch('value')
  valueChanged(newValue, oldValue) {
    const normalized = normalizeValue(this.value, this.multiple);

    if (this.value !== normalized) {
      this.value = normalized;
      return;
    }

    if (newValue === oldValue)
      return;

    this.change.emit();

    this.updateVisibleOptions();

    this.emitStyle();
  }

  @Watch('multiple')
  multipleChanged() {
    this.value = normalizeValue(this.value, this.multiple);
  }

  @Watch('messages')
  messagesChanged() {
    if (this.messages)
      this._internalMessages = { ...ComboboxDefaultOptions.messages, ...this.messages };
    else
      this._internalMessages = { ...ComboboxDefaultOptions.messages };
  }

  private addAndSelect(inputText: string) {
    inputText = inputText?.trim();

    if (!inputText)
      return;

    if (!this.getOptionByText(inputText))
      this.options = [...this.options, { text: inputText, value: inputText }];

    this.select(inputText);
  }

  private select(value: string | string[]) {
    if (this.multiple) {
      if (isEmptyValue(value))
        return;

      value = normalizeValue(value, this.multiple);

      let newValue = [...asArray(this.value)];
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
    }
    else
      this.setValue(value);
  }

  private deselect(value?: string | string[]) {
    if (this.multiple) {
      if (isEmptyValue(value))
        return;

      value = normalizeValue(value, this.multiple);

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
    this.value = normalizeValue(value, this.multiple);
  }

  private getText() {
    if (this.searching)
      return this.searchText;

    if (this.multiple)
      return '';

    const item = !isEmptyValue(this.value) && this.normalizedOptions?.find(o => o.value == this.value);
    if (item)
      return item.text;

    return '';
  }

  private getContainer() {
    const content = this.host.closest('ion-content');
    if (content)
      return content;

    const modal = this.host.closest('ion-modal');
    if (modal)
      return modal;

    return document.querySelector('ion-app');
  }

  private async openPopover() {
    if (this.isPopoverOpened || this.disabled || this.readonly)
      return;

    try {
      const popover = document.createElement('t-combobox-list');
      this.popover = popover;

      this.updateVisibleOptions();

      this.syncPopover();

      popover.target = this.host;
      popover.onselect = () => {
        this.select(popover.value);

        if (!this.multiple) {
          this.closePopover();
          this.clearSearch();
        }
        else 
          this.syncPopover();
      };

      const container = this.getContainer();

      container.appendChild(popover);
    }
    catch (err) {
      this.closePopover();

      throw err;
    }
  }


  private closePopover() {
    if (this.popover) {
      this.popover.remove();
      this.popover = null;
    }
  }

  private async clearSearch() {
    this.searching = false;
    this.customSearching = false;

    this.searchText = '';

    this.updateVisibleOptions();
  }

  private async executeSearch() {
    this.customSearching = !this.search.emit({ term: this.searchText });

    this.updateVisibleOptions();
  }

  private async updateVisibleOptions() {
    if (!this.isPopoverOpened)
      return;

    const { normalizedOptions, searchText } = this;

    if (normalizedOptions) {
      let visibleOptions = normalizedOptions;

      if (this.searching && !this.customSearching && searchText?.trim()) {
        const searchToken = generateSearchToken(searchText);

        visibleOptions = normalizedOptions.filter(p =>
          p.textSearchToken.indexOf(searchToken) >= 0 || p.detailTextSearchToken.indexOf(searchToken) >= 0);
      }

      if (this.multiple) {
        const selectedValues = asArray(this.value);
        visibleOptions = visibleOptions.filter(p => !selectedValues.includes(p.value))
      }

      this.visibleOptions = visibleOptions;
    }
    else
      this.visibleOptions = [];

    this.syncPopover();
  }

  private async searchDebounced() {
    if (!this.hasFocus || !this.searching)
      return;

    await this.executeSearch();

    if (!this.isPopoverOpened)
      this.openPopover();
  }

  private async syncPopover() {
    if (!this.popover)
      return;

    const popover = this.popover;

    if (popover.value != this.value)
      popover.value = this.value;

    if (popover.messages != this._internalMessages)
      popover.messages = this._internalMessages;

    if (popover.options != this.visibleOptions)
      popover.options = this.visibleOptions;

    popover.updatePosition();
  }

  private handleInputFocus = (e: any) => {
    e.stopPropagation();
    e.stopImmediatePropagation();

    this.hasFocus = true;

    if (this.options?.length || this.searching)
      this.openPopover();
  }

  private getOptionByText(text: string) {
    if (!text?.trim() || !this.normalizedOptions?.length)
      return null;

    const searchToken = generateSearchToken(text);

    return this.normalizedOptions.find(f => f.textSearchToken == searchToken);
  }

  private emitStyle() {
    const style = {
      'has-value': !isEmptyValue(this.value)
    };

    requestAnimationFrame(() => {
      this.ionStyle.emit(style);
    })
  }

  private removeLastValue() {
    const selected = this.getSelectedOptions();

    if (selected.length == 0)
      return;

    const last = selected[selected.length - 1];

    const newValue = asArray(this.value).filter(v => v !== last.value);

    this.setValue(newValue);
  }

  private handleInputBlur = (e) => {
    e.stopPropagation();
    e.stopImmediatePropagation();

    this.hasFocus = false;

    const inputText = e.target.value;

    const option = this.getOptionByText(inputText);

    if (option)
      this.select(option.value);
    else
      this.select(null);

    this.closePopover();

    this.clearSearch();

    this.emitStyle();
  }

  private handleInputChange = async (e: any) => {
    e.stopPropagation();
    e.stopImmediatePropagation();

    const { value } = e.target;

    if (this.getText() === value)
      return;

    this.searchText = value;
    this.searching = true;

    this.searchDebounced();
  }

  private handleKeyDown = async (e: KeyboardEvent) => {
    if (this.disabled || this.readonly)
      return;

    const target = e.target as HTMLInputElement;
    const searchText = target.value;

    function preventDefault() {
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();
    }

    switch (e.key) {
      case 'ArrowDown':
        preventDefault();
        if (this.isPopoverOpened)
          this.popover && this.popover.focusNext();
        else
          this.openPopover();
        break;

      case 'ArrowUp':
        preventDefault();
        this.popover && this.popover.focusPrevious();
        break;

      case 'Enter':
        if (this.popover) {
          const hasFocusedOption = await this.popover.hasFocusedOption();

          if (hasFocusedOption) {
            preventDefault();
            this.popover.selectFocused();
          }
          else if (searchText?.trim() && this.allowAdd) {
            preventDefault();
            this.addAndSelect(searchText);
            this.clearSearch();
          }
        }
        break;

      case 'Escape':
        preventDefault();
        this.popover && this.closePopover();
        break;

      case 'Backspace':
        !searchText && this.removeLastValue();
        break;

      default:
        if (searchText?.trim()
          && this.allowAdd
          && this.addTokens
          && this.addTokens.includes(e.key)) {
          preventDefault();
          this.addAndSelect(searchText);
          this.clearSearch();
        }
        break;
    }
  }

  private handleChipRemoveClick = (e: Event) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();

    const target = e.target as HTMLElement;
    const chip = target.closest('.t-chip') as HTMLElement;

    const value = chip.dataset.value;

    this.deselect(value);
  }

  private getSelectedOptions() {
    if (!this.normalizedOptions)
      return [];

    const values = asArray(this.value);

    return this.normalizedOptions.filter(o => values.includes(o.value));
  }

  private renderChips() {
    if (!this.multiple)
      return null;

    const selectedOptions = this.getSelectedOptions();

    return selectedOptions.map(item =>
      <div class="t-chip" key={item.value} data-value={item.value}>
        <div class="t-chip-text">
          {item.text}
        </div>
        {
          !this.disabled && !this.readonly &&
          <div class="t-chip-remove t-icon" onClick={this.handleChipRemoveClick}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M405 136.798L375.202 107 256 226.202 136.798 107 107 136.798 226.202 256 107 375.202 136.798 405 256 285.798 375.202 405 405 375.202 285.798 256z"></path></svg>
          </div>
        }
      </div>
    );
  }

  render() {
    const chips = this.renderChips();
    const value = Array.isArray(this.value) ? this.value.join(',') : this.value;
    const text = this.getText();

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
            onIonInput={this.handleInputChange}
            onKeyDown={this.handleKeyDown}
            onChange={stopPropagation}
            onInput={stopPropagation}
            clearInput={false}
            clearOnEdit={false}
            value={text}
            placeholder={this.placeholder}></ion-input>
        }
        <input
          type="search"
          class="t-combobox-choices-inner-input"
          autocomplete="off"
          required={this.required}
          name={this.name}
          onChange={stopPropagation}
          onInput={stopPropagation}
          value={value} />
      </Host>
    );
  }
}
