export interface FormValidationMessages {
  [elementName: string]: string[]
}

export type FormInput = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
