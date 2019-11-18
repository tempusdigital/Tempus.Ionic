import { Component, h, Prop, State, Element, Watch, Event, EventEmitter, Host } from '@stencil/core';
import { IComboboxOption } from '../../interface';
import { debounceAsync, normalizeValue, isEmptyValue, isCore, generateSearchToken, asArray } from '../../utils/helpers';
import { ICombobox, IComboboxMessages, ComboboxDefaultOptions, NormalizedOption } from '../t-combobox/t-combobox-interface';
import { HTMLStencilElement } from '@stencil/core/internal';


function stopPropagation(e: Event) {
  e.stopImmediatePropagation();
  e.stopPropagation();
}


function normalizeOptions(options: IComboboxOption[]): NormalizedOption[] {
  if (!options)
    return null;

  return options.filter(o => !!o).map(o => {
    return {
      value: normalizeValue(o.value) as string,
      text: o.text,
      textSearchToken: generateSearchToken(o.text),
      detailTextSearchToken: generateSearchToken(o.detailText),
      detailText: o.detailText
    }
  })
}

@Component({
  tag: 't-combobox-choices',
  styleUrl: 't-combobox-choices.scss'
})
export class TComboboxChoices implements ICombobox {

  @Prop() placeholder: string;

  @Prop() name: string;

  @Prop() autofocus: boolean;

  @Prop() disabled: boolean;

  @Prop() readonly: boolean;

  @Prop() required: boolean;

  @Prop() multiple: boolean;

  @Prop({ mutable: true }) value: string | string[];

  @Prop() options: IComboboxOption[];

  @Prop() messages: IComboboxMessages;

  @Prop() debounce: number = ComboboxDefaultOptions.searchDebounce;

  @Prop() addTokens: string;

  @Prop() allowAdd: boolean = false;

  @Event({ cancelable: false }) change: EventEmitter;

  @Event() ionStyle: EventEmitter;

  @Element() host: HTMLStencilElement;

  @State() inputText: string;

  private searchText: string = '';

  @Prop({ connect: 'ion-modal-controller' }) modalController: any;

  @Prop() interface: 'popover' | 'modal' = null;

  private normalizedOptions: NormalizedOption[];

  private hasFocus: boolean = false;

  private popover: HTMLTComboboxListElement = null;

  private modal: HTMLTComboboxModalListElement = null;

  @State() private visibleOptions: NormalizedOption[] = [];

  private isInterfaceOpened: boolean = false;

  private searching: boolean = false;

  private initialized = false;

  private _internalMessages: IComboboxMessages;

  private get usePopover(): boolean {
    return !this.useModal;
  }

  private get useModal(): boolean {
    return this.interface === 'modal' || !this.interface && !isCore(window);
  }

  componentWillLoad() {
    try {
      this.normalizedOptions = normalizeOptions(this.options);
      this.value = normalizeValue(this.value);

      this.updateVisibleOptions();
      this.updateText();
      this.messagesChanged();

      this.emitStyle();
    }
    finally {
      this.initialized = true;
    }
  }

  componentDidLoad() {
    this.searchDebounced = debounceAsync(this.searchDebounced.bind(this), this.debounce);

    // Improve performance by preventing consecutives unnecessary updates of the visible options list
    this.syncInterface = debounceAsync(this.syncInterface.bind(this));
    this.updateVisibleOptions = debounceAsync(this.updateVisibleOptions.bind(this));
  }

  componentDidUnload() {
    this.closeInterface();
  }

  @Watch('options')
  optionsChanged() {
    if (!this.initialized)
      return;

    this.normalizedOptions = normalizeOptions(this.options);

    this.updateVisibleOptions();
    this.updateText();
  }

  @Watch('value')
  valueChanged(newValue, oldValue) {
    if (!this.initialized)
      return;

    let normalized = normalizeValue(this.value);

    if (this.value !== normalized) {
      this.value = normalized;
      return;
    }

    if (newValue === oldValue)
      return;

    this.change.emit();

    this.updateVisibleOptions();
    this.updateText();

    this.emitStyle();
  }

  @Watch('visibleOptions')
  visibleOptionsChanged() {
    this.syncInterface();
  }

  @Watch('messages')
  messagesChanged() {
    if (this.messages)
      this._internalMessages = { ...ComboboxDefaultOptions.messages, ...this.messages };
    else
      this._internalMessages = { ...ComboboxDefaultOptions.messages };
  }

  private addAndSelect(inputText: string) {
    this.options = [...this.options, { text: inputText, value: inputText }];
    this.select(inputText);
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
  }

