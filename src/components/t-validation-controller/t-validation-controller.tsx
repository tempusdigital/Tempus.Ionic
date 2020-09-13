import { FormInput, FormValidationMessages } from './t-validation-controller-interface';

/**
 * Apply custom validation to a FormElement and display the validation messages on <t-message> and <t-message-summary> 
 */
class ValidationController {
  private normalizeLabel(elementName: string) {
    if (elementName == this._globalCustomValidityName)
      return "";

    elementName = elementName.replace(/([a-z](?=[A-Z]))|\.\_/g, '$1 ');

    return elementName.substr(0, 1).toUpperCase() + elementName.substr(1, elementName.length - 1);
  }

  /**
   * Add custom validation to fields of the form.
   * @param form FormElement
   * @param formValidationMessages Validation messages to each field
   */
  public async setCustomValidity(form: HTMLFormElement, formValidationMessages: FormValidationMessages) {
    let globalMessages: string[] = [];

    for (let elementName in formValidationMessages) {
      let validationMessages = formValidationMessages[elementName];

      if (typeof validationMessages === 'string')
        validationMessages = [validationMessages];

      if (!validationMessages)
        continue;

      let element = this.getFormInputByName(form, elementName);

      if (!element) {
        globalMessages.push(...validationMessages.map(message => {
          let label = this.normalizeLabel(elementName);

          if (label)
            return label + ': ' + message;

          return message;
        }));
        continue;
      }

      element.setCustomValidity(validationMessages[0] || '');
    }

    if (globalMessages.length)
      this.setGlobalCustomValidity(form, globalMessages.join('\n'));
  }

  public async setCustomerValidationForField(form: HTMLFormElement, fieldName: string, validations: string[]) {
    let data: FormValidationMessages = {};
    data[fieldName] = validations;
    this.setCustomValidity(form, data);
  }

  private getAllFormInputs(form: HTMLFormElement): FormInput[] {
    let result = [];
    let elements = form.querySelectorAll('input,select,textarea,ion-textarea');

    this.forEachElement(elements, element => {
      let validatorElement = this.getValidatorElement(element as FormInput);

      if (validatorElement)
        result.push(validatorElement);
    });

    return result;
  }

  private getFormInputByName(form: HTMLFormElement, name: string) {
    let element = form.querySelector(`[name="${name}"]:not(t-message):not([type="hidden"])`);

    if (!element)
      return null;

    if (element.tagName != 'SELECT' && 'length' in element && 'item' in element)
      element = (element as HTMLCollectionBase).item(0);

    if (!element)
      return null;

    return this.getValidatorElement(element as FormInput);
  }

  private getValidatorElement(element: FormInput): FormInput {
    // Ionic use a hidden input on <ion-input> to fix keyboad position,
    // but the validation are only
    // appended to another input on the shadow dom
    if (element.tagName.indexOf('ION-') === 0) 
      element = element.querySelector('.native-input:not([type="hidden"]),.native-textarea:not([type="hidden"]),.aux-input:not([type="hidden"])');

    if (!element)
      return null;

    if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA')
      return element;

    return null;
  }

  private readonly _globalCustomValidityName = '__globalValidity';

  /**
   * Add custom validation at a form level. The validation won't be
   * connected to a specific field.
   * @param form Form element
   * @param message Validation message
   */
  public async setGlobalCustomValidity(form: HTMLFormElement, message: string) {
    let element = this.getOrCreateGlobalCustomValidityElement(form);
    element.setCustomValidity(message);
  }

  /**
   * Returns current global custom validity of a Form Element.
   * @param form Form element
   */
  public async getGlobalCustomValidity(form: HTMLFormElement): Promise<string> {
    let element = this.getOrCreateGlobalCustomValidityElement(form);
    return element.validationMessage;
  }

  private getOrCreateGlobalCustomValidityElement(form: HTMLFormElement): HTMLInputElement {
    let element = this.getFormInputByName(form, this._globalCustomValidityName) as HTMLInputElement;

    if (!element) {
      element = document.createElement('input');
      element.type = 'text';
      element.style.display = 'none';
      element.name = this._globalCustomValidityName;

      form.appendChild(element);
    }

    return element;
  }

  /**
   * Clear the custom messages of all field on the form.
   * The messages are remove removed from the field data, but to
   * update the screen you must use reportValidity.
   * @param form Form element
   */
  public async clearCustomValidity(form: HTMLFormElement) {
    for (let element of this.getAllFormInputs(form))
      element.setCustomValidity('')
  }

  private forEachElement(elements: HTMLCollectionBase, action: (element: FormInput) => any) {
    for (let i = 0; i < elements.length; i++) {
      action(elements.item(i) as any);
    }
  }

  /**
   * Update the form validaiton messages on the screen.
   * @param form
   */
  public async reportValidity(form: HTMLFormElement): Promise<boolean> {
    let valid = true;
    let globalMessages = [];
    let firstInvalidInput: FormInput;

    for (let element of this.getAllFormInputs(form)) {
      if (!element.checkValidity()) {
        valid = false;

        if (!firstInvalidInput)
          firstInvalidInput = element;
      }

      let messageElement = this.getMessageElement(form, element);

      if (!messageElement) {
        if (element.validationMessage) {
          if (element.name != 'global' && element.name != 'Global') {
            let label = this.normalizeLabel(element.name);

            if (label)
              globalMessages.push(label + ': ' + element.validationMessage);
            else
              globalMessages.push(element.validationMessage);
          }
          else
            globalMessages.push(element.validationMessage);
        }
      }
      else
        messageElement.validationMessage = element.validationMessage;
    }

    let summaryElement = this.getMessageSummaryElement(form);

    if (globalMessages.length) {
      if (summaryElement) {
        summaryElement.validationMessages = globalMessages;
        summaryElement.scrollIntoView();
      }
      else
        console.warn(['Nenhum message summary foi encontrado', form]);
    } else {
      if (firstInvalidInput)
        this.scrollIntoView(firstInvalidInput);
    }

    return valid;
  }

  private scrollIntoView(element: HTMLElement) {
    let item = element.closest('.item');

    if (item) {
      item.scrollIntoView();
      return;
    }

    element.scrollIntoView();
  }

  private getMessageElement(form: HTMLFormElement, element: FormInput): HTMLTMessageElement {
    let key = '__message';

    if (element[key])
      return element[key];

    if (element.name)
      return element[key] = form.querySelector(`t-message[name="${element.name}"]`);
  }

  private getMessageSummaryElement(form: HTMLFormElement): HTMLTMessageSummaryElement {
    return form.querySelector('t-message-summary');
  }
}


export const validationController = new ValidationController();