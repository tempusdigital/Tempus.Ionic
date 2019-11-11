import { Component, Prop, Event, EventEmitter, h } from '@stencil/core';
import { ICombobox, IComboboxOption, ComboboxDefaultOptions, IComboboxMessages } from './t-combobox-interface'
import { isCore } from '../../utils/helpers';

@Component({
  tag: 't-combobox',
  styleUrl: 't-combobox.scss'
})
export class TCombobox implements ICombobox {

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
  @Prop() readonly: boolean = false;

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
  @Prop() options: IComboboxOption[];

  /**
  * The messages that will be shown
  */
  @Prop() messages: IComboboxMessages;

  /**
   * Trigger change event when value has changed
   */
  @Event({ cancelable: false }) change: EventEmitter;

  private isCore: boolean;

  componentWillLoad() {
    this.isCore = isCore(window);
  }

  handleChange(e: UIEvent) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    this.value = (e.target as any).value;

    this.change.emit();
  }

  render() {
    if (this.isCore)
      return this.renderCore();
    else
      return this.renderMobile();
  }

  renderCore() {
    return [
      <t-combobox-choices
        name={this.name}
        autofocus={this.autofocus}
        disabled={this.disabled}
        readonly={this.readonly}
        required={this.required}
        value={this.value}
        multiple={this.multiple}
        options={this.options}
        placeholder={this.placeholder}
        onChange={this.handleChange.bind(this)}
        messages={this.messages}
      ></t-combobox-choices>
    ]
  }

  renderMobile() {
    return [
      <t-combobox-modal
        name={this.name}
        autofocus={this.autofocus}
        disabled={this.disabled}
        readonly={this.readonly}
        required={this.required}
        value={this.value}
        multiple={this.multiple}
        options={this.options}
        placeholder={this.placeholder}
        onChange={this.handleChange.bind(this)}
        messages={this.messages}
      ></t-combobox-modal>
    ];
  }
}