  private updateText() {
    if (this.searching) {
      if (this.usePopover)
        this.inputText = this.searchText;
        
      return;
    }

    if (this.useModal) {
      let selectedOptions = this.getSelectedOptions();

      this.inputText = selectedOptions.map(option => option.text).join(', ');
      return;
    }

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

  private async openInterface() {
    if (this.isInterfaceOpened || this.disabled || this.readonly)
      return;

    this.isInterfaceOpened = true;

    try {
      if (this.usePopover) {
        this.updateVisibleOptions();

        let popover = document.createElement('t-combobox-list');

        popover.onselect = () => {
          if (!this.multiple) {
            this.closeInterface();
            this.clearSearch();
          }

          this.select(popover.value);

          this.syncInterface();
        };

        let container = this.getContainer();

        this.popover = popover;

        this.syncInterface();

        container.appendChild(popover);

        await popover.componentOnReady();
      }
      else {
        await this.updateVisibleOptions();

        await this.modalController.componentOnReady();

        const modalElement = await this.modalController.create({
          component: 't-combobox-modal-list',
          componentProps: {
            multiple: this.multiple,
            value: this.value,
            options: this.visibleOptions,
            messages: this._internalMessages,
            onselect: (e) => {
              this.setValue(e.target.value);

              this.syncInterface();

              this.closeInterface();
            },
            onsearch: (e) => {
              this.search(e.detail.searchText);
            }
          }
        });

        modalElement.onDidDismiss().then(() => {
          this.closeInterface();
        });

        await modalElement.present();

        let modal = modalElement.querySelector('t-combobox-modal-list');

        await modal.componentOnReady();

        this.modal = modal;

        this.syncInterface();
      }
    }
    catch (err) {
      this.closeInterface();

      throw err;
    }
  }

  private getContainer() {
    let content = this.host.closest('ion-content');
    if (content)
      return content;

    return document.querySelector('ion-app');
  }

  private closeInterface() {
    try {
      if (this.popover) {
        this.popover.remove();
        this.popover = null;
      }

      if (this.modal) {
        this.modal.close();
        this.modal = null;
        this.clearSearch();
      }
    }
    finally {
      this.isInterfaceOpened = false;
    }
  }

  private async clearSearch() {
    this.searching = false;

    this.searchText = '';

    this.updateText();

    this.updateVisibleOptions();
  }

  private async search(term: string) {
    let searching = term && !!term.toString().trim();

    this.searching = searching;

    if (term !== null && term !== undefined)
      this.searchText = term;
    else
      this.searchText = '';

    this.updateVisibleOptions();
    this.updateText();
  }

  private async updateVisibleOptions() {
    if (!this.isInterfaceOpened)
      return;

    let { normalizedOptions, searchText } = this;

    if (normalizedOptions) {
      let visibleOptions: NormalizedOption[];

      if (!this.searching)
        visibleOptions = normalizedOptions;
      else {
        let searchToken = generateSearchToken(searchText);

        visibleOptions = normalizedOptions.filter(p =>
          p.textSearchToken.indexOf(searchToken) >= 0 || p.detailTextSearchToken.indexOf(searchToken) >= 0);
      }

      if (this.usePopover) {
        let selectedValues = asArray(this.value);

        visibleOptions = visibleOptions.filter(p => !selectedValues.includes(p.value));
      }

      this.visibleOptions = visibleOptions;
    }
    else
      this.visibleOptions = [];
  }

  private searchDebounced(term: string) {
    if (!this.hasFocus)
      return;

    return this.search(term);
  }

  private async syncInterface() {
    if (this.popover) {
      let target = this.host;

      let offset = this.getOffset(target);

      let top = offset.top + target.offsetHeight;
      let left = offset.left;
      let width = target.offsetWidth;

      let insideIonItem = target.closest('ion-item');

      if (insideIonItem)
        top += 4;

      let popover = this.popover;

      popover.style.top = `${top}px`;
      popover.style.left = `${left}px`;
      popover.style.width = `${width}px`;

      popover.classList.add('t-combobox-popover');

      if (popover.value != this.value)
        popover.value = this.value;

      if (popover.messages != this._internalMessages)
        popover.messages = this._internalMessages;

      if (popover.options != this.visibleOptions)
        popover.options = this.visibleOptions;
    }

    if (this.modal) {
      let modal = this.modal;

      if (modal.multiple != this.multiple)
        modal.multiple = this.multiple;

      if (modal.value != this.value)
        modal.value = this.value;

      if (modal.messages != this._internalMessages)
        modal.messages = this._internalMessages;

      if (modal.options != this.visibleOptions)
        modal.options = this.visibleOptions;
    }
  }

  private handleInputFocus = (e: any) => {
    e.stopPropagation();
    e.stopImmediatePropagation();

    this.hasFocus = true;

    if (this.useModal)
      e.preventDefault();

    this.openInterface();
  }

  private getOptionByText(text: string) {
    if (!text)
      return null;

    let searchToken = generateSearchToken(text);

    return this.normalizedOptions.find(f => f.textSearchToken == searchToken);
  }

  private emitStyle() {
    let style = {
      'has-value': !isEmptyValue(this.value)
    };

    requestAnimationFrame(() => {
      this.ionStyle.emit(style);
    })
  }

  private removeLastValue() {
    if (this.value !== null && this.value !== undefined) {
      let selected = this.getSelectedOptions();

      if (selected.length == 0)
        return;

      let last = selected[selected.length - 1];

      let newValue: string[] = asArray(this.value);

      newValue = newValue.filter(v => v !== last.value);

      this.setValue([...newValue]);
    }
  }

  private handleInputBlur = (e) => {
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (this.useModal)
      return;

    this.hasFocus = false;

    let inputText = e.target.value;

    if (this.multiple) {
      if (inputText && this.normalizedOptions && this.normalizedOptions.length) {
        let same = this.getOptionByText(inputText);

        if (same)
          this.select(same.value);
        else if (this.allowAdd)
          this.addAndSelect(inputText);
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

    this.closeInterface();

    this.clearSearch();

    this.updateText();

    this.emitStyle();
  }

  private handleInputChange = async (e: any) => {
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (!this.hasFocus) {
      this.updateText();
      return;
    }

    if (this.useModal)
      return;

    let { value } = e.target;

    if (this.searchText !== value)
      this.searchText = value;

    if (!this.isInterfaceOpened)
      return;

    this.searchDebounced(value);
  }

  private handleKeyDown = async (e: KeyboardEvent) => {
    if (this.disabled || this.readonly || !this.usePopover)
      return;

    let target = e.target as HTMLInputElement;
    let inputText = target.value;

    let preventDefault = false;

    switch (e.key) {
      case 'ArrowDown':
        if (this.isInterfaceOpened)
          this.popover && this.popover.focusNext();
        else
          this.openInterface();
        break;

      case 'ArrowUp':
        this.popover && this.popover.focusPrevious();
        break;

      case 'Enter':
        if (this.popover) {
          let hasFocusedOption = await this.popover.hasFocusedOption();

          if (hasFocusedOption) {
            this.popover.selectFocused();
            preventDefault = true;
          }
          else if (inputText && inputText.trim() && this.allowAdd) {
            this.addAndSelect(inputText);
            this.clearSearch();
            preventDefault = true;
          }
        }
        break;

      case 'Escape':
        this.popover && this.closeInterface();

        preventDefault = true;
        break;

      case 'Backspace':
        !inputText && this.removeLastValue();
        break;

      default:
        if (inputText && inputText.trim() && this.allowAdd && this.addTokens && this.addTokens.includes(e.key)) {
          this.addAndSelect(inputText);
          this.clearSearch();
          this.inputText = '';

          preventDefault = true;
        }
        break;
    }

    if (preventDefault) {
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();
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

  private getSelectedOptions() {
    if (!this.normalizedOptions)
      return [];

    let values = asArray(this.value);

    return this.normalizedOptions.filter(o => values.includes(o.value));
  }

  private handleIonStyle = (e) => {
    e.detail['has-value'] = !isEmptyValue(this.value);
  }

  private handleClearClick = (e: Event) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();

    this.setValue(null);
  }

  renderChips() {
    if (this.useModal || !this.multiple)
      return null;

    let selectedOptions = this.getSelectedOptions();

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
            readonly={this.readonly || this.useModal}
            onIonFocus={this.handleInputFocus}
            onClick={this.handleInputFocus}
            onIonBlur={this.handleInputBlur}
            onIonChange={this.handleInputChange}
            onIonStyle={this.handleIonStyle}
            onKeyDown={this.handleKeyDown}
            onChange={stopPropagation}
            onInput={stopPropagation}
            clearInput={false}
            clearOnEdit={false}
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
        {
          this.useModal && !this.readonly && !this.disabled && !this.required &&
          <ion-button
            class="t-clear"
            type="button"
            hidden={isEmptyValue(this.value)}
            size="small"
            fill="clear"
            color="medium"
            onClick={this.handleClearClick}>
            <ion-icon name="close"></ion-icon>
          </ion-button>
        }
      </Host>
    );
  }
}
