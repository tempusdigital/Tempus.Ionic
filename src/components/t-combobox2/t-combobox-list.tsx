import { Component, h, Prop } from '@stencil/core';
import { IComboboxMessages } from '../../interface';
import { IComboboxOption } from '../t-combobox/t-combobox-interface';

@Component({
  tag: 't-combobox-list2'
})
export class ComboboxList2 {
  @Prop() options: IComboboxOption[] = [];

  @Prop() messages: IComboboxMessages;

  renderEmpty() {
    return (
      <p>{this.messages.noResultsText}</p>
    );
  }

  renderItem(item: IComboboxOption) {
    return (
      <p key={item.value}>
        {item.text}
      </p>
    )
  }

  renderList() {
    return this.options.map(i => this.renderItem(i));
  }

  render() {
    return [
      <ion-content class="ion-padding">
        {this.options && this.options.length
          ? this.renderList()
          : this.renderEmpty()
        }
      </ion-content>
    ];
  }
}
