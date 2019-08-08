import { Component, Prop, Event, EventEmitter, Watch, Method, h } from '@stencil/core';
import Choices from 'choices.js';
import { IComboboxOption, ICombobox, ComboboxDefaultOptions, IComboboxMessages } from '../t-combobox/t-combobox-interface';
import { deferEvent, debounce, isEmptyValue, normalizeValue } from '../../utils/helpers';

@Component({
  tag: 't-combobox-choices',
  styleUrl: 't-combobox-choices.scss'
})
export class TComboboxChoices implements ICombobox {
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

  /**
  * The messages that will be shown
  */
  @Prop() messages: IComboboxMessages;

  /**
   * Trigger change event when value has changed
   */
  @Event({ cancelable: false }) change: EventEmitter;

  @Event() ionStyle!: EventEmitter;

  @Watch('messages')
  messagesChanged() {
    if (this.messages)
      this._internalMessages = { ...ComboboxDefaultOptions.messages, ...this.messages };
    else
      this._internalMessages = { ...ComboboxDefaultOptions.messages };
  }

  choices: Choices;

  nativeSelect: HTMLSelectElement;

  choicesContainer: HTMLElement;

  _initializedLayout: boolean = false;

  async componentWillLoad() {
    this.change = deferEvent(this.change);
    this.emitStyle = debounce(this.emitStyle.bind(this));
  }

  async componentDidLoad() {
    this.messagesChanged();

    let startOptions = this.options;

    let choices = this.mapOptionsAsChoices();
    let items = choices.filter(c => c.selected);

    // Initialize ChoicesJs
    this.choices = new Choices(this.nativeSelect, {
      loadingText: this._internalMessages.loadingText,
      noResultsText: this._internalMessages.noResultsText,
      noChoicesText: this._internalMessages.noResultsText,
      itemSelectText: '',
      placeholder: !!this.placeholder,
      placeholderValue: this.placeholder,
      removeItemButton: true,
      duplicateItems: false,
      silent: true,
      choices: choices,
      items: items
    });

    // The options may be changed while the ChoicesJs was still being initialized
    if (startOptions !== this.options)
      this.syncChoicesOptions();

    this.valueChanged(); // The value may be changed while the ChoicesJs was still being initialized
    this.disabledChanged();

    this.choicesContainer = (this.choices as any).containerOuter;
    this.choicesContainer.addEventListener('change', e => this.handleChange(e as any));
    this.choicesContainer.addEventListener('focus', () => this.emitStyle());
    this.choicesContainer.addEventListener('blur', () => this.emitStyle());
    this.choicesContainer.addEventListener('showDropdown', () => {
      this.initializeLayout();
      this.emitStyle();
    });
    this.choicesContainer.addEventListener('hideDropdown', () => this.emitStyle());

    if (this.autofocus) {
      this.choicesContainer.focus();
    }
  }

  componentDidUnload() {
    if (this.choices)
      this.choices.destroy();
  }

  /** Return ChoicesJs instance */
  @Method()
  getChoicesInstance(): Promise<any> {
    return Promise.resolve(this.choices);
  }

  /** Add styles to make ChoicesJs visible inside a ion-item */
  initializeLayout() {
    if (this._initializedLayout)
      return;

    let item = this.choicesContainer.closest('ion-item');

    if (!item)
      return;

    this._initializedLayout = true;

    let host = item.shadowRoot || item;

    let itemWrapper = host.querySelector('.input-wrapper') as HTMLDivElement;
    itemWrapper.style.overflow = 'visible';
  }

  getChoicesValue() {
    if (!this.choices)
      return this.value;

    let objValue = this.choices.getValue() as any;

    if (!objValue || objValue.placeholder)
      return '';

    if (Array.isArray(objValue))
      return objValue.map(o => o.value);

    return objValue.value;
  }

  hasFocus() {
    return this.choicesContainer === document.activeElement || this.isOpen();
  }

  isOpen() {
    return this.choicesContainer && this.choicesContainer.classList.contains('is-open');
  }

