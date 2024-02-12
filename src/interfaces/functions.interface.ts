export interface QueryOptions {
    limit: number;
    offset: number;
    status?: string[] | undefined | null;
    search?: string | undefined | null;
    categoryId?: number | undefined | null;
}