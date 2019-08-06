import { Component, Prop, Element, State, h } from '@stencil/core';
import { IComboboxOption, ComboboxDefaultOptions, IComboboxMessages } from '../t-combobox/t-combobox-interface';
import { removeAccents } from '../../utils/helpers';

interface IComboboxOptionSelection extends IComboboxOption {
  selected: boolean;
  searchToken: string;
}

@Component({
  tag: 't-combobox-modal-list'
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

  componentWillLoad() {
    this.initOptions();
  }

  initOptions() {
    let isSelected = (option: IComboboxOption) => {
      if (Array.isArray(this.value))
        return this.value.includes(option.value);

      return option.value === this.value;
    };

    if (this.options)
      this.internalOptions = this.options.map(option => ({
        ...option,
        selected: isSelected(option),
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

    let selectedOptions = this.internalOptions.filter(i => i.selected);

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
        option.selected = checked;
    } else {
      for (let option of this.internalOptions) {
        option.selected = option.value === value;
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

  renderItem = (option: IComboboxOptionSelection) => {
    if (!this.multiple)
      return (
        <ion-item>
          <ion-radio slot="start" value={option.value} checked={option.selected}></ion-radio>
          <ion-label>{option.text}</ion-label>
        </ion-item>
      );

    return (
      <ion-item>
        <ion-checkbox slot="end" value={option.value} checked={option.selected} onIonChange={this.handleSelectOptionChange} ></ion-checkbox>
        <ion-label>{option.text}</ion-label>
      </ion-item>
    );
  }

  renderVirtualScroll() {
    return (<ion-virtual-scroll items={this.visibleOptions} renderItem={this.renderItem}></ion-virtual-scroll>);
  }

  renderList() {
    if (!this.multiple)
      return [
        <ion-radio-group onIonChange={this.handleSelectOptionChange} value={this.value}>
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
        <ion-list lines="none">
          {this.visibleOptions && this.visibleOptions.length
            ? this.renderList()
            : this.renderEmpty()
          }
        </ion-list>
      </ion-content>
    ]
  }
}
