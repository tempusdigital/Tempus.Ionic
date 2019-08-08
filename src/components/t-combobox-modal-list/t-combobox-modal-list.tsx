import { Component, Prop, Element, State, h } from '@stencil/core';
import { IComboboxOption, ComboboxDefaultOptions, IComboboxMessages } from '../t-combobox/t-combobox-interface';
import { removeAccents } from '../../utils/helpers';

interface IComboboxOptionSelection extends IComboboxOption {
  checked: boolean;
  searchToken: string;
}

@Component({
  tag: 't-combobox-modal-list',
  styleUrl: 't-combobox-modal-list.scss'
})
export class ComboboxModalListPage {
  @Prop() handleChange: (selectedOption: IComboboxOption[]) => void;

  @Prop() value: any | any[];

  @Prop() multiple: boolean = false;

  @Prop() options: IComboboxOption[];

  @Prop() messages: IComboboxMessages;

  @State() internalOptions: IComboboxOptionSelection[] = [];

  @State() visibleOptions: IComboboxOptionSelection[] = [];

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

    this.initOptions();
  }

  initOptions() {
    let isChecked = (option: IComboboxOption) => {
      if (Array.isArray(this.value))
        return this.value.includes(option.value);

      return option.value === this.value;
    };

    if (this.options)
      this.internalOptions = this.options.map(option => ({
        ...option,
        checked: isChecked(option),
        searchToken: this.generateSearchToken(option.text)
      }));

    this.visibleOptions = this.internalOptions;
  }

  generateSearchToken(str: string) {
    if (!str)
      return '';

    return removeAccents(str.toLowerCase()).replace(/[\W_]+/g, '');
  };

  confirm() {
    this.close();

    let selectedOptions = this.internalOptions.filter(i => i.checked);

    this.handleChange && this.handleChange(selectedOptions);
  }

  close() {
    let modal = this.host.closest('ion-modal') as any;
    return modal.dismiss();
  }

  handleSelectOptionChange = (e: any) => {
    let { value, checked } = e.target;

    if (this.multiple) {
      let option = this.internalOptions.find(option => option.value === value);

      if (option)
        option.checked = checked;
    } else {
      for (let option of this.internalOptions) {
        option.checked = option.value === value;
      }
    }
  }

  async handleSearch(e) {
    let searchText = e.target.value;

    searchText = this.generateSearchToken(searchText);
    this.visibleOptions = this.internalOptions.filter(option => option.searchToken.includes(searchText));
  }

  renderEmpty() {
    return (<ion-item text-center><ion-label>{this.messages.noResultsText}</ion-label></ion-item>);
  }

  nodeRender = (el: HTMLElement, cell: any) => {
    if (cell.type === 'item') return this.renderItem(el, cell.value);
  }

  renderItem(el: HTMLElement, data: IComboboxOptionSelection) {
    let item: HTMLElement;
    let input: HTMLInputElement;
    let label: HTMLElement;

    if (!el) {
      item = el = document.createElement('ion-item');
      label = document.createElement('ion-label');

      input = document.createElement(this.inputType) as any;
      input.slot = this.inputSlot;

      item.append(input, label);
    } else {
      item = el;
      label = el.querySelector('ion-label');
      input = el.querySelector(this.inputType);
    }

    label.textContent = data.text;
    input.value = data.value;
    input.checked = data.checked;

    return el;
  }

  renderVirtualScroll() {
    //return this.visibleOptions.map(this.renderItem);

    return (<ion-virtual-scroll items={this.visibleOptions} nodeRender={this.nodeRender} approxItemHeight={48}></ion-virtual-scroll>);
  }

  renderList() {
    if (!this.multiple)
      return [
        <ion-radio-group value={this.value}>
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
            deboundce={ComboboxDefaultOptions.searchDebounce}
            placeholder={this.messages.searchPlaceholderText}></ion-searchbar>
        </ion-toolbar>
      </ion-header>,
      <ion-content>
        <ion-list lines="none" onIonChange={this.handleSelectOptionChange}>
          {this.visibleOptions && this.visibleOptions.length
            ? this.renderList()
            : this.renderEmpty()
          }
        </ion-list>
      </ion-content>
    ]
  }
}
