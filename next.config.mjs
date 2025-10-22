/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },           // Sanity-hosted images
      { protocol: 'https', hostname: 'images.unsplash.com' },     // (in case you ever use direct Unsplash)
      { protocol: 'https', hostname: 'source.unsplash.com' }
    ],
  },
};

export default nextConfig;
