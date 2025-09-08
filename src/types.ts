import { Method } from "axios";

export interface BaseEntity {
  id: string;
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date,
}

export type StringKeys<T> = Extract<keyof T, string>;
export type FieldKeys<T> = StringKeys<T> | StringKeys<BaseEntity>;

export enum FilterType {
  FILTER_EQUAL = 'eql',
  FILTER_GREATER_THAN = 'gt',
  FILTER_GREATER_THAN_OR_EQUAL = 'gte',
  FILTER_LESS_THAN = 'lt',
  FILTER_LESS_THAN_OR_EQUAL = 'lte',
  FILTER_LIKE = 'lik',
  FILTER_NOT_EQUAL = 'neq',
  FILTER_NOT_NULL = 'nnu',
  FILTER_NULL = 'nul',
  FILTER_BETWEEN = 'btw',
  FILTER_IN = 'in',
}

export interface Filter<T> {
  field: keyof T & string;
  value?: string;
  type: FilterType;
}

export interface OrderBy<T> {
  field: keyof T & string;
  type: 'asc' | 'desc'
}

export interface ListPayload<T> {
  filters?: Filter<T>[];
  order?: OrderBy<T>;
  cursor?: string;
  fields?: FieldKeys<T>[];
}

export interface ListResult<T> {
  data: T[];
  cursor?: string;
}

export interface ListOnePayload<T> {
  filters?: Filter<T>[];
  order?: OrderBy<T>;
  fields?: FieldKeys<T>[];
}

export interface EditPayload<T, Edit = EditDefault<T>> {
  id: string;
  data: Edit;
}

export interface BulkPayload<T> {
  ids: string[];
  cursor?: string;
  fields?: FieldKeys<T>[];
}

export interface GritRequestPayload<T> {
  path: string;
  method: Method;
  body?: T;
}

export type AddDefault<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
export type AddResult = { id: string };
export type BulkAddResult = { ids: string[] };
export type EditDefault<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>;

