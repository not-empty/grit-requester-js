
import { GritRequester } from '../src/grit-requester';
import { FilterType } from '../src/types';

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

// save user domain context
const user = ms.domain<IUser>('user');

async function main() {
  const { id } = await user.add({
    name: 'example',
    email: 'example@example.com'
  });

  const userDetail = await user.detail(id);

  await user.edit({
    id,
    data: {
      email: 'example-change@example',
    }
  });

  const users = await user.list({
    filters: [
      { field: 'name', type: FilterType.FILTER_EQUAL, value: 'example' },
    ]
  });

  await user.delete(id);
}

main();
