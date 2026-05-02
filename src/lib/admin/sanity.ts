import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: 'c4ogf9zt',
  dataset: 'production',
  apiVersion: '2024-05-02',
  useCdn: false,
  token: process.env.NEXT_PUBLIC_SANITY_WRITE_TOKEN,
});

export const fetchProjects = async () => {
  const query = `*[_type == "project"] | order(year desc)`;
  return await client.fetch(query);
};

export const fetchMessages = async () => {
  const query = `*[_type == "message"] | order(timestamp desc)`;
  return await client.fetch(query);
};
