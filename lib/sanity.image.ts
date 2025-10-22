import createImageUrlBuilder from '@sanity/image-url'
import type { Image } from 'sanity'

const projectId = process.env.SANITY_PROJECT_ID!
const dataset = process.env.SANITY_DATASET!

const builder = createImageUrlBuilder({ projectId, dataset })

export function urlFor(source: Image) {
  return builder.image(source)
}
