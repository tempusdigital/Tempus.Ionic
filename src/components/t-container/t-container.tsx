import { Component, Prop, Host, h } from "@stencil/core";

@Component({
  tag: 't-container',
  styleUrl: 't-container.scss'
})
export class TContainer {
  @Prop() fluid: boolean;

  render() {
    return (
      <Host
        class={{
          fluid: this.fluid
        }}>
        <slot></slot>
      </Host>
    );
  }
}