  isPlaceholderSelected() {
    if (!this.choices)
      return false;

    let value = this.choices.getValue() as any;

    return value && value.placeholder || this.placeholder && value === this.placeholder;
  }

  hasValue() {
    return !isEmptyValue(this.value);
  }

  @Watch('disabled')
  disabledChanged() {
    if (this.choices) {
      if (this.disabled)
        this.choices.disable();
      else
        this.choices.enable();
    }

    this.emitStyle();
  }

  @Watch('options')
  optionsChanged() {
    if ((!this.options || !this.options.length) && this.value !== '')
      this.value = '';

    this.syncChoicesOptions();

    this.emitStyle();
  }

  @Watch('value')
  valueChanged() {
    let normalizedValue = normalizeValue(this.value);

    if (this.value !== normalizedValue) {
      this.value = normalizedValue;
      return;
    }

    this.syncChoicesValue();

    this.emitStyle();
  }

  /** Update ChoicesJs value to the match this.value */
  syncChoicesValue() {
    if (!this.choices)
      return;

    let currentValue = this.getChoicesValue();

    if (this.value === currentValue)
      return;

    if (isEmptyValue(this.value) || !this.options || !this.options.length) {
      if (!this.multiple && this.placeholder)
        this.choices.setValueByChoice(this.placeholder);
      else
        this.choices.removeActiveItems();

      return;
    }

    if (Array.isArray(this.value) && Array.isArray(currentValue) && this.value.length === currentValue.length) {
      let equal = !this.value.some(v => !currentValue.includes(v));

      if (equal)
        return;
    }

    this.choices.removeActiveItems(); // Without this command,  when multiple is enabled and options are removed from the selection the ChoicesJs does not deselect the options
    this.choices.setValueByChoice(this.value);
  }

  mapOptionsAsChoices() {
    let currentValue = normalizeValue(this.value); // normalize the value because valueChanged may not be called yet
    let currentValueIsEmpty = isEmptyValue(currentValue);
    let currentValueIsArray = Array.isArray(currentValue);

    let isSelected = (value) => {
      if (currentValueIsEmpty)
        return false;

      if (currentValueIsArray)
        return currentValue.includes(value);

      return value === currentValue;
    };

    let result = (this.options || []).map(option => {
      let normalizedValue = normalizeValue(option.value); // normalize the value because optionsChanged may not be called yet

      return {
        placeholder: false,
        value: normalizedValue,
        label: option.text,
        selected: isSelected(normalizedValue)
      };
    });

    if (this.placeholder && !this.multiple) {
      // Add placeholder as one of ChoicesJs options
      let placeholder = {
        placeholder: true,
        value: this.placeholder,
        label: this.placeholder,
        selected: isEmptyValue(this.value)
      };

      result = [placeholder, ...result];
    }

    return result;
  }

  syncChoicesOptions() {
    if (!this.choices)
      return;

    let choices = this.mapOptionsAsChoices();

    this.choices.clearStore(); // Clear options manually because cleaning by setChoices is not working

    this.choices.setChoices(choices, 'value', 'label', false);
  }

  emitStyle() {
    this.ionStyle.emit({
      'interactive': true,
      'interactive-disabled': this.disabled,
      'input': true,
      'select': false, // Reset ion-input class if t-combobox changes the internal component
      'has-value': this.hasValue() || this.isPlaceholderSelected(),
      'has-focus': this.hasFocus(),
      't-combobox-modal': false, // Reset ion-input class if t-combobox changes the internal component
      't-combobox-choices': true
    });
  }

  handleChange(e: UIEvent) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    let newValue = this.getChoicesValue();
    if (this.value !== newValue) {
      this.value = newValue;
      this.change.emit();
      this.emitStyle();
    }
  }

  render() {
    return (
      <select
        ref={e => this.nativeSelect = e as any}
        name={this.name}
        required={this.required}
        multiple={this.multiple}
        disabled={this.disabled}>

      </select>
    );
  }
}
