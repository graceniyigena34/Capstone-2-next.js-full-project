import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { Post } from '@/types'

interface PostCardProps {
  post: Post
  variant?: 'default' | 'compact'
}

export function PostCard({ post, variant = 'default' }: PostCardProps) {
  const showCover = variant === 'default' && Boolean(post.coverImage)

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <header className="flex items-center gap-2 text-sm text-gray-500">
        <span className="font-medium text-gray-900">{post.author.name ?? post.author.username}</span>
        <span>•</span>
        <time dateTime={post.publishedAt ?? post.createdAt}>
          {formatDistanceToNow(new Date(post.publishedAt ?? post.createdAt), { addSuffix: true })}
        </time>
        <span>•</span>
        <span>{post.readTime} min read</span>
      </header>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row">
        <div className="flex-1">
          <Link href={`/posts/${post.slug}`} className="group block space-y-3">
            <h3 className="text-2xl font-semibold tracking-tight text-gray-900 group-hover:text-green-600">
              {post.title}
            </h3>
            <p className="text-gray-600 line-clamp-3">{post.excerpt}</p>
          </Link>

          {post.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug ?? tag.name}`}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {showCover && post.coverImage && (
          <div className="relative h-40 w-full overflow-hidden rounded-xl lg:h-32 lg:w-48">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
      </div>

      <footer className="mt-4 flex items-center gap-4 text-sm text-gray-500">
        <span>{post._count?.likes ?? 0} claps</span>
        <span>{post._count?.comments ?? 0} comments</span>
      </footer>
    </article>
  )
}

