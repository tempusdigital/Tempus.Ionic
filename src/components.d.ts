/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { IActionControllerMessages, ProcessOptions, } from "./components/t-action-controller/t-action-controller-interface";
import { IComboboxMessages, IComboboxOption, NormalizedOption, } from "./components/t-combobox/t-combobox-interface";
import { IComboboxMessages as IComboboxMessages1, IComboboxOption as IComboboxOption1, } from "./interface";
import { PopupMenuButton, PopupMenuOptions, } from "./components/t-popup-menu-controller/t-popup-menu-controller-interface";
import { FormInput, FormValidationMessages, } from "./components/t-validation-controller/t-validation-controller-interface";
export namespace Components {
    interface TActionController {
        "getValidationController": () => Promise<any>;
        "messages": IActionControllerMessages;
        /**
          * Processa as mensagens pra execução do submit de um formulário: - Exibe mensagem de "Carregando..."  - Impede alterações dos campos e reenvio do formulário até terminar o submit - Exibe validações locais - Exibe validações do servidor (retornadas com o status 400) - Exibe avisos de erros de servidor
          * @param form Formulário
          * @param action Ação para ser executada como submit do formulário. Geralmente nesta ação é enviado o formulário para o servidor.
         */
        "processAction": (action?: () => any, options?: ProcessOptions) => Promise<boolean>;
        /**
          * Processa as mensagens pra execução do submit de um formulário: - Exibe mensagem de "Carregando..."  - Impede alterações dos campos e reenvio do formulário até terminar o submit - Exibe validações locais - Exibe validações do servidor (retornadas com o status 400) - Exibe avisos de erros de servidor
          * @param form Formulário
          * @param action Ação para ser executada como submit do formulário. Geralmente nesta ação é enviado o formulário para o servidor.
         */
        "processSubmit": (form: HTMLFormElement, action?: () => any, options?: ProcessOptions) => Promise<boolean>;
    }
    interface TCombobox {
        /**
          * Set the focus on component is loaded.
         */
        "autofocus": boolean;
        /**
          * If `true`, the user cannot interact with the input. Defaults to `false`.
         */
        "disabled": boolean;
        /**
          * The messages that will be shown
         */
        "messages": IComboboxMessages;
        /**
          * If `true`, the user can enter more than one value. This attribute applies when the type attribute is set to `"email"` or `"file"`, otherwise it is ignored.
         */
        "multiple": boolean;
        /**
          * Native select name attribute
         */
        "name": string;
        /**
          * The visible options to select.
         */
        "options": IComboboxOption[];
        /**
          * Set the input's placeholder when no option is selected.
         */
        "placeholder": string;
        /**
          * If `true`, the user cannot interact with the input. Defaults to `false`.
         */
        "readonly": boolean;
        /**
          * If `true`, the user must fill in a value before submitting a form.
         */
        "required": boolean;
        /**
          * Override the default search behavior. Useful to send the search to a web server.
         */
        "search": (options?: {
            searchText: string;
        }) => IComboboxOption[] | Promise<IComboboxOption[]>;
        /**
          * Set the amount of time, in milliseconds, to wait to trigger the search after each keystroke. Default `250`.
         */
        "searchDebounce": number;
        /**
          * The value of the input.
         */
        "value": any;
    }
    interface TComboboxChoices {
        "addTokens": string;
        "allowAdd": boolean;
        "autofocus": boolean;
        "debounce": number;
        "disabled": boolean;
        "messages": IComboboxMessages;
        "multiple": boolean;
        "name": string;
        "options": IComboboxOption[];
        "placeholder": string;
        "readonly": boolean;
        "required": boolean;
        "value": string | string[];
    }
    interface TComboboxList {
        "focusNext": () => Promise<void>;
        "focusPrevious": () => Promise<void>;
        "hasFocusedOption": () => Promise<boolean>;
        "messages": IComboboxMessages;
        "options": IComboboxOption[];
        "selectFocused": () => Promise<void>;
        "value": string | string[];
    }
    interface TComboboxModal {
        "autofocus": boolean;
        "debounce": number;
        "disabled": boolean;
        "messages": IComboboxMessages;
        "multiple": boolean;
        "name": string;
        "options": IComboboxOption[];
        "placeholder": string;
        "readonly": boolean;
        "required": boolean;
        "value": string | string[];
    }
    interface TComboboxModalList {
        "close": () => Promise<any>;
        "debounce": number;
        "messages": IComboboxMessages;
        "multiple": boolean;
        "options": NormalizedOption[];
        "value": string | string[];
    }
    interface TContainer {
        "fluid": boolean;
    }
    interface TMessage {
        "helperMessage": string;
        "name": string;
        "validationMessage": string;
    }
    interface TMessageSummary {
        "validationMessages": string[];
    }
    interface TPopupMenuController {
        "create": (options: PopupMenuOptions) => Promise<any>;
    }
    interface TPopupMenuPopover {
        "buttons": PopupMenuButton[];
        "dismiss": () => Promise<void>;
        "header": string;
        "popoverController": any;
    }
    interface TSelect {
        "autofocus": boolean;
        "disabled": boolean;
        "hidden": boolean;
        "multiple": boolean;
        "name": string;
        "readonly": boolean;
        "required": boolean;
        "value": string | string[];
    }
    interface TSelectOption {
        "disabled": boolean;
        "hidden": boolean;
        "onDidUnload": () => void;
        "selected": boolean;
        "value": string;
    }
    interface TValidationController {
        /**
          * Clear the custom messages of all field on the form. The messages are remove removed from the field data, but to update the screen you must use reportValidity.
          * @param form Form element
         */
        "clearCustomValidity": (form: HTMLFormElement) => Promise<void>;
        /**
          * Returns current global custom validity of a Form Element.
          * @param form Form element
         */
        "getGlobalCustomValidity": (form: HTMLFormElement) => Promise<string>;
        /**
          * Update the form validaiton messages on the screen.
          * @param form
         */
        "reportValidity": (form: HTMLFormElement) => Promise<boolean>;
        /**
          * Add custom validation to fields of the form.
          * @param form FormElement
          * @param formValidationMessages Validation messages to each field
         */
        "setCustomValidity": (form: HTMLFormElement, formValidationMessages: FormValidationMessages) => Promise<void>;
        "setCustomerValidationForField": (form: HTMLFormElement, fieldName: string, validations: string[]) => Promise<void>;
        /**
          * Add custom validation at a form level. The validation won't be connected to a specific field.
          * @param form Form element
          * @param message Validation message
         */
        "setGlobalCustomValidity": (form: HTMLFormElement, message: string) => Promise<void>;
    }
}
declare global {
    interface HTMLTActionControllerElement extends Components.TActionController, HTMLStencilElement {
    }
    var HTMLTActionControllerElement: {
        prototype: HTMLTActionControllerElement;
        new (): HTMLTActionControllerElement;
    };
    interface HTMLTComboboxElement extends Components.TCombobox, HTMLStencilElement {
    }
    var HTMLTComboboxElement: {
        prototype: HTMLTComboboxElement;
        new (): HTMLTComboboxElement;
    };
    interface HTMLTComboboxChoicesElement extends Components.TComboboxChoices, HTMLStencilElement {
    }
    var HTMLTComboboxChoicesElement: {
        prototype: HTMLTComboboxChoicesElement;
        new (): HTMLTComboboxChoicesElement;
    };
    interface HTMLTComboboxListElement extends Components.TComboboxList, HTMLStencilElement {
    }
    var HTMLTComboboxListElement: {
        prototype: HTMLTComboboxListElement;
        new (): HTMLTComboboxListElement;
    };
    interface HTMLTComboboxModalElement extends Components.TComboboxModal, HTMLStencilElement {
    }
    var HTMLTComboboxModalElement: {
        prototype: HTMLTComboboxModalElement;
        new (): HTMLTComboboxModalElement;
    };
    interface HTMLTComboboxModalListElement extends Components.TComboboxModalList, HTMLStencilElement {
    }
    var HTMLTComboboxModalListElement: {
        prototype: HTMLTComboboxModalListElement;
        new (): HTMLTComboboxModalListElement;
    };
    interface HTMLTContainerElement extends Components.TContainer, HTMLStencilElement {
    }
    var HTMLTContainerElement: {
        prototype: HTMLTContainerElement;
        new (): HTMLTContainerElement;
    };
    interface HTMLTMessageElement extends Components.TMessage, HTMLStencilElement {
    }
    var HTMLTMessageElement: {
        prototype: HTMLTMessageElement;
        new (): HTMLTMessageElement;
    };
    interface HTMLTMessageSummaryElement extends Components.TMessageSummary, HTMLStencilElement {
    }
    var HTMLTMessageSummaryElement: {
        prototype: HTMLTMessageSummaryElement;
        new (): HTMLTMessageSummaryElement;
    };
    interface HTMLTPopupMenuControllerElement extends Components.TPopupMenuController, HTMLStencilElement {
    }
    var HTMLTPopupMenuControllerElement: {
        prototype: HTMLTPopupMenuControllerElement;
        new (): HTMLTPopupMenuControllerElement;
    };
    interface HTMLTPopupMenuPopoverElement extends Components.TPopupMenuPopover, HTMLStencilElement {
    }
    var HTMLTPopupMenuPopoverElement: {
        prototype: HTMLTPopupMenuPopoverElement;
        new (): HTMLTPopupMenuPopoverElement;
    };
    interface HTMLTSelectElement extends Components.TSelect, HTMLStencilElement {
    }
    var HTMLTSelectElement: {
        prototype: HTMLTSelectElement;
        new (): HTMLTSelectElement;
    };
    interface HTMLTSelectOptionElement extends Components.TSelectOption, HTMLStencilElement {
    }
    var HTMLTSelectOptionElement: {
        prototype: HTMLTSelectOptionElement;
        new (): HTMLTSelectOptionElement;
    };
    interface HTMLTValidationControllerElement extends Components.TValidationController, HTMLStencilElement {
    }
    var HTMLTValidationControllerElement: {
        prototype: HTMLTValidationControllerElement;
        new (): HTMLTValidationControllerElement;
    };
    interface HTMLElementTagNameMap {
        "t-action-controller": HTMLTActionControllerElement;
        "t-combobox": HTMLTComboboxElement;
        "t-combobox-choices": HTMLTComboboxChoicesElement;
        "t-combobox-list": HTMLTComboboxListElement;
        "t-combobox-modal": HTMLTComboboxModalElement;
        "t-combobox-modal-list": HTMLTComboboxModalListElement;
        "t-container": HTMLTContainerElement;
        "t-message": HTMLTMessageElement;
        "t-message-summary": HTMLTMessageSummaryElement;
        "t-popup-menu-controller": HTMLTPopupMenuControllerElement;
        "t-popup-menu-popover": HTMLTPopupMenuPopoverElement;
        "t-select": HTMLTSelectElement;
        "t-select-option": HTMLTSelectOptionElement;
        "t-validation-controller": HTMLTValidationControllerElement;
    }
}
declare namespace LocalJSX {
    interface TActionController {
        "messages"?: IActionControllerMessages;
    }
    interface TCombobox {
        /**
          * Set the focus on component is loaded.
         */
        "autofocus"?: boolean;
        /**
          * If `true`, the user cannot interact with the input. Defaults to `false`.
         */
        "disabled"?: boolean;
        /**
          * The messages that will be shown
         */
        "messages"?: IComboboxMessages;
        /**
          * If `true`, the user can enter more than one value. This attribute applies when the type attribute is set to `"email"` or `"file"`, otherwise it is ignored.
         */
        "multiple"?: boolean;
        /**
          * Native select name attribute
         */
        "name"?: string;
        /**
          * Trigger change event when value has changed
         */
        "onChange"?: (event: CustomEvent<any>) => void;
        /**
          * The visible options to select.
         */
        "options"?: IComboboxOption[];
        /**
          * Set the input's placeholder when no option is selected.
         */
        "placeholder"?: string;
        /**
          * If `true`, the user cannot interact with the input. Defaults to `false`.
         */
        "readonly"?: boolean;
        /**
          * If `true`, the user must fill in a value before submitting a form.
         */
        "required"?: boolean;
        /**
          * Override the default search behavior. Useful to send the search to a web server.
         */
        "search"?: (options?: {
            searchText: string;
        }) => IComboboxOption[] | Promise<IComboboxOption[]>;
        /**
          * Set the amount of time, in milliseconds, to wait to trigger the search after each keystroke. Default `250`.
         */
        "searchDebounce"?: number;
        /**
          * The value of the input.
         */
        "value"?: any;
    }
    interface TComboboxChoices {
        "addTokens"?: string;
        "allowAdd"?: boolean;
        "autofocus"?: boolean;
        "debounce"?: number;
        "disabled"?: boolean;
        "messages"?: IComboboxMessages;
        "multiple"?: boolean;
        "name"?: string;
        "onChange"?: (event: CustomEvent<any>) => void;
        "onIonStyle"?: (event: CustomEvent<any>) => void;
        "onSearch"?: (event: CustomEvent<any>) => void;
        "options"?: IComboboxOption[];
        "placeholder"?: string;
        "readonly"?: boolean;
        "required"?: boolean;
        "value"?: string | string[];
    }
    interface TComboboxList {
        "messages"?: IComboboxMessages;
        "onSelect"?: (event: CustomEvent<any>) => void;
        "options"?: IComboboxOption[];
        "value"?: string | string[];
    }
    interface TComboboxModal {
        "autofocus"?: boolean;
        "debounce"?: number;
        "disabled"?: boolean;
        "messages"?: IComboboxMessages;
        "multiple"?: boolean;
        "name"?: string;
        "onChange"?: (event: CustomEvent<any>) => void;
        "onIonStyle"?: (event: CustomEvent<any>) => void;
        "options"?: IComboboxOption[];
        "placeholder"?: string;
        "readonly"?: boolean;
        "required"?: boolean;
        "value"?: string | string[];
    }
    interface TComboboxModalList {
        "debounce"?: number;
        "messages"?: IComboboxMessages;
        "multiple"?: boolean;
        "onSelect"?: (event: CustomEvent<any>) => void;
        "options"?: NormalizedOption[];
        "value"?: string | string[];
    }
    interface TContainer {
        "fluid"?: boolean;
    }
    interface TMessage {
        "helperMessage"?: string;
        "name"?: string;
        "onIonStyle"?: (event: CustomEvent<any>) => void;
        "validationMessage"?: string;
    }
    interface TMessageSummary {
        "validationMessages"?: string[];
    }
    interface TPopupMenuController {
    }
    interface TPopupMenuPopover {
        "buttons"?: PopupMenuButton[];
        "header"?: string;
        "popoverController"?: any;
    }
    interface TSelect {
        "autofocus"?: boolean;
        "disabled"?: boolean;
        "hidden"?: boolean;
        "multiple"?: boolean;
        "name"?: string;
        "onIonStyle"?: (event: CustomEvent<any>) => void;
        "readonly"?: boolean;
        "required"?: boolean;
        "value"?: string | string[];
    }
    interface TSelectOption {
        "disabled"?: boolean;
        "hidden"?: boolean;
        "onDidUnload"?: () => void;
        "onSelectOptionDidLoad"?: (event: CustomEvent<void>) => void;
        "onSelectOptionDidUnload"?: (event: CustomEvent<void>) => void;
        "onSelectOptionDidUpdate"?: (event: CustomEvent<void>) => void;
        "selected"?: boolean;
        "value": string;
    }
    interface TValidationController {
    }
    interface IntrinsicElements {
        "t-action-controller": TActionController;
        "t-combobox": TCombobox;
        "t-combobox-choices": TComboboxChoices;
        "t-combobox-list": TComboboxList;
        "t-combobox-modal": TComboboxModal;
        "t-combobox-modal-list": TComboboxModalList;
        "t-container": TContainer;
        "t-message": TMessage;
        "t-message-summary": TMessageSummary;
        "t-popup-menu-controller": TPopupMenuController;
        "t-popup-menu-popover": TPopupMenuPopover;
        "t-select": TSelect;
        "t-select-option": TSelectOption;
        "t-validation-controller": TValidationController;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "t-action-controller": LocalJSX.TActionController & JSXBase.HTMLAttributes<HTMLTActionControllerElement>;
            "t-combobox": LocalJSX.TCombobox & JSXBase.HTMLAttributes<HTMLTComboboxElement>;
            "t-combobox-choices": LocalJSX.TComboboxChoices & JSXBase.HTMLAttributes<HTMLTComboboxChoicesElement>;
            "t-combobox-list": LocalJSX.TComboboxList & JSXBase.HTMLAttributes<HTMLTComboboxListElement>;
            "t-combobox-modal": LocalJSX.TComboboxModal & JSXBase.HTMLAttributes<HTMLTComboboxModalElement>;
            "t-combobox-modal-list": LocalJSX.TComboboxModalList & JSXBase.HTMLAttributes<HTMLTComboboxModalListElement>;
            "t-container": LocalJSX.TContainer & JSXBase.HTMLAttributes<HTMLTContainerElement>;
            "t-message": LocalJSX.TMessage & JSXBase.HTMLAttributes<HTMLTMessageElement>;
            "t-message-summary": LocalJSX.TMessageSummary & JSXBase.HTMLAttributes<HTMLTMessageSummaryElement>;
            "t-popup-menu-controller": LocalJSX.TPopupMenuController & JSXBase.HTMLAttributes<HTMLTPopupMenuControllerElement>;
            "t-popup-menu-popover": LocalJSX.TPopupMenuPopover & JSXBase.HTMLAttributes<HTMLTPopupMenuPopoverElement>;
            "t-select": LocalJSX.TSelect & JSXBase.HTMLAttributes<HTMLTSelectElement>;
            "t-select-option": LocalJSX.TSelectOption & JSXBase.HTMLAttributes<HTMLTSelectOptionElement>;
            "t-validation-controller": LocalJSX.TValidationController & JSXBase.HTMLAttributes<HTMLTValidationControllerElement>;
        }
    }
}
