import { Component, h, Prop, State, Element, Method, writeTask } from '@stencil/core';
import { IComboboxOption } from '../t-combobox/t-combobox-interface';
import { DataSource } from './datasource';
import { IComboboxMessages } from './interfaces';

const isScrolledIntoView = (el: HTMLElement, parent: HTMLElement, direction: Scroll = Scroll.Down) => {
  if (!el) {
    return;
  }

  let isVisible;

  if (direction == Scroll.Down) {
    // In view from bottom
    isVisible =
      parent.scrollTop + parent.offsetHeight >= el.offsetTop + el.offsetHeight;
  } else {
    // In view from top
    isVisible = el.offsetTop >= parent.scrollTop;
  }

  return isVisible;
};

enum Scroll {
  Up = 1,
  Down = 2,
  None = 0
}

@Component({
  tag: 't-combobox-popover-list',
  styleUrl: 't-combobox-popover-list.scss'
})
export class TComboboxPopoverList {
  @Element() host: HTMLElement;

  @Prop() dataSource: DataSource;

  @Prop() messages: IComboboxMessages;

  @State() focusedItemIndex: number;

  focusedElement: HTMLElement;

  scrollFocusedDirection: Scroll = Scroll.None;

  componentWillLoad() {
    if (!this.dataSource.state.visibleOptions)
      return;

    this.focusedItemIndex = this.dataSource.state.visibleOptions.findIndex(o => o.value == this.dataSource.state.value);
    this.scrollFocusedDirection = Scroll.Down;
  }

  componentDidLoad() {
    this.executeScroll();
  }

  componentDidUpdate() {
    this.executeScroll();
  }

  private executeScroll() {
    if (this.scrollFocusedDirection != Scroll.None && this.focusedElement) {
      let isVisible = isScrolledIntoView(this.focusedElement, this.host, this.scrollFocusedDirection);

      if (!isVisible)
        writeTask(() => {
          this.scrollToChoice(this.focusedElement, this.scrollFocusedDirection);
        });

      this.scrollFocusedDirection = Scroll.None;
    }
  }
  /*
    @Watch('options')
    optionsChanged() {
      if (!this.dataSource.state.visibleOptions || this.dataSource.state.visibleOptions.length - 1 < this.focusedItemIndex) {
        this.focusedItemIndex = null;
        this.focusedElement = null;
        this.scrollFocusedDirection = Scroll.None;
      }
    }
  */
  private scrollToChoice(choice, direction: Scroll) {
    if (!choice) {
      return;
    }

    const dropdownHeight = this.host.offsetHeight;
    const choiceHeight = choice.offsetHeight;
    // Distance from bottom of element to top of parent
    const choicePos = choice.offsetTop + choiceHeight;
    // Scroll position of dropdown
    const containerScrollPos = this.host.scrollTop + dropdownHeight;
    // Difference between the choice and scroll position
    const destination =
      direction == Scroll.Down
        ? this.host.scrollTop + choicePos - containerScrollPos
        : choice.offsetTop;

    this.host.scrollTo(0, destination);
  }


  private focusStep(step: number) {
    let { focusedItemIndex } = this;
    const options = this.dataSource.state.visibleOptions;

    if (!options || !options.length)
      return;

    let maxIndex = options.length - 1;

    if (focusedItemIndex === null || focusedItemIndex === undefined || focusedItemIndex > maxIndex) {
      this.focusedItemIndex = 0;
      return;
    }

    let newIndex = (focusedItemIndex || 0) + step;

    if (newIndex < 0 || newIndex > maxIndex)
      return;

    this.focusedItemIndex = newIndex;
  }

  @Method()
  async focusNext() {
    this.focusStep(+1);
    this.scrollFocusedDirection = Scroll.Down;
  }

  @Method()
  async focusPrevious() {
    this.focusStep(-1);
    this.scrollFocusedDirection = Scroll.Up;
  }

  @Method()
  async selectFocused() {
    if (this.dataSource.state.visibleOptions
      && this.focusedItemIndex >= 0
      && this.focusedItemIndex < this.dataSource.state.visibleOptions.length) {
      let option = this.dataSource.state.visibleOptions[this.focusedItemIndex];

      if (option)
        this.dataSource.select(option.value);
    }
  }

  @Method()
  async hasFocusedOption() {
    return this.dataSource.state.visibleOptions
      && this.focusedItemIndex >= 0
      && this.focusedItemIndex < this.dataSource.state.visibleOptions.length;
  }

  private handleMouseOver = (e: MouseEvent) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();

    let target = e.currentTarget as HTMLElement;

    if (target.dataset.index === undefined)
      this.focusedItemIndex = null;
    else
      this.focusedItemIndex = +target.dataset.index;
  }

  private handleClick = (e: any) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();

    let index = e.currentTarget.dataset.index;

    let option = this.dataSource.state.visibleOptions[index];
    this.dataSource.select(option.value);
  }

  private renderEmpty() {
    if (this.messages)
      return (
        <div class="t-item" key="__empty__">
          {this.messages.noResultsText}
        </div>
      );
  }

  private renderItem(item: IComboboxOption, index: number) {
    let focused = index === this.focusedItemIndex;

    return (
      <div
        ref={focused ? (e => this.focusedElement = e as any) : null}
        key={item.value}
        data-index={index}
        class={{ "t-item": true, 't-item-focused': focused }}
        onMouseOver={this.handleMouseOver}
        onMouseDown={this.handleClick}>
        {item.text}
        {item.detailText && <div class="t-item-detail">{item.detailText}</div>}
      </div>
    )
  }

  private renderList() {
    return this.dataSource.state.visibleOptions.map((item, index) => this.renderItem(item, index));
  }

  render() {
    return [
      this.dataSource.state.visibleOptions && this.dataSource.state.visibleOptions.length
        ? this.renderList()
        : this.renderEmpty()
    ];
  }
}
