export interface PageChanged {
    start: number,
    end: number,
    page: number,
    pageSize: number,
    totalItems: number,
    hasNextPage: boolean,
    hasPreviousPage: boolean
}

export type PagerButton = 'first-page' | 'last-page';

export interface PagerMessages {
    nextPage: string,
    previousPage: string,
    firstPage: string,
    lastPage: string,
    currentPage: (options: { start: number, end: number, totalItems: number, page: number, pageSize: number }) => string
}

export const PagerDefaultMessages: PagerMessages = {
    nextPage: 'Próxima',
    previousPage: 'Anterior',
    firstPage: 'Primeira Página',
    lastPage: 'Ultima Página',
    currentPage: (options) => options.start + " - " + options.end + " de " + options.totalItems
};