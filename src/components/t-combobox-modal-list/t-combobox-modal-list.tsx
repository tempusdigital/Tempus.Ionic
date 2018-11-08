import { Component, Prop, Element, State } from '@stencil/core';
import { IComboboxOption, ComboboxDefaultOptions } from '../t-combobox/t-combobox-interface';
import { removeAccents } from '../../utils/helpers';

interface IComboboxOptionSelection extends IComboboxOption {
  selected?: boolean;
  searchToken?: string;
  visible?: boolean;
}

@Component({
  tag: 't-combobox-modal-list'
})
export class ComboboxModalListPage {
  @Prop() search: (options?: { searchText: string; }) => IComboboxOption[] | Promise<IComboboxOption[]>;

  @Prop() handleChange: (selectedOption: IComboboxOption[]) => void;

  @Prop({ mutable: true }) value: any | any[];

  @Prop() multiple: boolean = false;

  @Prop() options: IComboboxOption[];

  @State() selectedOptions: IComboboxOption[] = [];

  @State() internalOptions: IComboboxOptionSelection[] = [];

  @Element() host: any;

  @Prop() searchDebounce: number;

  @State() searchText: string = '';

  searchbar: any;

  componentWillLoad() {
    if (this.options)
      this.internalOptions = this.options.map(o => ({
        ...o,
        selected: this.isSelected(o),
        searchToken: this.generateSearchToken(o.text),
        visible: true
      }));

    if (this.value !== undefined && this.options)
      this.selectedOptions = this.options.filter(option => this.isSelected(option));
  }

  generateSearchToken(str: string) {
    if (!str)
      return '';

    return removeAccents(str.toLowerCase()).replace(/[\W_]+/g, '');
  }

  async componentDidLoad() {
    if (!this.options && this.search) {
      await this.searchbar.componentOnReady();

      setTimeout(() => this.searchbar.focus(), 0);
    }
  }

  confirm() {
    this.close();

    this.handleChange && this.handleChange(this.selectedOptions);
  }

  close() {
    let modal = this.host.closest('ion-modal') as any;
    return modal.dismiss();
  }

  handleSelectOptionChange(e: any) {
    let { value, checked } = e.target;

    if (this.multiple) {
      let option = this.internalOptions.find(option => option.value === value);

      if (!option)
        return;

      option.selected = checked;

      if (option.selected) {
        this.selectedOptions = [...this.selectedOptions, option];
      }
      else {
        this.selectedOptions = this.selectedOptions.filter(option => option.value !== value);
      }

      this.value = this.internalOptions.filter(option => option.selected).map(option => option.value);
    } else {
      for (let option of this.internalOptions) {
        option.selected = option.value === value;

        if (option.selected)
          this.selectedOptions = [option];
      }

      this.value = value;
    }
  }

  isSelected(option: IComboboxOption) {
    if (Array.isArray(this.value))
      return this.value.includes(option.value);

    return option.value === this.value;
  }

  async handleCustomerSearch() {
    let result = this.search({ searchText: this.searchText });

    if ('then' in result) {
      result = await result;
    }

    this.internalOptions = result || [];

    this.internalOptions.forEach(option => {
      option.selected = this.isSelected(option);
      option.visible = true;
    });

    return result;
  }

  handleDefaultSearch() {
    let searchText = this.generateSearchToken(this.searchText);
    this.internalOptions.forEach(option =>
      option.visible = option.searchToken.includes(searchText));
  }

  async handleSearch(e) {
    this.searchText = e.target.value;

    if (this.search)
      await this.handleCustomerSearch();
    else
      this.handleDefaultSearch();
  }

  renderEmpty() {
    return (<ion-item><ion-label>{ComboboxDefaultOptions.noResultsText}</ion-label></ion-item>);
  }

  renderList() {
    if (!this.multiple)
      return [
        <ion-radio-group onIonChange={(v) => this.handleSelectOptionChange(v)} value={this.value}>
          {
            this.internalOptions
              .filter(option => option.visible)
              .map(option =>
                <ion-item>
                  <ion-radio value={option.value} checked={option.selected}></ion-radio>
                  <ion-label>{option.text}</ion-label>
                </ion-item>
              )
          }
        </ion-radio-group>
      ];

    return this.internalOptions
      .filter(option => option.visible)
      .map(option =>
        <ion-item>
          <ion-checkbox value={option.value} checked={option.selected} onIonChange={(v) => this.handleSelectOptionChange(v)} ></ ion-checkbox>
          <ion-label>{option.text}</ion-label>
        </ion-item>
      )
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
              {ComboboxDefaultOptions.confirmText}
            </ion-button>
          </ion-buttons>

          <ion-searchbar
            ref={e => this.searchbar = e as any}
            debounce={this.searchDebounce}
            value={this.searchText}
            onIonChange={e => this.handleSearch(e)}
            animated
            placeholder={ComboboxDefaultOptions.searchPlaceholderText}></ion-searchbar>

        </ion-toolbar>
      </ion-header>,
      <ion-content>
        <ion-list lines="none">
          <ion-list-header>
            {this.multiple ? ComboboxDefaultOptions.selectOneOrMoreItemsText : ComboboxDefaultOptions.selectOneItemText}
          </ion-list-header>

          {this.internalOptions && this.internalOptions.length
            ? this.renderList()
            : this.renderEmpty()
          }
        </ion-list>
      </ion-content>
    ]
  }
}
