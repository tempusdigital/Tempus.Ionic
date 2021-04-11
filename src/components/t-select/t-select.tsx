import { Component, Prop, Listen, State, Event, EventEmitter, Watch, Element, h, forceUpdate } from '@stencil/core';
import { deferEvent, debounceAsync, normalizeValue, isEmptyValue } from '../../utils/helpers';

@Component({
  tag: 't-select',
  styleUrl: 't-select.scss',
  shadow: false
})
export class TSelect {
  @Prop() name: string;
  @Prop() autofocus: boolean = false;
  @Prop() disabled: boolean = false;
  @Prop({ reflect: true }) readonly: boolean = false;
  @Prop() required: boolean = false;
  @Prop() hidden: boolean = false;
  @Prop() multiple: boolean = false;

  @Prop({ mutable: true }) value: string|string[];

  @Element() host!: any;

  @Event() ionStyle!: EventEmitter;

  nativeElement: HTMLTSelectElement;

  didInit = false;

  @State() childOpts: HTMLTSelectOptionElement[] = [];

  componentWillLoad() {
    this.ionStyle = deferEvent(this.ionStyle);
    this.selectOptionDidLoad = debounceAsync(this.selectOptionDidLoad.bind(this));
    this.selectOptionDidUnload = debounceAsync(this.selectOptionDidUnload.bind(this));
    this.selectOptionDidUpdate = debounceAsync(this.selectOptionDidUpdate.bind(this));
  }

  async componentDidLoad() {
    await this.loadOptions();

    if (this.value === undefined) {
      this.updateValue();
    }
    
    this.valueChanged();

    this.updateOptions();
    
    this.didInit = true;

    // Fix floating label when input starts with value
    setTimeout(() => {
      this.emitStyle();
      forceUpdate(this.host);
    }, 10);
  }

  hasFocus() {
    return this.nativeElement === document.activeElement;
  }

  hasValue() {
    return !isEmptyValue(this.value);
  }

  @Listen('selectOptionDidLoad')
  async selectOptionDidLoad() {    
    if (this.didInit) {
      await this.loadOptions();
      this.updateOptions();
      this.emitStyle();
    }
  }

  @Listen('selectOptionDidUpdate')
  async selectOptionDidUpdate() {    
    if (this.didInit) {   
      await this.loadOptions();
      this.updateOptions();
      this.updateValue();
      this.emitStyle();
    }
  }

  @Listen('selectOptionDidUnload')
  async selectOptionDidUnload() {    
    if (this.didInit) {
      await this.loadOptions();
      this.updateOptions();
      this.updateValue();
      this.emitStyle();
    }
  }

  private async loadOptions() {
    this.childOpts = await Promise.all(
      Array.from(this.host.querySelectorAll('t-select-option')).map((o: any) => o.componentOnReady())
    );
  }

  private updateValue() {
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
      else {
        this.value = '';
      }
    }
  }

  private updateOptions() {
    // iterate all options, updating the selected prop
    let canSelect = true;
    for (const selectOption of this.childOpts) {
      // On Stencil 1.0.0-beta.16 the selectOptionDidUnload is not get fired,
      // so for now use a property no notify when the option is unloaded
      selectOption.onDidUnload = this.selectOptionDidUnload;

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
    let normalizedValue = normalizeValue(this.value);

    if (this.value !== normalizedValue) {
      this.value = normalizedValue;
      return;
    }

    if (this.nativeElement && this.nativeElement.value !== this.value) {
      // Force the select value since is not possible to set it by jsx
      this.nativeElement.value = this.value;
    }

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
      'has-value': this.hasValue(),
      'has-focus': this.hasFocus(),
      'interactive-disabled': this.disabled,
      't-select': true
    });
  }

  handleChange(e) {
    this.value = e.target.value;
    this.valueChanged();
  }

  render() {
    // As select does not support readonly, use a input intead
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
        <option value="" disabled={this.required} hidden={this.required} selected class="placeholder"></option>
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