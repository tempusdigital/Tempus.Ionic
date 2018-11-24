import { Component, Prop, Listen, State, Event, EventEmitter, Watch, Element } from '@stencil/core';
import { deferEvent, debounceAsync } from '../../utils/helpers';

@Component({
  tag: 't-select',
  styleUrl: 't-select.scss'
})
export class TSelect {
  @Prop() name: string;
  @Prop() autofocus: boolean = false;
  @Prop() disabled: boolean = false;
  @Prop({ reflectToAttr: true }) readonly: boolean = false;
  @Prop() placeholder: string;
  @Prop() required: boolean = false;
  @Prop() hidden: boolean = false;
  @Prop() multiple: boolean = false;
  @Prop({ mutable: true }) value: any;

  @Element() host!: HTMLElement;

  @Event() ionStyle!: EventEmitter;

  nativeElement: HTMLTSelectElement;

  didInit = false;

  @State() childOpts: HTMLTSelectOptionElement[] = [];

  componentWillLoad() {
    this.ionStyle = deferEvent(this.ionStyle);
    this.loadOptions = debounceAsync(this.loadOptions.bind(this));
  }

  async componentDidLoad() {
    await this.loadOptions();

    if (this.value === undefined) {
      if (this.multiple) {
        // there are no values set at this point
        // so check to see who should be selected
        const checked = this.childOpts.filter(o => o.selected);
        this.value = checked.map(o => o.value);
      } else {
        const checked = this.childOpts.find(o => o.selected);
        if (checked) {
          this.value = checked.value;
        }
      }
    }

    this.updateOptions();
    this.emitStyle();
    this.didInit = true;
  }

  hasFocus() {
    return this.nativeElement === document.activeElement;
  }

  hasValue() {
    return (this.value !== '' && this.value !== undefined && this.value !== null);
  }

  hasPlaceholder() {
    return !!this.placeholder;
  }

  @Listen('selectOptionDidLoad')
  @Listen('selectOptionDidUnload')
  async selectOptionChanged() {
    await this.loadOptions();
    
    if (this.didInit) {
      this.updateOptions();
    }

    this.emitStyle();
  }

  private async loadOptions() {
    this.childOpts = await Promise.all(
      Array.from(this.host.querySelectorAll('t-select-option')).map(o => o.componentOnReady())
    );
  }

  private updateOptions() {
    // iterate all options, updating the selected prop
    let canSelect = true;
    for (const selectOption of this.childOpts) {
      selectOption.onDidUnload = this.loadOptions;

      const selected = canSelect && isOptionSelected(this.value, selectOption.value);
      selectOption.selected = selected;

      // if current option is selected and select is single-option, we can't select
      // any option more
      if (selected && !this.multiple) {
        canSelect = false;
      }
    }
  }

  @Watch('disabled')
  disabledChanged() {
    this.emitStyle();
  }

  @Watch('value')
  valueChanged() {
    if (this.didInit) {
      this.updateOptions();
      this.emitStyle();
    }
  }

  onFocus() {
    this.emitStyle();
  }

  onBlur() {
    this.emitStyle();
  }

  emitStyle() {
    this.ionStyle.emit({
      'interactive': true,
      'input': true,
      'has-placeholder': this.hasPlaceholder(),
      'has-value': this.hasValue(),
      'has-focus': this.hasFocus(),
      'interactive-disabled': this.disabled,
      't-select': true,
      't-select-placeholder-selected': !this.hasValue() && this.hasPlaceholder(),
    });
  }

  handleChange(e) {
    this.value = e.target.value;
    this.valueChanged();
  }

  render() {
    if (this.readonly) {
      let option = this.childOpts.find(o => o.value == this.value);
      return [
        <ion-input
          ref={e => this.nativeElement = e as any}
          readonly
          value={option && option.innerText || ''}
          onFocus={this.onFocus.bind(this)}
          onBlur={this.onBlur.bind(this)}></ion-input>,
        <input type="hidden" value={this.value} />
      ];
    }

    return [
      <select
        ref={e => this.nativeElement = e as any}
        name={this.name}
        required={this.required}
        multiple={this.multiple}
        disabled={this.disabled}
        class="native-select"
        onFocus={this.onFocus.bind(this)}
        onBlur={this.onBlur.bind(this)}
        onChange={this.handleChange.bind(this)}
      >
        <option value="" disabled={this.required} hidden={this.required} selected class="placeholder">{this.placeholder}</option>
        {this.childOpts.map(option =>
          <option
            hidden={option.hidden}
            disabled={option.disabled}
            selected={option.selected}
            value={option.value}>
            {option.innerText}
          </option>)}
      </select>,
      <slot></slot>
    ];
  }

}

function isOptionSelected(currentValue: any[] | any, optionValue: any) {
  if (currentValue === undefined) {
    return false;
  }
  if (Array.isArray(currentValue)) {
    return currentValue.includes(optionValue);
  } else {
    return currentValue === optionValue;
  }
}