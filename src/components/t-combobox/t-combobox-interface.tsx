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
