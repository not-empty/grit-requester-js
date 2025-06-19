# grit-requester

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

**grit-requester-js** is a javascript library to abstract requests to microservices built using Grit.

Features:

- 🔁 Automatic retry on `401 Unauthorized`
- 🔐 Per-service token cache with concurrency safety
- 💉 Config and HTTP client injection (perfect for testing)
- 📦 Full support for generics (`any`) in request/response
- 🧠 Context-aware: all requests support context.Context for cancellation, timeouts, and APM tracing

---

## ✨ Installation

```bash
npm install "https://github.com/not-empty/grit-requester-js/releases/download/v1.0.0/grit-requester-js-1.0.0.tgz"
```

---

## 🚀 Usage Example

### Configure and do a request
```ts
import { GritRequester } from 'grit-requester-js';

interface IUser {
  id: string;
  name: string;
  email: string;
}

// configure grit requester
const ms = new GritRequester({
  baseUrl: 'http://localhost:8001',
  token: process.env.SERVICE_TOKEN || '',
  secret: process.env.SERVICE_SECRET || '',
  context: process.env.SERVICE_CONTEXT || '',
});

// doing a request
const result = await ms.request<{ id: string }>({
  path: '/user/add',
  method: 'POST',
  body: {
    name: 'example',
    email: 'example@example.com'
  }
});

```

### Make crud requests from a domain

Here you can call a domain passing the type and path to access the following base routers:

| Path             | Description                                |
| -----------------| -------------------------------------------|
| add              | Create a new record                        |
| bulk             | Fetch specific records by IDs              |
| bulkAdd          | Create up to 25 records in the same request|
| deadDetail       | Get a deleted record by ID                 |
| deadList         | List deleted records (paginated)           |
| delete           | Soft-delete a record by ID                 |
| detail           | Get an active record by ID                 |
| edit             | Update specific fields                     |
| list             | List active records (paginated)            |
| listOne          | List one record based on params            |
| selectRaw        | Execute a predefined raw SQL query safely  |

```ts
import { GritRequester } from 'grit-requester-js';

interface IUser {
  id: string;
  name: string;
  email: string;
}

// configure grit requester
const ms = new GritRequester({
  baseUrl: 'http://localhost:8001',
  token: process.env.SERVICE_TOKEN || '',
  secret: process.env.SERVICE_SECRET || '',
  context: process.env.SERVICE_CONTEXT || '',
});

// make a request from domain
const resultFile = await ms.domain<IUser>('user').add({
  name: 'example',
  email: 'example@example.com'
});

```
---

## 🧪 Testing

Run tests:

```bash
npm run test
```

Run test coverage
```bash
npm run coverage:
```

Visualize unit coverage:

```bash
open ./coverage/unit/lcov-report/index.html
```

Visualize feature coverage:

```bash
open ./coverage/feature/lcov-report/index.html
```

## 🔧 License

MIT © [Not Empty](https://github.com/not-empty)

**Not Empty Foundation - Free codes, full minds**