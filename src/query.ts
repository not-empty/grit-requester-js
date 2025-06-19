import { toSnakeCase } from './utils/convertCase';
import { Filter, OrderBy, ListPayload, ListResult } from './types';

export const prepareFilter = <T>(
  filters?: Filter<T>[],
  shouldConvertToSnakeCase = false,
): string[] => {
  if (!filters) return [];
  return filters.map(
    (filter) => {
      if (shouldConvertToSnakeCase) {
        const filterName = toSnakeCase(filter.field);
        return `filter=${filterName}:${filter.type || 'eql'}:${filter.value}`;
      }
      return `filter=${filter.field}:${filter.type || 'eql'}:${filter.value}`;
    },
  );
};

export const prepareOrder = <T>(
  order?: OrderBy<T>,
  shouldConvertToSnakeCase = false,
): string[] => {
  if (!order) return [];

  if (shouldConvertToSnakeCase) {
    return [
      `order_by=${toSnakeCase(order.field)}`,
      `order=${order.type}`,
    ];
  }

  return [`order_by=${order.field}`, `order=${order.type}`];
};

export const prepareQuery = <T>(payload?: { convertToSnakeCase?: boolean; } & ListPayload<T>): string => {
  if (!payload) return '';
  const query: string[] = [];

  if (payload.cursor) {
    query.push(`page_cursor=${payload.cursor}`);
  }

  query.push(...prepareFilter(payload.filters, payload.convertToSnakeCase));
  query.push(...prepareOrder(payload.order, payload.convertToSnakeCase));
  if (payload.cursor) {
    query.push(`page_cursor=${payload.cursor}`);
  }

  return query.join('&');
};
