import Link from 'next/link'
import Image from 'next/image'
import { client } from '../../lib/sanity.client'
import { urlFor } from '../../lib/sanity.image'

type PostListItem = {
  _id: string
  title: string
  slug: { current: string }
  pillar?: { title: string }
  heroImage?: any
}

function getImageUrl(heroImage: any): string | null {
  if (!heroImage) return null;
  if (typeof heroImage === 'string') return heroImage;
  if (heroImage.asset) return urlFor(heroImage).width(800).height(400).url();
  return null;
}

export const revalidate = 60

export default async function PostsIndex() {
  const posts: PostListItem[] = await client.fetch(
    `*[_type=="post"] | order(_createdAt desc){
      _id, title, slug, pillar->{title}, heroImage
    }`
  )

  if (!posts?.length) {
    return (
      <section>
        <h1 className="text-3xl font-bold">All Posts</h1>
        <p className="mt-4 text-zinc-600">No posts yet — publish one in Studio.</p>
        <p className="mt-6"><Link className="underline" href="/">← Back</Link></p>
      </section>
    )
  }

  return (
    <section>
      <h1 className="text-3xl font-bold">All Posts</h1>
      <div className="mt-6 space-y-6">
        {posts.map((p) => (
          <div key={p._id} className="border-b pb-6">
            {getImageUrl(p.heroImage) && (
              <div className="mb-3">
                <Image 
                  src={getImageUrl(p.heroImage)!} 
                  alt={p.title} 
                  width={800} 
                  height={400} 
                  className="rounded-lg"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            )}
            <div>
              {p.slug?.current ? (
                <Link className="underline text-lg font-semibold" href={`/posts/${p.slug.current}`}>{p.title}</Link>
              ) : (
                <span className="text-lg font-semibold">{p.title} (no slug)</span>
              )}
              {p.pillar?.title && <span className="text-sm text-zinc-500 ml-2">— {p.pillar.title}</span>}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6"><Link className="underline" href="/">← Back</Link></p>
    </section>
  )
}
