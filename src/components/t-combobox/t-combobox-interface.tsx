export interface ICombobox {
  placeholder: string;

  name: string;

  autofocus: boolean;

  disabled: boolean;

  required: boolean;

  multiple: boolean;

  value: string | string[];

  options: IComboboxOption[];

  change: any;
}

export interface IComboboxOption {
  value: string;
  text: string;
  icon?: { src?: string; name?: string; };
}


export const ComboboxDefaultOptions = {
  searchDebounce: 250,
  loadingText: 'Carregando...',
  noResultsText: 'Nenhum item encontrado',
  noChoicesText: 'Nenhum item foi escolhido',
  selectOneOrMoreItemsText: 'Selecione um ou mais itens da lista',
  selectOneItemText: 'Selecione um item da lista',
  searchPlaceholderText: 'Pesquisar',
  confirmText: 'Confirmar'
}

export function isEmpty(value: any) {
  if (Array.isArray(value))
    return value.length <= 0;

  return value === null || value === undefined || value === '';
}


export function normalizeValue(value: any): string | string[] {
  if (isEmpty(value))
    return '';

  if (typeof value === 'string')
    return value;

  if (Array.isArray(value)) {
    let needToNormalize = value.some(v => typeof v !== 'string');

    if (!needToNormalize)
      return value;

    return value.map(v => v.toString());
  }

  return value.toString();
}

export function normalizeOptions(value: any): IComboboxOption[] {
  if (!value || !Array.isArray(value))
    return value;

  let needToNormalize = value.some(o => typeof o.value !== 'string');
  if (!needToNormalize)
    return value;

  return value.map(v => {
    return {
      ...v,
      value: normalizeValue(v.value)
    }
  });
}