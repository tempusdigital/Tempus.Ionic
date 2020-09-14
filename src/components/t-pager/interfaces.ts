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
}