import { createClient } from 'next-sanity';

export const client = createClient({
  projectId: 'c4ogf9zt',
  dataset: 'production',
  apiVersion: '2024-05-02',
  useCdn: true,
});
