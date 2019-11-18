import { Component, Prop, Element, State, Event, h, EventEmitter, Method } from '@stencil/core';
import { IComboboxOption, ComboboxDefaultOptions, IComboboxMessages } from '../t-combobox/t-combobox-interface';
import { generateSearchToken, asArray, isEmptyValue } from '../../utils/helpers';

@Component({
  tag: 't-combobox-modal-list',
  styleUrl: 't-combobox-modal-list.scss'
})
export class ComboboxModalListPage {
  @Prop() options: IComboboxOption[] = [];

  @Prop() messages: IComboboxMessages;

  @State() focusedItemIndex: number;

  @Prop({ mutable: true }) value: string | string[];

  @Event({ cancelable: false }) select: EventEmitter;

  @Event({ cancelable: false }) search: EventEmitter<{ searchText: string }>;

  @Prop() multiple: boolean = false;

  @Element() host: any;

  inputType: string;
  inputSlot: string;

  componentWillLoad() {
    if (!this.multiple) {
      this.inputType = 'ion-radio';
      this.inputSlot = "start";
    }
    else {
      this.inputType = 'ion-checkbox';
      this.inputSlot = "end";
    }
  }

  confirm() {
    this.close();

    this.select.emit();
  }

  @Method()
  async close() {
    let modal = this.host.closest('ion-modal') as any;
    return modal.dismiss();
  }

  handleSelectOptionChange = (e: any) => {
    let { value, checked } = e.target;

    if (isEmptyValue(value))
      return;

    if (this.multiple) {
      let currentValue = isEmptyValue(this.value) ? [] : asArray(this.value);

      if (checked) {
        if (!currentValue.includes(value)) {
          currentValue.push(value)
          this.value = currentValue;
        }
      }
      else
        this.value = currentValue.filter(v => v !== value);
    } else {
        this.value = value;
    }
  }

  async handleSearch(e) {
    let searchText = e.target.value;

    searchText = generateSearchToken(searchText);
    this.search.emit({ searchText });
  }

  private isChecked(value: string) {
    if (isEmptyValue(this.value))
      return false;

    if (Array.isArray(this.value) && Array.isArray(value))
      return this.value.some(v => value.includes(v));

    if (Array.isArray(this.value))
      return this.value.includes(value);

    return this.value === value;
  }

  renderEmpty() {
    return (<ion-item text-center><ion-label>{this.messages.noResultsText}</ion-label></ion-item>);
  }

  nodeRender = (el: HTMLElement, cell: any) => {
    if (cell.type === 'item') return this.renderItem(el, cell.value);
  }

  renderItem(el: HTMLElement, data: IComboboxOption) {
    let item: HTMLElement;
    let input: HTMLInputElement;
    let label: HTMLElement;

    if (!el) {
      item = el = document.createElement('ion-item');
      label = document.createElement('ion-label');

      input = document.createElement(this.inputType) as any;
      input.slot = this.inputSlot;

      if (this.multiple)
        input.addEventListener('ionChange', this.handleSelectOptionChange);

      item.append(input, label);
    } else {
      item = el;
      label = el.querySelector('ion-label');
      input = el.querySelector(this.inputType);
    }

    label.textContent = data.text;
    input.value = data.value;

      input.checked = this.isChecked(data.value);

    return el;
  }

  renderVirtualScroll() {
    return (<ion-virtual-scroll items={this.options} nodeRender={this.nodeRender} approxItemHeight={48}></ion-virtual-scroll>);
  }

  renderList() {
    if (!this.multiple)
      return [
        <ion-radio-group value={this.value} onIonChange={this.handleSelectOptionChange}>
          {
            this.renderVirtualScroll()
          }
        </ion-radio-group>
      ];

    return this.renderVirtualScroll();
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color='primary'>
          <ion-buttons slot="start">
            <ion-button onClick={() => this.close()}
              class="dismiss">
              <ion-icon name="close"></ion-icon>
            </ion-button>
          </ion-buttons>
          <ion-buttons slot="end">
            <ion-button onClick={() => this.confirm()}
              class="dismiss">
              {this.messages.confirmText}
            </ion-button>
          </ion-buttons>
        </ion-toolbar>

        <ion-toolbar color='primary'>
          <ion-searchbar
            onIonChange={e => this.handleSearch(e)}
            animated
            debounce={ComboboxDefaultOptions.searchDebounce}
            placeholder={this.messages.searchPlaceholderText}></ion-searchbar>
        </ion-toolbar>
      </ion-header>,
      <ion-content>
        <ion-list lines="none">
          {this.options && this.options.length
            ? this.renderList()
            : this.renderEmpty()
          }
        </ion-list>
      </ion-content>
    ]
  }
}
