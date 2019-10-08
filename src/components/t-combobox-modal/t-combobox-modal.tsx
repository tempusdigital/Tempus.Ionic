import { Component, Prop, Event, EventEmitter, State, Element, Watch, h } from '@stencil/core';
import { ICombobox, IComboboxOption, IComboboxMessages, ComboboxDefaultOptions } from '../t-combobox/t-combobox-interface';
import { deferEvent, debounce, normalizeValue, isEmptyValue } from '../../utils/helpers';


@Component({
  tag: 't-combobox-modal',
  styleUrl: 't-combobox-modal.scss'
})
export class TComboboxModal implements ICombobox {

  /**
   * Set the input's placeholder when no option is selected.
   */
  @Prop() placeholder: string;

  /**
   * Native select name attribute
   */
  @Prop() name: string;

  /**
   * Set the focus on component is loaded.
   */
  @Prop() autofocus: boolean = false;

  /**
   * If `true`, the user cannot interact with the input. Defaults to `false`.
   */
  @Prop() disabled: boolean = false;

  /**
   * If `true`, the user cannot interact with the input. Defaults to `false`.
   */
  @Prop({ reflectToAttr: true }) readonly: boolean = false;

  /**
   * If `true`, the user must fill in a value before submitting a form.
   */
  @Prop() required: boolean = false;

  /**
   * If `true`, the user can enter more than one value. This attribute applies when the type attribute is set to `"email"` or `"file"`, otherwise it is ignored.
   */
  @Prop() multiple: boolean = false;

  /**
   * The value of the input.
   */
  @Prop({ mutable: true }) value: string | string[] = '';

  /**
   * The visible options to select.
   */
  @Prop({ mutable: true }) options: IComboboxOption[] = [];

  private _internalMessages: IComboboxMessages;

  private presentingModal: boolean = false;

  /**
  * The messages that will be shown
  */
  @Prop() messages: IComboboxMessages;

  /**
   * Trigger change event when value has changed
   */
  @Event({ cancelable: false }) change: EventEmitter;

  @Event() ionStyle!: EventEmitter;

  /**
   * Text to display with the selected options.
   */
  @State() text = '';

  @Prop({ connect: 'ion-modal-controller' }) modalController: any;

  @Element() host: HTMLElement;

  async componentWillLoad() {
    this.change = deferEvent(this.change);
    this.emitStyle = debounce(this.emitStyle.bind(this));

    this.valueChanged();
    this.optionsChanged();
    this.disabledChanged();
    this.emitStyle();
  }

  componentDidLoad() {
    this.messagesChanged();
    this.host.addEventListener('click', e => this.handleClick(e));
  }

  @Watch('messages')
  messagesChanged() {
    if (this.messages)
      this._internalMessages = { ...ComboboxDefaultOptions.messages, ...this.messages };
    else
      this._internalMessages = { ...ComboboxDefaultOptions.messages };
  }

  async presentModal() {
    if (this.presentingModal) // Prevened open the modal more then one time while it is still loading
      return;

    try {
      this.presentingModal = true;

      await this.modalController.componentOnReady();

      const modalElement = await this.modalController.create({
        component: 't-combobox-modal-list',
        componentProps: {
          multiple: this.multiple,
          value: this.value,
          handleChange: this.handleChange.bind(this),
          options: this.options,
          messages: this._internalMessages
        }
      });

      await modalElement.present();

      await modalElement.didDismiss;
    }
    finally {
      this.presentingModal = false;
    }
  }

  @Watch('options')
  optionsChanged() {
    let normalizedOptions = normalizeOptions(this.options);

    if (this.options !== normalizedOptions) {
      this.options = normalizedOptions;
      return;
    }

    this.updateText();
  }

  @Watch('value')
  valueChanged() {
    let normalizedValue = normalizeValue(this.value);

    if (this.value !== normalizedValue) {
      this.value = normalizedValue;
      return;
    }

    this.updateText();
  }

  updateText() {
    if (!this.options) {
      this.text = '';
      return;
    }

    if (Array.isArray(this.value)) {
      let options = this.options.filter(option => this.value.includes(option.value));
      this.text = options.map(option => option.text).join(', ');
    }
    else {
      let option = this.options.find(option => this.value === option.value);
      this.text = option && option.text || '';
    }

    this.emitStyle();
  }

  handleChange(selectedOptions: IComboboxOption[]) {
    if (!selectedOptions || !selectedOptions.length) {
      this.value = '';
    }
    else {
      if (this.multiple)
        this.value = selectedOptions.map(v => v.value);
      else
        this.value = selectedOptions[0].value;
    }

    if (!this.options) {
      this.options = selectedOptions;
    }
    else {
      selectedOptions.forEach((selectedOption: IComboboxOption) => {
        let hasOption = this.options.some(options => options.value === selectedOption.value);
        if (!hasOption)
          this.options = [selectedOption, ...this.options];
      });
    }

    this.updateText();

    this.change.emit();

    this.emitStyle();
  }

  handleClick(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (!this.disabled && !this.readonly)
      this.presentModal();
  }

  hasFocus() {
    return this.host === document.activeElement;
  }

  hasValue() {
    return !isEmptyValue(this.value);
  }

  isPlaceholderSelected() {
    return !this.text && !!this.placeholder;
  }

  emitStyle() {
    this.ionStyle.emit({
      'interactive': true,
      'interactive-disabled': this.disabled,
      'input': false, // Reset ion-input class if t-combobox changes the internal component
      'select': true,
      'has-value': this.hasValue() || this.isPlaceholderSelected(),
      'has-focus': false, // Reset ion-input class if t-combobox changes the internal component
      't-combobox-modal': true,
      't-combobox-choices': false // Reset ion-input class if t-combobox changes the internal component
    });
  }

  @Watch('disabled')
  disabledChanged() {
    if (this.disabled)
      this.host.classList.add('t-disabled');
    else
      this.host.classList.remove('t-disabled');

    this.emitStyle();
  }

  isSelected(option: IComboboxOption) {
    if (option.value === this.value)
      return true;

    if (Array.isArray(this.value))
      return this.value.includes(option.value);

    return false;
  }

  clear(e: Event) {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();

    this.value = '';

    this.change.emit();

    this.updateText();
    this.emitStyle();
  }

  render() {
    return [
      <div class="t-text">
        {this.text ? this.text : <span class="t-placeholder">{this.placeholder}</span>}
        &nbsp;
        {
          !this.readonly && !this.required &&
          <ion-button
            class="t-clear"
            type="button"
            hidden={!this.text || this.disabled || this.readonly}
            size="small"
            fill="clear"
            color="medium"
            onClick={this.clear.bind(this)}>
            <ion-icon name="close"></ion-icon>
          </ion-button>
        }
      </div>,

      <select
        hidden
        name={this.name}
        required={this.required}
        multiple={this.multiple}
        disabled={this.disabled}>
        {this.options && this.options.map(option =>
          <option value={option.value} selected={this.isSelected(option)}>{option.text}</option>)}
      </select>,

      // Fix bundle of modal components on Stencil 1.0.0-beta.16
      (window['Force bundle']) ?
        <div>
          <t-combobox-modal-list></t-combobox-modal-list>
          <ion-searchbar></ion-searchbar>
          <ion-buttons></ion-buttons>
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
    ];
  }
}

function normalizeOptions(value: any): IComboboxOption[] {
  if (!value || !Array.isArray(value))
    return value;

  let needToNormalize = value.some(o => typeof o.value !== 'string');
  if (!needToNormalize)
    return value;

  return value.map(v => {
    return {
      ...v,
      value: normalizeValue(v.value)
    }
  });
}