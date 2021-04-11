export interface NormalizedOption {
    text: string;
    value: string;
    detailText: string;
    textSearchToken: string;
    detailTextSearchToken: string;
}

export const DefaultComboboxMessages: IComboboxMessages = {
    loadingText: 'Carregando...',
    noResultsText: 'Nenhum item encontrado',
    searchPlaceholderText: 'Pesquisar',
    confirmText: 'Confirmar'
}

export interface IComboboxMessages {
    confirmText?: string,
    loadingText?: string,
    noResultsText?: string,
    searchPlaceholderText?: string,
}