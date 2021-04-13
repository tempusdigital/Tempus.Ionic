import { Component, h, Prop, State, Element, Watch, Event, EventEmitter, Host } from '@stencil/core';
import { IComboboxOption } from '../../interface';
import { normalizeValue, isEmptyValue, asArray, normalizeOptions, stopPropagation } from '../../utils/helpers';
import { ICombobox, IComboboxMessages, ComboboxDefaultOptions, NormalizedOption } from '../t-combobox/t-combobox-interface';
import { HTMLStencilElement } from '@stencil/core/internal';
import { modalController } from '@ionic/core';

@Component({
  tag: 't-combobox-modal',
  styleUrl: 't-combobox-modal.scss'
})
export class TComboboxModal implements ICombobox {

  @Prop() placeholder: string;

  @Prop() name: string;

  @Prop() autofocus: boolean;

  @Prop() disabled: boolean;

  @Prop() readonly: boolean;

  @Prop() required: boolean;

  @Prop() multiple: boolean;

  @Prop({ mutable: true }) value: any;

  @Prop() options: IComboboxOption[];

  @Prop() optionValue: string;

  @Prop() optionText: string;

  @Prop() optionDetail: string;

  @Prop() messages: IComboboxMessages;

  @Prop() debounce: number = ComboboxDefaultOptions.searchDebounce;

  @Event({ cancelable: false }) change: EventEmitter;

  @Event() ionStyle: EventEmitter;

  @Element() host: HTMLStencilElement;

  @State() inputText: string;

  private normalizedOptions: NormalizedOption[];

  private isInterfaceOpened: boolean = false;

  private _internalMessages: IComboboxMessages;

  componentWillLoad() {
    this.value = normalizeValue(this.value, this.multiple);

    this.optionsChanged();
    this.messagesChanged();

    this.emitStyle();
  }

  @Watch('options')
  optionsChanged() {
    this.normalizedOptions = normalizeOptions(this.options, this.optionValue, this.optionText, this.optionDetail);

    this.updateText();
  }

  @Watch('value')
  valueChanged(newValue, oldValue) {
    let normalized = normalizeValue(this.value, this.multiple);

    if (this.value !== normalized) {
      this.value = normalized;
      return;
    }

    if (newValue === oldValue)
      return;

    this.change.emit();

    this.updateText();

    this.emitStyle();
  }

  @Watch('messages')
  messagesChanged() {
    if (this.messages)
      this._internalMessages = { ...ComboboxDefaultOptions.messages, ...this.messages };
    else
      this._internalMessages = { ...ComboboxDefaultOptions.messages };
  }

  private setValue(value: string | string[]) {
    this.value = normalizeValue(value, this.multiple);
  }

  private updateText() {
    let selectedOptions = this.getSelectedOptions();

    this.inputText = selectedOptions.map(option => option.text).join(', ');
  }

  private async openInterface() {
    if (this.isInterfaceOpened || this.disabled || this.readonly)
      return;

    this.isInterfaceOpened = true;

    try {
      const modalElement = await modalController.create({
        component: 't-combobox-modal-list',
        componentProps: {
          multiple: this.multiple,
          value: Array.isArray(this.value) ? [...this.value] : this.value,
          options: this.normalizedOptions,
          messages: this._internalMessages,
          debounce: this.debounce,
          onselect: (e) => {
            this.setValue(e.target.value);
            this.updateText();

            this.isInterfaceOpened = false;
          }
        }
      });

      await modalElement.present();

      await modalElement.onDidDismiss();

      this.isInterfaceOpened = false;
    }
    catch (err) {
      this.isInterfaceOpened = false;

      throw err;
    }
  }

  private emitStyle() {
    let style = {
      'has-value': !isEmptyValue(this.value)
    };

    requestAnimationFrame(() => {
      this.ionStyle.emit(style);
    })
  }

  private handleKeyDown = async (e: KeyboardEvent) => {
    if (this.disabled || this.readonly)
      return;

    switch (e.key) {
      case 'ArrowDown':
      case 'Enter':
        if (!this.isInterfaceOpened)
          this.openInterface();
        break;
    }
  }

  private getSelectedOptions() {
    if (!this.normalizedOptions)
      return [];

    let values = asArray(this.value);

    return this.normalizedOptions.filter(o => values.includes(o.value));
  }

  private handleClearClick = (e: Event) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();

    this.setValue(null);
  }

  handleInputClick = (e: Event) => {
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (!this.readonly && !this.disabled && !this.isInterfaceOpened)
      this.openInterface();
  }

  render() {
    let value = Array.isArray(this.value) ? this.value.join(',') : this.value;

    return (
      <Host class={{ 't-multiple': this.multiple }}>
        {
          <ion-input
            type="text"
            autocomplete="off"
            autocorrect="off"
            spellcheck={false}
            autofocus={this.autofocus}
            disabled={this.disabled}
            readonly={true}
            onTouchStart={this.handleInputClick}
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
          !this.readonly && !this.disabled && !this.required &&
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

        {
          // Fix bundle of modal components on Stencil 1.0.0-beta.16
          (window['Force bundle']) ?
            <div>
              <t-combobox-modal-list></t-combobox-modal-list>
              <ion-searchbar></ion-searchbar>
              <ion-buttons></ion-buttons>
              <ion-input></ion-input>
              <ion-button></ion-button>
              <ion-toolbar></ion-toolbar>
              <ion-header></ion-header>
              <ion-content></ion-content>
              <ion-list></ion-list>
              <ion-virtual-scroll></ion-virtual-scroll>
              <ion-item></ion-item>
              <ion-label></ion-label>
              <ion-radio></ion-radio>
              <ion-checkbox></ion-checkbox>
              <ion-radio-group></ion-radio-group>
              <ion-icon></ion-icon>
            </div> : null
        }
      </Host>
    );
  }
}
