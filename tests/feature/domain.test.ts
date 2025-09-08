import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { GritRequester } from "../../src/grit-requester";
import { FilterType } from "../../src/types";

interface IUser {
  id: string;
  name: string;
}

const server = setupServer(
  http.post("http://api.grit/auth/generate", async ({ request }) => {
    const body = await request.json() as { token: string, secret: string };
    if (body.token === 'user' && body.secret === '123') {
      return HttpResponse.json({}, {
        status: 200,
        headers: {
          'x-expires': '2025-01-01 00:00:00',
          'x-token': '12345',
          'content-type': 'application/json',
        },
      });
    }

    return HttpResponse.json({}, { status: 401 });
  }),
  http.post("http://api.grit/user/add", async ({ request }) => {
    const body = await request.json() as IUser;
    if (body.name === 'example 1') {
      return HttpResponse.json({
        id: '1',
      });
    }

    return HttpResponse.error();
  }),
  http.post("http://api.grit/user/bulk_add",async ({}) => {
    return HttpResponse.json({
      ids: ['2', '3']
    });
  }),
  http.post("http://api.grit/user/bulk",async ({ request }) => {
    const body = await request.json() as { ids: string[] };
    const url = new URL(request.url);
    const cursor = url.searchParams.get("page_cursor");

    return HttpResponse.json(body.ids.map((id) => ({ id, name: `example ${id}` })), {
      headers: cursor ? { 'x-page-cursor': cursor } : {}
    });
  }),
  http.get("http://api.grit/user/detail/:id", ({ params }) => {
    if (params.id === '1') {
      return HttpResponse.json({
        id: params.id,
        name: 'example 1'
      });
    }

    return HttpResponse.json({}, { status: 404 });
  }),
  http.get("http://api.grit/user/dead_detail/:id", ({ params }) => {
    if (params.id === '4') {
      return HttpResponse.json({
        id: params.id,
        name: 'example 4'
      });
    }

    return HttpResponse.json({}, { status: 404 });
  }),
  http.get("http://api.grit/user/dead_list", ({ request }) => {
    const url = new URL(request.url);
    const filter = url.searchParams.get("filter");
  
    if (filter === "name:eql:example 4") {
      return HttpResponse.json([{ id: '4', name: "example 4" }]);
    }
  
    return HttpResponse.json([
      { id: '4', name: "example 4" },
      { id: '5', name: "example 5" },
    ]);
  }),
  http.delete("http://api.grit/user/delete/:id", ({ params }) => {
    if (params.id === '1') {
      return HttpResponse.json({}, { status: 200 });
    }
  
    return HttpResponse.json({}, { status: 401 });
  }),
  http.patch("http://api.grit/user/edit/:id", async ({ request, params }) => {
    const body = await request.json() as Partial<IUser>;
    if (params.id === '1' && body.name === 'example 1 edit') {
      return HttpResponse.json({}, { status: 200 });
    }

    return HttpResponse.json({}, { status: 404 });
  }),
  http.get("http://api.grit/user/list", ({ request }) => {
    const url = new URL(request.url);
    const filter = url.searchParams.get("filter");
  
    if (filter === "name:eql:example") {
      return HttpResponse.json([{ id: '1', name: "example" }]);
    }
  
    return HttpResponse.json([
      { id: '1', name: "example 1" },
      { id: '2', name: "example 2" },
    ]);
  }),

  http.post("http://api.grit/user/select_raw", async ({ request }) => {
    const body =  await request.json() as { query: string };
  
    if (body.query === "count") {
      return HttpResponse.json([{ total: 5 }]);
    }
  
    return HttpResponse.json({}, { status: 401 });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const ms = new GritRequester({
  baseUrl: 'http://api.grit',
  token: 'user',
  secret: '123',
  context: 'general',
});

describe("domain", () => {
  it("add", async () => {
    const { id } = await ms.domain<IUser>('user').add({
      name: 'example 1'
    });

    expect(id).toEqual('1');
  });

  it("bulk", async () => {
    const users = await ms.domain<IUser>('user').bulk({ ids: ['1', '2', '3'] });

    expect(users.data.length).toEqual(3);
    expect(users.data[2].name).toEqual('example 3');
  });

  it("bulk with cursor", async () => {
    const users = await ms.domain<IUser>('user').bulk({ 
      ids: ['1', '2', '3'], 
      cursor: 'test-cursor' 
    });

    expect(users.data.length).toEqual(3);
    expect(users.data[2].name).toEqual('example 3');
  });

  it("bulk-add", async () => {
    const { ids } = await ms.domain<IUser>('user').bulkAdd([
      { name: 'example 2' },
      { name: 'example 3' },
    ]);

    expect(ids.length).toEqual(2);
  });

  it("detail", async () => {
    const user = await ms.domain<IUser>('user').detail('1');

    expect(user).not.toBe(null);
    expect((user as IUser).name).toEqual('example 1');
  });

  it("dead detail", async () => {
    const user = await ms.domain<IUser>('user').deadDetail('4');

    expect(user).not.toBe(null);
    expect((user as IUser).name).toEqual('example 4');
  });

  it("list", async () => {
    const users = await ms.domain<IUser>('user').list({});
    expect(users.data.length).toEqual(2);

    const usersFiltered = await ms.domain<IUser>('user').list({
      filters: [{ field: 'name', type: FilterType.FILTER_EQUAL, value: 'example' }],
    });

    expect(usersFiltered.data.length).toEqual(1);
    expect(usersFiltered.data[0].name).toEqual('example');
  });

  it("dead list", async () => {
    const users = await ms.domain<IUser>('user').deadList({});
    expect(users.data.length).toEqual(2);

    const usersFiltered = await ms.domain<IUser>('user').deadList({
      filters: [{ field: 'name', type: FilterType.FILTER_EQUAL, value: 'example 4' }],
    });

    expect(usersFiltered.data.length).toEqual(1);
    expect(usersFiltered.data[0].name).toEqual('example 4');
  });

  it("delete", async () => {
    await ms.domain<IUser>('user').delete('1');
  });

  it("edit", async () => {
    await ms.domain<IUser>('user').edit({
      id: '1',
      data: {
        name: 'example 1 edit'
      }
    });
  });

  it("edit", async () => {
    const result = await ms.domain<IUser>('user').selectRaw<{ total: number }[]>({
      query: 'count',
    });

    expect(result[0].total).toEqual(5);
  });
});