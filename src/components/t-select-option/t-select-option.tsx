import { Component, Event, EventEmitter, Prop, Element, Watch, Host, h } from '@stencil/core';
import { normalizeValue } from '../../utils/helpers';

@Component({
  tag: 't-select-option',
  styleUrl: 't-select-option.scss'

})
export class TSelectOption {

  @Event() selectOptionDidLoad!: EventEmitter<void>;
  @Event() selectOptionDidUpdate!: EventEmitter<void>;
  @Event() selectOptionDidUnload!: EventEmitter<void>;
  @Prop({ mutable: true }) value!: any;
  @Prop() selected = false;
  @Prop() disabled = false;
  @Prop() hidden = false;

  // On Stencil 1.0.0-beta.16 the selectOptionDidUnload is not get fired,
  // so for now use a property no notify when the option is unloaded
  @Prop() onDidUnload: () => void;

  @Element() host!: HTMLElement;

  componentWillLoad() {
    let normalizedValue = normalizeValue(this.value, false) as any;

    if (normalizedValue !== this.value)
      this.value = normalizedValue;
  }

  @Watch('value')
  valueChanged() {
    this.selectOptionDidUpdate.emit();
  }

  componentDidLoad() {
    this.selectOptionDidLoad.emit();
  }

  disconnectedCallback() {
    this.selectOptionDidUnload.emit();
    this.onDidUnload && this.onDidUnload();
  }

  render() {
    return (<Host role='option'></Host>);
  }
}
