import { createClient } from 'next-sanity';

export const client = createClient({
  projectId: 'c4ogf9zt',
  dataset: 'production',
  apiVersion: '2024-05-02',
  useCdn: false, // Set to false for writes
  token: process.env.SANITY_WRITE_TOKEN,
});
