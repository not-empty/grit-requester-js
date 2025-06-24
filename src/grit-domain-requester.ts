
import axios from 'axios';
import { AddDefault, AddResult, BulkAddResult, BulkPayload, EditDefault, EditPayload, GritRequestPayload, ListOnePayload, ListPayload, ListResult } from './types';
import { prepareQuery } from './query';
import { GritRequester } from './grit-requester';

export interface GritDomainRequesterOptions {
  domain: string;
  requester: GritRequester;
}

export class GritDomainRequester<T, Add = AddDefault<T>, Edit = EditDefault<T>> {
  public requester: GritRequester;

  public domain: string;

  constructor(options: GritDomainRequesterOptions) {
    this.requester = options.requester;
    this.domain = this.cleanPath(options.domain);
  }

  public cleanPath(path: string): string {
    return path.replace(/^\/|\/$/g, '');
  }

  public async add(payload: Add): Promise<AddResult> {
    const result = await this.requester.client.post<AddResult>(`/${this.domain}/add`, payload);
    return result.data;
  }

  public async bulk({
    ids,
  }: BulkPayload): Promise<ListResult<T>> {
    const result = await this.requester.client.post<T[]>(
      `/${this.domain}/bulk`,
      {
        ids,
      },
    );

    return {
      data: result.data,
      cursor: result.headers['x-page-cursor'] || '',
    };
  }

  public async bulkAll({
    ids,
  }: BulkPayload): Promise<T[]> {
    const results : T[] = [];
    const size = 25;

    for (let i = 0; i < ids.length; i += size) {
      const chunk = ids.slice(i, i + size);
      const res = await this.bulk({ ids: chunk });
      results.push(...res.data);
    }

    return results;
  }

  public async bulkAdd(payload: Add[]): Promise<BulkAddResult> {
    const chunkSize = 25;
    const results: BulkAddResult = {
      ids: [],
    };

    for (let i = 0; i < payload.length; i += chunkSize) {
      const chunk = payload.slice(i, i + chunkSize);
      const result = await this.requester.client.post(`/${this.domain}/bulk_add`, chunk);
      results.ids.push(...result.data.ids);
    }

    return results;
  }

  public async deadDetail(id: string): Promise<T | null> {
    try {
      const result = await this.requester.client.get<T>(`/${this.domain}/dead_detail/${id}`);
      return result.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  }

  public async deadList({
    filters,
    order,
    cursor,
  }: ListPayload<T>): Promise<ListResult<T>> {
    const query = prepareQuery({
      filters,
      order,
      convertToSnakeCase: this.requester.converToSnakeCase,
      cursor,
    });

    const result = await this.requester.client.get<T[]>(
      `/${this.domain}/dead_list?${query}`,
    );

    return {
      data: result.data,
      cursor: result.headers['x-page-cursor'] || '',
    };
  }

  public async delete(id: string): Promise<void> {
    await this.requester.client.delete(`/${this.domain}/delete/${id}`);
  }

  public async detail(id: string): Promise<T | null> {
    try {
      const result = await this.requester.client.get<T>(`/${this.domain}/detail/${id}`);
      return result.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  }

  public async edit({ 
    id,
    data,
  }: EditPayload<T, Edit>): Promise<void> {
    await this.requester.client.patch(
      `/${this.domain}/edit/${id}`,
      data,
    );
  }

  public async list({
    filters,
    order,
    cursor,
  }: ListPayload<T> = {}): Promise<ListResult<T>> {
    const query = prepareQuery({
      filters,
      order,
      convertToSnakeCase: this.requester.converToSnakeCase,
      cursor,
    });

    const result = await this.requester.client.get<T[]>(
      `/${this.domain}/list?${query}`,
    );

    return {
      data: result.data,
      cursor: result.headers['x-page-cursor'] || '',
    };
  }

  public async listAll({
    filters,
    order,
    cursor: initialCursor
  }: Partial<ListPayload<T>> = {}): Promise<T[]> {
    const data: T[] = [];
    let cursor: string | undefined = initialCursor || undefined;

    do {
      const res = await this.list({ filters, order, cursor });
      data.push(...res.data);

      if (cursor === res.cursor) {
        break;
      }

      cursor = res.cursor;
    } while (cursor);

    return data;
  }

  public async listOne({
    filters,
    order,
  }: ListOnePayload<T> = {}): Promise<T | null> {
    try {
      const query = prepareQuery({
        filters,
        order,
        convertToSnakeCase: this.requester.converToSnakeCase,
      });

      const result = await this.requester.client.get<T>(`/${this.domain}/list_one?${query}`);

      if (!Object.keys(result.data as object).length) {
        return null;
      }

      return result.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  }

  public async selectRaw<T, Params = Record<string, any>>({
    query,
    params,
  }: SelectRawPayload<Params>): Promise<T> {
    const result = await this.requester.client.post<T>(`/${this.domain}/select_raw`, {
      query,
      params,
    });
    return result.data;
  }
}

interface SelectRawPayload<T = Record<string, any>> {
  query: string;
  params?: T;
}