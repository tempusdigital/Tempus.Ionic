import { Component,  Prop } from "@stencil/core";

@Component({
  tag: 't-container',
  styleUrl: 't-container.scss'
})
export class TContainer {
  @Prop() fluid: boolean;

  hostData() {
    return {
      class: {
        fluid: this.fluid
      }
    }
  }
}
