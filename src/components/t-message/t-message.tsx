import { Component, Prop, Event, EventEmitter, Watch, Element, h } from "@stencil/core";
import { deferEvent } from "../../utils/helpers";

@Component({
  tag: 't-message',
  styleUrl: 't-message.scss'
})
export class TMessage {
  @Prop({ reflectToAttr: true }) name: string;

  @Prop() helperMessage: string;

  @Prop() validationMessage: string;

  @Event() ionStyle: EventEmitter;

  @Element() host: HTMLElement;

  _initializedLayout: boolean = false;

  @Watch('validationMessage')
  validationChange() {
    this.emitStyles();
  }

  @Watch('helperMessage')
  helperChange() {
    this.emitStyles();
  }

  componentWillLoad() {
    this.ionStyle = deferEvent(this.ionStyle);
    this.emitStyles();
  }

  hasValidation() {
    return this.validationMessage && !!this.validationMessage.trim();
  }

  hasHelper() {
    return this.helperMessage && !!this.helperMessage.trim();
  }

  emitStyles() {
    let hasHelper = this.hasHelper();
    let hasValidation = this.hasValidation();
    this.ionStyle.emit({
      'has-message': hasHelper || hasValidation,
      'has-message-validation': hasValidation,
      'has-message-helper': hasHelper
    });
  }

  render() {
    if (this.validationMessage && this.validationMessage.trim())
      return <div class="t-message-validation">{this.validationMessage}</div>;

    if (this.helperMessage && this.helperMessage.trim())
      return <div class="t-message-helper">{this.helperMessage}</div>;
  }
}
