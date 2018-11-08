import { Component, Event, EventEmitter, Prop } from '@stencil/core';

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

  componentDidLoad() {
    this.selectOptionDidLoad.emit();
  }

  componentDidUnload() {
    this.selectOptionDidUnload.emit();
  }
}
