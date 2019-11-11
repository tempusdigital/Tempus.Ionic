import { Component, h, Prop, State, Element, Method, Watch, writeTask, Event, EventEmitter } from '@stencil/core';
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
  @Element() host: HTMLElement;

  @Prop() options: IComboboxOption[] = [];

  @Prop() messages: IComboboxMessages;

  @State() focusedItemIndex: number;

  @Prop({ mutable: true }) value: string | string[];

  @Event({ cancelable: false }) select: EventEmitter;

  focusedElement: HTMLElement;

  scrollFocusedDirection: Scroll = Scroll.None;

  componentWillLoad() {
    if (!this.options)
      return;

    this.focusedItemIndex = this.options.findIndex(o => o.value == this.value);
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

  @Watch('options')
  optionsChanged() {
    if (!this.options || this.options.length - 1 < this.focusedItemIndex) {
      this.focusedItemIndex = null;
      this.focusedElement = null;
      this.scrollFocusedDirection = Scroll.None;
    }
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
    let { options, focusedItemIndex } = this;

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
    if (this.options
      && this.focusedItemIndex >= 0
      && this.focusedItemIndex < this.options.length) {
      let option = this.options[this.focusedItemIndex];

      if (option)
        this.setValue(option.value);
    }
  }

  @Method()
  async hasFocusedOption() {
    return this.options
      && this.focusedItemIndex >= 0
      && this.focusedItemIndex < this.options.length;
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

    let option = this.options[index];
    this.setValue(option.value);
  }

  private setValue(value: string) {
    this.value = value;
    this.select.emit();
  }

  renderEmpty() {
    return (
      <div class="t-item" key="__empty__">
        {this.messages.noResultsText}
      </div>
    );
  }

  renderItem(item: IComboboxOption, index: number) {
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

  renderList() {
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
