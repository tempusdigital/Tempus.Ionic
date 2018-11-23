import { Component, Prop, Event, EventEmitter, Watch, Method } from '@stencil/core';
import Choices from 'choices.js';
import { IComboboxOption, ICombobox, ComboboxDefaultOptions, isEmpty, normalizeValue } from '../t-combobox/t-combobox-interface';
import { deferEvent, debounce } from '../../utils/helpers';

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

  /**
   * Trigger change event when value has changed
   */
  @Event({ cancelable: false }) change: EventEmitter;

  @Event() ionStyle!: EventEmitter;

  choices: Choices;

  nativeSelect: HTMLSelectElement;

  choicesContainer: HTMLElement;

  _initializedLayout: boolean = false;

  async componentWillLoad() {
    this.change = deferEvent(this.change);
    this.emitStyle = debounce(this.emitStyle.bind(this));
  }

  async componentDidLoad() {
    // Initialize ChoicesJs
    this.choices = new Choices(this.nativeSelect, {
      loadingText: ComboboxDefaultOptions.loadingText,
      noResultsText: ComboboxDefaultOptions.noResultsText,
      noChoicesText: ComboboxDefaultOptions.noChoicesText,
      itemSelectText: '',
      placeholder: !!this.placeholder,
      placeholderValue: this.placeholder,
      removeItemButton: true,
      duplicateItems: false,
      silent: true
    });

    this.optionsChanged();
    this.valueChanged();
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

    let itemNative = host.querySelector('.item-native') as HTMLDivElement;
    itemNative.style.overflow = 'visible';

    let itemInner = host.querySelector('.item-inner') as HTMLDivElement;
    itemInner.style.overflow = 'visible';

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
    return !isEmpty(this.value);
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

    if (isEmpty(this.value) || !this.options || !this.options.length) {
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

  syncChoicesOptions() {
    if (!this.choices)
      return;

    if (!this.options || !this.options.length) {
      this.choices.clearStore();
      return;
    }

    // Keep previous selection, bacause to update the options list is necessary to remove all options and add them again
    let currentValue = this.getChoicesValue();
    let currentValueIsEmpty = isEmpty(currentValue);
    let currentValueIsArray = Array.isArray(currentValue);

    let isSelected = (value) => {
      if (currentValueIsEmpty)
        return false;

      if (currentValueIsArray)
        return currentValue.includes(value);

      return value === currentValue;
    };

    let optionsWithPlaceholder = this.options.map(option => {
      let normalizedValue = normalizeValue(option.value);

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
        selected: isEmpty(this.value)
      };

      optionsWithPlaceholder = [placeholder, ...optionsWithPlaceholder];
    }

    this.choices.clearStore(); // Clear options manually because cleaning by setChoices is not working

    this.choices.setChoices(optionsWithPlaceholder, 'value', 'label', true);
  }

  emitStyle() {
    this.ionStyle.emit({
      'interactive': true,
      'interactive-disabled': this.disabled,
      'input': true,
      'has-value': this.hasValue() || this.isPlaceholderSelected(),
      'has-focus': this.hasFocus(),
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
