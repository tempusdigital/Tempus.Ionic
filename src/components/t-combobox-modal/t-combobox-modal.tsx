import { Component, Prop, Event, EventEmitter, State, Element, Watch } from '@stencil/core';
import { ICombobox, IComboboxOption, ComboboxDefaultOptions, isEmpty } from '../t-combobox/t-combobox-interface';
import { deferEvent } from '../../utils/helpers';

@Component({
  tag: 't-combobox-modal',
  styleUrl: 't-combobox-modal.scss'
})
export class TComboboxModal implements ICombobox {

  /**
  * Override the default search behavior. Useful to send the search to a web server.
  */
  @Prop() search: (options?: { searchText: string; }) => IComboboxOption[] | Promise<IComboboxOption[]>;

  /**
   * Set the amount of time, in milliseconds, to wait to trigger the search after each keystroke. Default `250`.
   */
  @Prop() searchDebounce: number = ComboboxDefaultOptions.searchDebounce;

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
  @Prop({ reflectToAttr:true }) readonly: boolean = false;

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
  @Prop({ mutable: true }) value: any;

  /**
   * The visible options to select.
   */
  @Prop({ mutable: true }) options: IComboboxOption[];

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
    this.ionStyle = deferEvent(this.ionStyle);
    await this.loadInicialOptions();
  }

  componentDidLoad() {
    this.host.addEventListener('click', e => this.handleClick(e));

    this.updateText();
    this.disabledChanged();
    this.emitStyle();
  }

  async loadInicialOptions() {
    if (!this.search)
      return;

    let result = this.search({ searchText: '' });

    if ('then' in result) {
      result = await result;
    }

    this.options = result;
  }

  async presentModal() {
    await this.modalController.componentOnReady();

    const modalElement = await this.modalController.create({
      component: 't-combobox-modal-list',
      componentProps: {
        multiple: this.multiple,
        search: this.search,
        value: this.value,
        handleChange: this.handleChange.bind(this),
        options: this.options,
        searchDebounce: this.searchDebounce
      }
    });

    await modalElement.present();
  }

  @Watch('options')
  @Watch('value')
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
    else if (selectedOptions.length > 1) {
      this.value = selectedOptions.map(v => v.value);
    }
    else {
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
    return !isEmpty(this.value);
  }

  isPlaceholderSelected() {
    return !this.text && !!this.placeholder;
  }

  emitStyle() {
    this.ionStyle.emit({
      'interactive': true,
      'interactive-disabled': this.disabled,
      'select': true,
      'has-value': this.hasValue() || this.isPlaceholderSelected(),
      't-combobox-modal': true
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
      return this.value.includes(this.value);

    return false;
  }

  clear(e: Event) {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();

    this.value = '';
    this.updateText();
    this.emitStyle();
  }

  render() {
    return [
      <div class="t-text">
        {this.text ? this.text : <span class="t-placeholder">{this.placeholder}</span>}
        &nbsp;
        {
          !this.readonly &&
          <ion-button
            class="t-clear"
            type="button"
            hidden={!this.text || this.disabled}
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
      </select>];
  }
}
