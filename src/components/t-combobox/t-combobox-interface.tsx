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
  
  messages: IComboboxMessages;
}

export interface IComboboxOption {
  value: string;
  text: string;
  detailText?: string;
  icon?: { src?: string; name?: string; };
}

export interface NormalizedOption {
  text: string;
  value: string;
  detailText: string;
  textSearchToken: string;
  detailTextSearchToken: string;
}


export const ComboboxDefaultOptions = {
  searchDebounce: 250,
  messages: {
    loadingText: 'Carregando...',
    noResultsText: 'Nenhum item encontrado',
    selectOneOrMoreItemsText: 'Selecione um ou mais itens da lista',
    selectOneItemText: 'Selecione um item da lista',
    searchPlaceholderText: 'Pesquisar',
    confirmText: 'Confirmar'
  }
}

export interface IComboboxMessages {
  confirmText?: string,
  loadingText?: string,
  noResultsText?: string,
  searchPlaceholderText?: string,
}