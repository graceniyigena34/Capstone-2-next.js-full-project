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
    <article className="rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      <header className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
        <span className="font-medium text-gray-900 text-sm sm:text-base">{post.author.name ?? post.author.username}</span>
        <span className="hidden sm:inline">•</span>
        <time dateTime={post.publishedAt ?? post.createdAt} className="text-xs sm:text-sm">
          {formatDistanceToNow(new Date(post.publishedAt ?? post.createdAt), { addSuffix: true })}
        </time>
        <span className="hidden sm:inline">•</span>
        <span className="text-xs sm:text-sm">{post.readTime} min read</span>
      </header>

      <div className="mt-3 sm:mt-4 flex flex-col gap-3 sm:gap-4 lg:flex-row">
        <div className="flex-1 min-w-0">
          <Link href={`/posts/${post.slug}`} className="group block space-y-2 sm:space-y-3">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight text-gray-900 group-hover:text-green-600 transition-colors leading-tight">
              {post.title}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 line-clamp-2 sm:line-clamp-3 leading-relaxed">{post.excerpt}</p>
          </Link>

          {post.tags?.length > 0 && (
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
              {post.tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug ?? tag.name}`}
                  className="rounded-full bg-gray-100 px-2 sm:px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200"
                >
                  #{tag.name}
                </Link>
              ))}
              {post.tags.length > 3 && (
                <span className="text-xs text-gray-500 px-2 py-1">
                  +{post.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {showCover && post.coverImage && (
          <div className="relative h-32 sm:h-40 w-full overflow-hidden rounded-lg sm:rounded-xl lg:h-32 lg:w-48 flex-shrink-0">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 192px"
            />
          </div>
        )}
      </div>

      <footer className="mt-3 sm:mt-4 flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
          {post._count?.likes ?? 0} claps
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
          {post._count?.comments ?? 0}
        </span>
      </footer>
    </article>
  )
}

