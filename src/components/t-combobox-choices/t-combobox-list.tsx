import { Component, h, Prop, State, Element, Method, Watch, writeTask, Event, EventEmitter } from '@stencil/core';
import { HTMLStencilElement } from '@stencil/core/internal';
import { IComboboxMessages } from '../../interface';
import { IComboboxOption } from '../t-combobox/t-combobox-interface';

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
  tag: 't-combobox-list',
  styleUrl: 't-combobox-list.scss'
})
export class ComboboxList {
  @Element() private host: HTMLStencilElement;

  @Prop() options: IComboboxOption[] = [];

  @Prop() messages: IComboboxMessages;
  
  @Prop({ mutable: true }) value: string | string[];

  @Prop() target: HTMLElement;

  @Event({ cancelable: false }) select: EventEmitter;

  @State() private focusedIndex: number;

  private scrollFocusedDirection: Scroll = Scroll.None;

  componentWillLoad() {
    if (!this.options)
      return;

    if (!Array.isArray(this.value))
      this.focusedIndex = this.options?.findIndex(o => o.value == this.value);

    this.scrollFocusedDirection = Scroll.Down;
  }

  componentDidLoad() {
    this.executeScroll();
  }

  componentDidUpdate() {
    this.executeScroll();
  }

  private getOffset(el: HTMLElement) {
    var _x = 0;
    var _y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop) && el.tagName.toUpperCase() != 'ION-CONTENT') {
      _x += el.offsetLeft;
      _y += el.offsetTop;
      el = el.offsetParent as HTMLElement;
    }

    return { top: _y, left: _x };
  }

  @Method()
  async updatePosition() {
    const target = this.target;
    const popover = this.host;

    const offset = this.getOffset(target);

    const top = offset.top + target.offsetHeight + 1;
    const left = offset.left;
    const width = target.offsetWidth;

    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;
    popover.style.width = `${width}px`;
  }

  private executeScroll() {
    if (this.scrollFocusedDirection == Scroll.None)
      return;

    const focusedElement = this.host.querySelector('.t-item-focused') as HTMLElement;

    if (!focusedElement) {
      this.scrollFocusedDirection = Scroll.None;
      return;
    }

    const isVisible = isScrolledIntoView(focusedElement, this.host, this.scrollFocusedDirection);

    if (!isVisible)
      writeTask(() => {
        this.scrollToChoice(focusedElement, this.scrollFocusedDirection);
      });

    this.scrollFocusedDirection = Scroll.None;
  }

  @Watch('options')
  optionsChanged() {
    this.scrollFocusedDirection = Scroll.None;
  }

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
    if (!this.options?.length)
      return;

    const oldIndex = this.focusedIndex;
    let newIndex = oldIndex + step;

    if (isNaN(newIndex) || newIndex === null || newIndex < 0)
      newIndex = 0;
    else if (this.options.length && newIndex >= this.options.length)
      newIndex = this.options.length - 1;

    if (newIndex != this.focusedIndex) {
      this.focusedIndex = newIndex;

      if (newIndex > oldIndex)
        this.scrollFocusedDirection = Scroll.Down;
      else
        this.scrollFocusedDirection = Scroll.Up;
    }
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
    if (!this.options)
      return;

    const option = this.options[this.focusedIndex];

    if (option)
      this.setValue(option.value);
  }

  @Method()
  async hasFocusedOption() {
    return this.options
      && this.focusedIndex >= 0
      && this.options[this.focusedIndex];
  }

  private handleMouseOver = (e: MouseEvent) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();

    if (!this.options?.length)
      return;

    const target = e.currentTarget as HTMLElement;

    const value = target.dataset.value;

    if (value === undefined)
      return;

    const currentValue = this.options[this.focusedIndex]?.value;

    if (currentValue !== value) {
      const index = this.options.findIndex(o => o.value == value);

      if (index >= 0)
        this.focusedIndex = index;
    }
  }

  private handleClick = (e: any) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();

    const value = e.currentTarget.dataset.value;
    this.setValue(value);
  }

  private setValue(value: string) {
    this.value = value;
    this.select.emit();
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
    const focused = index === this.focusedIndex;

    return (
      <div
        key={item.value}
        data-value={item.value}
        class={{ "t-item": true, 't-item-focused': focused }}
        onMouseOver={this.handleMouseOver}
        onMouseDown={this.handleClick}>
        {item.text}
        {item.detailText && <div class="t-item-detail">{item.detailText}</div>}
      </div>
    )
  }

  private renderList() {
    return this.options.map((item, index) => this.renderItem(item, index));
  }

  render() {
    return [
      this.options && this.options.length
        ? this.renderList()
        : this.renderEmpty()
    ];
  }
}
