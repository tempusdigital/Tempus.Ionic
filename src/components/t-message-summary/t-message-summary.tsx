import { Component, Prop } from "@stencil/core";

@Component({
  tag: 't-message-summary',
  styleUrl: 't-message-summary.scss'
})
export class TMessageSummary {
  @Prop() validationMessages: string[];

  render() {
    if (!this.validationMessages || !this.validationMessages.length) 
      return;

    return (
      <ul>
        {this.validationMessages.map(i => <li>{i}</li>)}
      </ul>
    );
  }
}
