import { MetadataRoute } from 'next';
import { client } from '@/lib/sanity.client';

const SITE_URL = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://barelyfunctionalco.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const posts = await client.fetch(`
      *[_type == "post" && status == "approved"] | order(publishedAt desc) {
        "slug": slug.current,
        publishedAt,
        _updatedAt
      }
    `);

    const pillars = await client.fetch(`
      *[_type == "pillar"] {
        "slug": slug.current,
        _updatedAt
      }
    `);

    const postEntries: MetadataRoute.Sitemap = posts.map((post: any) => ({
      url: `${SITE_URL}/posts/${post.slug}`,
      lastModified: post._updatedAt || post.publishedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const pillarEntries: MetadataRoute.Sitemap = pillars.map((pillar: any) => ({
      url: `${SITE_URL}/pillars/${pillar.slug}`,
      lastModified: pillar._updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [
      {
        url: SITE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${SITE_URL}/posts`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      ...postEntries,
      ...pillarEntries,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [
      {
        url: SITE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ];
  }
}
