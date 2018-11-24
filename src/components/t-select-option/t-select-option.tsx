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

  // On Stencil 1.0.0-beta.16 the selectOptionDidUnload is not get fired,
  // so se reload must be done manually
  @Prop() onDidUnload: () => void;

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
    this.onDidUnload && this.onDidUnload();
  }

  hostData() {
    return {
      'role': 'option'
    };
  }
}
