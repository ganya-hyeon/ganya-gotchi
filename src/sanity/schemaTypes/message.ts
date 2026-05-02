import { defineType, defineField } from 'sanity';

export const message = defineType({
  name: 'message',
  title: 'Signal Message',
  type: 'document',
  fields: [
    defineField({
      name: 'id',
      title: 'Message ID',
      type: 'string',
    }),
    defineField({
      name: 'timestamp',
      title: 'Timestamp',
      type: 'datetime',
    }),
    defineField({
      name: 'role',
      title: 'Sender Role',
      type: 'string',
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'text',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'New', value: 'unread' },
          { title: 'Read', value: 'read' },
        ],
      },
    }),
  ],
});
