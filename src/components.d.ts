/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { IComboboxMessages, IComboboxOption, NormalizedOption } from "./components/t-combobox/t-combobox-interface";
import { IComboboxMessages as IComboboxMessages1, IComboboxOption as IComboboxOption1 } from "./interface";
import { PageChanged, PagerMessages } from "./components/t-pager/interfaces";
import { PopupMenuButton } from "./components/t-popup-menu-controller/t-popup-menu-controller-interface";
export namespace Components {
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
        "optionDetail": string;
        "optionText": string;
        "optionValue": string;
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
        "search": (options?: { searchText: string; }) => IComboboxOption[] | Promise<IComboboxOption[]>;
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
        "optionDetail": string;
        "optionText": string;
        "optionValue": string;
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
        "target": HTMLElement;
        "updatePosition": () => Promise<void>;
        "value": string | string[];
    }
    interface TComboboxModal {
        "autofocus": boolean;
        "debounce": number;
        "disabled": boolean;
        "messages": IComboboxMessages;
        "multiple": boolean;
        "name": string;
        "optionDetail": string;
        "optionText": string;
        "optionValue": string;
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
    interface TPager {
        "disabled": boolean;
        "messages": PagerMessages;
        "page": number;
        "pageSize": number;
        "totalItems": number;
    }
    interface TPagerPopover {
        "messages": PagerMessages;
    }
    interface TPopupMenuPopover {
        "buttons": PopupMenuButton[];
        "dismiss": () => Promise<void>;
        "header": string;
    }
    interface TSelect {
        "autofocus": boolean;
        "disabled": boolean;
        "hidden": boolean;
        "multiple": boolean;
        "name": string;
        "readonly": boolean;
        "required": boolean;
        "value": string|string[];
    }
    interface TSelectOption {
        "disabled": boolean;
        "hidden": boolean;
        "onDidUnload": () => void;
        "selected": boolean;
        "value": string;
    }
}
declare global {
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
    interface HTMLTPagerElement extends Components.TPager, HTMLStencilElement {
    }
    var HTMLTPagerElement: {
        prototype: HTMLTPagerElement;
        new (): HTMLTPagerElement;
    };
    interface HTMLTPagerPopoverElement extends Components.TPagerPopover, HTMLStencilElement {
    }
    var HTMLTPagerPopoverElement: {
        prototype: HTMLTPagerPopoverElement;
        new (): HTMLTPagerPopoverElement;
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
    interface HTMLElementTagNameMap {
        "t-combobox": HTMLTComboboxElement;
        "t-combobox-choices": HTMLTComboboxChoicesElement;
        "t-combobox-list": HTMLTComboboxListElement;
        "t-combobox-modal": HTMLTComboboxModalElement;
        "t-combobox-modal-list": HTMLTComboboxModalListElement;
        "t-container": HTMLTContainerElement;
        "t-message": HTMLTMessageElement;
        "t-message-summary": HTMLTMessageSummaryElement;
        "t-pager": HTMLTPagerElement;
        "t-pager-popover": HTMLTPagerPopoverElement;
        "t-popup-menu-popover": HTMLTPopupMenuPopoverElement;
        "t-select": HTMLTSelectElement;
        "t-select-option": HTMLTSelectOptionElement;
    }
}
declare namespace LocalJSX {
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
        "optionDetail"?: string;
        "optionText"?: string;
        "optionValue"?: string;
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
        "search"?: (options?: { searchText: string; }) => IComboboxOption[] | Promise<IComboboxOption[]>;
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
        "onAddOption"?: (event: CustomEvent<{ option: IComboboxOption }>) => void;
        "onChange"?: (event: CustomEvent<any>) => void;
        "onChipClick"?: (event: CustomEvent<{ value: string }>) => void;
        "onIonStyle"?: (event: CustomEvent<any>) => void;
        "onSearch"?: (event: CustomEvent<any>) => void;
        "optionDetail"?: string;
        "optionText"?: string;
        "optionValue"?: string;
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
        "target"?: HTMLElement;
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
        "optionDetail"?: string;
        "optionText"?: string;
        "optionValue"?: string;
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
    interface TPager {
        "disabled"?: boolean;
        "messages"?: PagerMessages;
        "onPageChanged"?: (event: CustomEvent<PageChanged>) => void;
        "page"?: number;
        "pageSize"?: number;
        "totalItems"?: number;
    }
    interface TPagerPopover {
        "messages"?: PagerMessages;
    }
    interface TPopupMenuPopover {
        "buttons"?: PopupMenuButton[];
        "header"?: string;
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
        "value"?: string|string[];
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
    interface IntrinsicElements {
        "t-combobox": TCombobox;
        "t-combobox-choices": TComboboxChoices;
        "t-combobox-list": TComboboxList;
        "t-combobox-modal": TComboboxModal;
        "t-combobox-modal-list": TComboboxModalList;
        "t-container": TContainer;
        "t-message": TMessage;
        "t-message-summary": TMessageSummary;
        "t-pager": TPager;
        "t-pager-popover": TPagerPopover;
        "t-popup-menu-popover": TPopupMenuPopover;
        "t-select": TSelect;
        "t-select-option": TSelectOption;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "t-combobox": LocalJSX.TCombobox & JSXBase.HTMLAttributes<HTMLTComboboxElement>;
            "t-combobox-choices": LocalJSX.TComboboxChoices & JSXBase.HTMLAttributes<HTMLTComboboxChoicesElement>;
            "t-combobox-list": LocalJSX.TComboboxList & JSXBase.HTMLAttributes<HTMLTComboboxListElement>;
            "t-combobox-modal": LocalJSX.TComboboxModal & JSXBase.HTMLAttributes<HTMLTComboboxModalElement>;
            "t-combobox-modal-list": LocalJSX.TComboboxModalList & JSXBase.HTMLAttributes<HTMLTComboboxModalListElement>;
            "t-container": LocalJSX.TContainer & JSXBase.HTMLAttributes<HTMLTContainerElement>;
            "t-message": LocalJSX.TMessage & JSXBase.HTMLAttributes<HTMLTMessageElement>;
            "t-message-summary": LocalJSX.TMessageSummary & JSXBase.HTMLAttributes<HTMLTMessageSummaryElement>;
            "t-pager": LocalJSX.TPager & JSXBase.HTMLAttributes<HTMLTPagerElement>;
            "t-pager-popover": LocalJSX.TPagerPopover & JSXBase.HTMLAttributes<HTMLTPagerPopoverElement>;
            "t-popup-menu-popover": LocalJSX.TPopupMenuPopover & JSXBase.HTMLAttributes<HTMLTPopupMenuPopoverElement>;
            "t-select": LocalJSX.TSelect & JSXBase.HTMLAttributes<HTMLTSelectElement>;
            "t-select-option": LocalJSX.TSelectOption & JSXBase.HTMLAttributes<HTMLTSelectOptionElement>;
        }
    }
}
