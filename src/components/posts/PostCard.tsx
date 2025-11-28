'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { useEffect, useState } from 'react'
import type { Post } from '@/types'

interface PostCardProps {
  post: Post
  variant?: 'default' | 'compact'
}

export function PostCard({ post, variant = 'default' }: PostCardProps) {
  const [mounted, setMounted] = useState(false)
  const showCover = variant === 'default' && Boolean(post.coverImage)

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Recently'
    }
  }

  return (
    <article className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-xl hover:border-green-200 transition-all duration-300 transform hover:-translate-y-1">
      <header className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {post.author.name?.[0] || post.author.username?.[0] || 'U'}
        </div>
        <div className="flex-1">
          <Link href={`/authors/${post.author.username}`} className="font-semibold text-gray-900 hover:text-green-600 transition-colors">
            {post.author.name ?? post.author.username}
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <time dateTime={post.publishedAt ?? post.createdAt}>
              {mounted ? formatDate(post.publishedAt ?? post.createdAt) : 'Loading...'}
            </time>
            <span>•</span>
            <span>{post.readTime} min read</span>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <Link href={`/posts/${post.slug}`} className="block space-y-3">
            <h3 className="text-xl lg:text-2xl font-bold tracking-tight text-gray-900 group-hover:text-green-600 transition-colors leading-tight line-clamp-2">
              {post.title}
            </h3>
            <p className="text-gray-600 line-clamp-3 leading-relaxed">
              {post.excerpt?.replace(/<[^>]*>/g, '') || 'No excerpt available'}
            </p>
          </Link>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${encodeURIComponent(tag.slug ?? tag.name)}`}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-800 transition-colors"
                >
                  #{tag.name.replace(/<[^>]*>/g, '')}
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
          <Link href={`/posts/${post.slug}`} className="block">
            <div className="relative h-32 w-full overflow-hidden rounded-xl lg:h-32 lg:w-48 flex-shrink-0">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 192px"
              />
            </div>
          </Link>
        )}
      </div>

      <footer className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <Link href={`/posts/${post.slug}`} className="flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer">
            ❤️ {post._count?.likes ?? 0}
          </Link>
          <Link href={`/posts/${post.slug}#comments`} className="flex items-center gap-1.5 hover:text-blue-500 transition-colors cursor-pointer">
            💬 {post._count?.comments ?? 0}
          </Link>
        </div>
        <Link 
          href={`/posts/${post.slug}`}
          className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
        >
          Read more →
        </Link>
      </footer>
    </article>
  )
}

