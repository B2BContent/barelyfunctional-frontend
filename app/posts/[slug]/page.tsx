export const revalidate = 60;
import { client } from '../../../lib/sanity.client'
import { PortableText } from '@portabletext/react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type Post = {
  title: string
  slug: { current: string }
  pillar?: { title: string }
  content?: any
  affiliateLink?: string
}


async function getPost(slug: string): Promise<Post | null> {
  return client.fetch(
    `*[_type=="post" && slug.current==$slug][0]{
      title, slug, pillar->{title}, content, affiliateLink
    }`,
    { slug }
  )
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  if (!post) return notFound()

  return (
    <article className="prose-bf">
      <h1>{post.title}</h1>
      {post.pillar?.title && <p><em>Pillar: {post.pillar.title}</em></p>}

      {post.affiliateLink && (
        <p>
          <a className="link" href={post.affiliateLink} target="_blank" rel="noopener noreferrer">
            Recommended tool (affiliate)
          </a>
        </p>
      )}

      <div className="mt-6">
        {post.content ? <PortableText value={post.content} /> : <p className="text-bf-sub">This post has no content yet.</p>}
      </div>

      <p><a className="link" href="/posts">← All posts</a></p>
    </article>
  )
}
