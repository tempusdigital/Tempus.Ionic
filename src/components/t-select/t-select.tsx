import { Component, Prop, Listen, State, Event, EventEmitter, Watch } from '@stencil/core';
import { deferEvent } from '../../utils/helpers';

@Component({
  tag: 't-select',
  styleUrl: 't-select.scss'
})
export class TSelect {
  @Prop() name: string;
  @Prop() autofocus: boolean = false;
  @Prop() disabled: boolean = false;
  @Prop({ reflectToAttr:true }) readonly: boolean = false;
  @Prop() placeholder: string;
  @Prop() required: boolean = false;
  @Prop() hidden: boolean = false;
  @Prop() multiple: boolean = false;
  @Prop({ mutable: true }) value: any;
   
  @Event() ionStyle!: EventEmitter;

  nativeElement: HTMLTSelectElement;

  @State() options: {
    value: string,
    text: string,
    disabled: boolean,
    selected: boolean,
    hidden: boolean
  }[] = [];

  componentWillLoad(){
    this.ionStyle = deferEvent(this.ionStyle);
    this.emitStyle();
  }

  componentDidLoad() {
    if (this.autofocus) {
      this.nativeElement.focus();
      this.onFocus();
    }

    if (this.value !== '' && this.value !== null && this.value !== undefined)
      this.setSelected();
    else {
      let opcaoSelecionada = this.options.find(o => o.selected);
      if (opcaoSelecionada) {
        this.value = opcaoSelecionada.value;
      }
    }
  }

  setSelected() {
    for (let opcao of this.options) {
      opcao.selected = opcao.value == this.value;
    }
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
  optLoad(ev: CustomEvent) {
    const selectOption = ev.target as HTMLTSelectOptionElement;

    this.options = [...this.options, {
      value: selectOption.value,
      text: selectOption.innerText,
      disabled: selectOption.disabled,
      selected: selectOption.selected,
      hidden: selectOption.hidden
    }];

    let opcoesCount = this.options.filter(op => op.value == selectOption.value).length;
    if (opcoesCount > 1) {
      console.warn('Não pode existir mais de um opção com o mesmo valor');
    }
  }

  @Listen('selectOptionDidUnload')
  optUnload(ev: CustomEvent) {
    //ToDo: Criar função para selectOptionDidUnload, para remover o item e também remover as funções de adicionar/remover
    console.log(ev);
  }

  @Watch('disabled')
  disabledChanged() {
    this.emitStyle();
  }

  @Watch('value')
  valueChanged() {
    this.setSelected();
    this.emitStyle();
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
      let option = this.options.find(o => o.value == this.value);
      return [
        <ion-input
          ref={e => this.nativeElement = e as any}
          readonly
          value={option && option.text || ''}
          onFocus={this.onFocus.bind(this)}
          onBlur={this.onBlur.bind(this)}></ion-input>,
        <input type="hidden" value={this.value}/>
        ];
    }

    return [
      <select
        ref={e => this.nativeElement = e as any}
        name={this.name}
        required={this.required}
        multiple={this.multiple}
        disabled={this.disabled}
        class="select-text"
        onFocus={this.onFocus.bind(this)}
        onBlur={this.onBlur.bind(this)}
        onChange={this.handleChange.bind(this)}
      >
        <option value="" disabled={this.required} hidden={this.required} selected class="placeholder">{this.placeholder}</option>
        {this.options.map(option =>
          <option
            hidden={option.hidden}
            disabled={option.disabled}
            selected={option.selected}
            value={option.value}>
            {option.text}
          </option>)}
      </select>,
      <slot></slot>
    ];
  }
}
