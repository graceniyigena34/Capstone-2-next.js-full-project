import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { prisma } from '@/lib/db'
import { getCurrentSession } from '@/lib/auth'
import { CommentThread } from '@/components/comments/CommentThread'
import { LikeButton } from '@/components/posts/LikeButton'
import type { Comment } from '@/types'

interface PostPageProps {
  params: { slug: string }
}

export default async function PostPage({ params }: PostPageProps) {
  const session = await getCurrentSession()

  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          bio: true,
          image: true,
        },
      },
      tags: true,
      comments: {
        where: { parentId: null },
        include: {
          author: {
            select: { id: true, name: true, username: true, image: true },
          },
          replies: {
            include: {
              author: { select: { id: true, name: true, username: true, image: true } },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
      _count: {
        select: { likes: true, comments: true },
      },
    },
  })

  if (!post) {
    notFound()
  }

  if (!post.published && post.authorId !== session?.user?.id) {
    notFound()
  }

  const serializedComments = JSON.parse(JSON.stringify(post.comments)) as Comment[]
  const displayDate = post.publishedAt ?? post.createdAt
  const viewerLike = session?.user?.id
    ? Boolean(
        await prisma.like.findUnique({
          where: {
            userId_postId: {
              userId: session.user.id,
              postId: post.id,
            },
          },
        }),
      )
    : false

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      <article className="space-y-6 sm:space-y-8">
        <header className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3 text-sm text-gray-500">
            <Link href={`/authors/${post.author.username}`} className="font-semibold text-gray-900 text-base sm:text-sm">
              {post.author.name ?? post.author.username}
            </Link>
            <span className="hidden sm:inline">•</span>
            <time dateTime={displayDate.toISOString()} className="text-sm">
              {format(displayDate, 'MMMM d, yyyy')}
            </time>
            <span className="hidden sm:inline">•</span>
            <span className="text-sm">{post.readTime} min read</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 leading-tight">{post.title}</h1>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">{post.excerpt}</p>
          </div>

          {post.coverImage && (
            <div className="overflow-hidden rounded-2xl sm:rounded-3xl">
              <Image
                src={post.coverImage}
                alt={post.title}
                width={1200}
                height={600}
                className="h-48 sm:h-64 lg:h-80 w-full object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 896px"
              />
            </div>
          )}
        </header>

        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none prose-headings:font-semibold prose-a:text-green-600 prose-img:rounded-xl">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        <div className="rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm">
          <LikeButton
            slug={post.slug}
            initialCount={post._count?.likes ?? 0}
            initiallyLiked={viewerLike}
          />
          <p className="mt-2 text-xs sm:text-sm text-gray-500">
            {post._count?.comments ?? serializedComments.length} comments
          </p>
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-4 sm:pt-6">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug ?? tag.name}`}
                className="rounded-full bg-gray-100 px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </article>

      <section className="mt-8 sm:mt-12 border-t border-gray-200 pt-6 sm:pt-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Discussion</h2>
        <CommentThread postSlug={post.slug} initialComments={serializedComments} />
      </section>
    </div>
  )
}

