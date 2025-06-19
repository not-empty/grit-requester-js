import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { GritRequester } from "../../src/grit-requester";

const server = setupServer(
  http.post("http://api.grit/auth/generate", () => {
    return HttpResponse.json({}, {
      status: 200,
      headers: {
        'x-expires': '2025-01-01 00:00:00',
        'x-token': '12345',
        'content-type': 'application/json',
      },
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("auth", () => {
  it("generate auth token", async () => {
    const ms = new GritRequester({
      baseUrl: 'http://api.grit',
      token: 'user',
      secret: '123',
      context: 'general',
    });

    await ms.auth();

    expect(ms.accessToken).toEqual('12345');
  });
});