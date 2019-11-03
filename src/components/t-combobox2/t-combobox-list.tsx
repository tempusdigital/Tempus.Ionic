import { Component, h, Prop, State, Element, Method, Watch, writeTask, Event } from '@stencil/core';
import { IComboboxMessages } from '../../interface';
import { IComboboxOption } from '../t-combobox/t-combobox-interface';
import { EventEmitter } from 'events';

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
  tag: 't-combobox-list2',
  styleUrl: 't-combobox-list.scss'
})
export class ComboboxList2 {
  @Element() host: HTMLElement;

  @Prop() options: IComboboxOption[] = [];

  @Prop() messages: IComboboxMessages;

  @State() focusedItemIndex: number;

  @Event() select: EventEmitter;

  @Prop({ mutable: true }) value: string | string[];

  focusedElement: HTMLElement;

  scrollFocusedIntoView: Scroll = Scroll.None;

  componentWillLoad() {
    if (!this.options)
      return;

    this.focusedItemIndex = this.options.findIndex(o => o.value == this.value);
    this.scrollFocusedIntoView = Scroll.Down;
  }

  componentDidLoad() {
    this.processScrollFocused();
  }

  componentDidUpdate() {
    this.processScrollFocused();
  }

  processScrollFocused() {
    if (this.scrollFocusedIntoView) {
      if (this.focusedElement) {
        let isVisible = isScrolledIntoView(this.focusedElement, this.host, this.scrollFocusedIntoView);
        
        if (!isVisible)
        writeTask(() => {
            this.scrollToChoice(this.focusedElement, this.scrollFocusedIntoView);
        });
      }

      this.scrollFocusedIntoView = Scroll.None;
    }
  }

  @Watch('options')
  optionsChanged() {
    this.focusedItemIndex = null;
    this.focusedElement = null;
    this.scrollFocusedIntoView = Scroll.None;
  }

  scrollToChoice(choice, direction: Scroll) {
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
    this.scrollFocusedIntoView = Scroll.Down;
  }

  @Method()
  async focusPrevious() {
    this.focusStep(-1);
    this.scrollFocusedIntoView = Scroll.Up;
  }

  handleMouseOver = (e: MouseEvent) => {
    let target = e.target as HTMLElement;

    if (target.dataset.index === undefined)
      this.focusedItemIndex = null;
    else
      this.focusedItemIndex = +target.dataset.index;
  }

  handleClick = (e: any) => {
    e.preventDefault();
    let index = e.target.dataset.index;

    this.value = this.options[index].value;
    this.select.emit(this.value);
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
