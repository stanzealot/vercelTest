import { QueryOptions } from '../../interfaces/functions.interface';

declare module 'express' {
  export interface Request {
    queryOpts: QueryOptions;
    permissions: string[];
  }
}

