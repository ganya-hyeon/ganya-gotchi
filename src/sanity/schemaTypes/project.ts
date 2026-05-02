export const project = {
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    {
      name: 'projectId',
      title: 'Project ID',
      type: 'string',
    },
    {
      name: 'name',
      title: 'Project Name',
      type: 'string',
    },
    {
      name: 'cat',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'UX/UI', value: 'ux' },
          { title: 'Video/Motion', value: 'vid' },
          { title: '3D/Dev', value: '3d' },
        ],
      },
    },
    {
      name: 'client',
      title: 'Client',
      type: 'string',
    },
    {
      name: 'year',
      title: 'Year',
      type: 'string',
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'DONE', value: 'done' },
          { title: 'WIP', value: 'wip' },
        ],
      },
    },
    {
      name: 'thumbnail',
      title: 'Thumbnail URL',
      type: 'string',
      description: 'Public URL of the image'
    },
    {
      name: 'desc',
      title: 'Description',
      type: 'object',
      fields: [
        { name: 'background', title: 'Background', type: 'text' },
        { name: 'thinking', title: 'Thinking', type: 'text' },
        { name: 'challenge', title: 'Challenge', type: 'text' },
      ]
    },
    {
      name: 'roles',
      title: 'Roles',
      type: 'array',
      of: [{ type: 'string' }]
    },
    {
      name: 'outcomes',
      title: 'Outcomes',
      type: 'array',
      of: [{ type: 'string' }]
    },
    {
      name: 'meta',
      title: 'Meta Data',
      type: 'object',
      fields: [
        { name: 'period', title: 'Period', type: 'string' },
        { name: 'team', title: 'Team', type: 'string' },
        { name: 'tool', title: 'Tool', type: 'string' },
      ]
    },
    {
      name: 'size',
      title: 'Grid Size',
      type: 'number',
      initialValue: 3
    }
  ],
};
