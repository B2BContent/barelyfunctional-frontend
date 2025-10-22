import { MetadataRoute } from 'next';

const SITE_URL = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://barelyfunctionalco.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/studio/', '/admin/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
