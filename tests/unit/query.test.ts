import { prepareFilter } from "../../src/query";
import { FilterType } from "../../src/types";

describe("query", () => {
  it("simple filter", () => {
    const filters = prepareFilter([
      { field: 'name', type: FilterType.FILTER_EQUAL, value: 'example' }
    ]);

    expect(filters[0]).toEqual('filter=name:eql:example');
  });

  it("all type filters", () => {
    const filters = prepareFilter([
      { field: 'age', type: FilterType.FILTER_BETWEEN, value: '18,25' },
      { field: 'name', type: FilterType.FILTER_EQUAL, value: 'example' },
      { field: 'age', type: FilterType.FILTER_GREATER_THAN, value: '18' },
      { field: 'age', type: FilterType.FILTER_GREATER_THAN_OR_EQUAL, value: '18' },
      { field: 'id', type: FilterType.FILTER_IN, value: '1,2,3' },
      { field: 'age', type: FilterType.FILTER_LESS_THAN, value: '15' },
      { field: 'age', type: FilterType.FILTER_LESS_THAN_OR_EQUAL, value: '15' },
      { field: 'name', type: FilterType.FILTER_LIKE, value: 'exam' },
      { field: 'name', type: FilterType.FILTER_NOT_EQUAL, value: 'another example' },
      { field: 'name', type: FilterType.FILTER_NOT_NULL },
      { field: 'name', type: FilterType.FILTER_NULL },
    ]);

    expect(filters[0]).toEqual('filter=age:btw:18,25');
    expect(filters[1]).toEqual('filter=name:eql:example');
    expect(filters[2]).toEqual('filter=age:gt:18');
    expect(filters[3]).toEqual('filter=age:gte:18');
    expect(filters[4]).toEqual('filter=id:in:1,2,3');
    expect(filters[5]).toEqual('filter=age:lt:15');
    expect(filters[6]).toEqual('filter=age:lte:15');
    expect(filters[7]).toEqual('filter=name:lik:exam');
    expect(filters[8]).toEqual('filter=name:neq:another example');
    expect(filters[9]).toEqual('filter=name:nnu:undefined');
    expect(filters[10]).toEqual('filter=name:nul:undefined');
  });
});