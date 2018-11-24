import { Component, Event, EventEmitter, Prop, Element } from '@stencil/core';

@Component({
  tag: 't-select-option',
  styleUrl: 't-select-option.scss'

})
export class TSelectOption {

  @Event() selectOptionDidLoad!: EventEmitter<void>;
  @Event() selectOptionDidUnload!: EventEmitter<void>; 
  @Prop() value!: string;
  @Prop() selected = false;
  @Prop() disabled = false;
  @Prop() hidden = false;

  @Element() host!: HTMLElement;

  componentWillLoad() {
    if (this.value === undefined) {
      this.value = this.host.textContent || '';
    }
  }

  componentDidLoad() {
    this.selectOptionDidLoad.emit();
  }

  componentDidUnload() {
    this.selectOptionDidUnload.emit();
  }
  
  hostData() {
    return {
      'role': 'option'
    };
  }
}
