import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'affiliateRedirect',
  title: 'Affiliate Redirect',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string' }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'name' } }),
    defineField({ name: 'targetUrl', type: 'url' }),
    defineField({ name: 'notes', type: 'text' })
  ],
});
