import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' } }),
    defineField({ name: 'pillar', type: 'reference', to: [{ type: 'pillar' }] }),
    defineField({ name: 'excerpt', type: 'text' }),
    defineField({ name: 'body', type: 'array', of: [{ type: 'block' }] }),
    defineField({ 
      name: 'heroImage', 
      type: 'image', 
      options: { hotspot: true },
      description: 'Upload an image or use the image URL field for AI automation'
    }),
    defineField({ name: 'status', type: 'string', options: { list: ['queued','draft','review','approved','published'] }, initialValue: 'queued' }),
    defineField({ name: 'scheduledAt', type: 'datetime' }),
    defineField({ name: 'seoTitle', type: 'string' }),
    defineField({ name: 'seoDescription', type: 'text' }),
  ],
});
