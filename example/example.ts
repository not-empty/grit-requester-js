
import { GritRequester } from '../src/grit-requester';

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

// make a request from domain
const resultFile = await ms.domain<IUser>('user').add({
  name: 'example',
  email: 'example@example.com'
});

// you can save the domain context to reuse
const user = ms.domain<IUser>('user');
