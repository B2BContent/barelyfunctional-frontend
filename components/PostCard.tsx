import Link from "next/link";
import Image from "next/image";
import { urlFor } from "../lib/sanity.image";

type Props = {
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: any;
  publishedAt?: string;
};

export default function PostCard({ title, slug, excerpt, featuredImage, publishedAt }: Props) {
  const date = publishedAt ? new Date(publishedAt).toLocaleDateString() : "";
  return (
    <article className="card overflow-hidden hover:-translate-y-0.5 transition">
      {featuredImage && (
        <div className="relative aspect-[16/9]">
          <Image
            src={urlFor(featuredImage).width(1200).height(675).fit("crop").url()}
            alt={title}
            fill
            sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="p-5">
        <time className="block text-xs text-bf-sub">{date}</time>
        <h3 className="mt-1 text-lg font-semibold leading-tight">
          <Link className="hover:text-bf-teal" href={`/posts/${slug}`}>{title}</Link>
        </h3>
        {excerpt && <p className="mt-2 text-sm text-bf-sub line-clamp-3">{excerpt}</p>}
        <Link className="mt-3 inline-block text-sm text-bf-teal" href={`/posts/${slug}`}>Read more →</Link>
      </div>
    </article>
  );
}
