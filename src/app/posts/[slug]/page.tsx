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
  params: Promise<{ slug: string }>
}

export default async function PostPage({ params }: PostPageProps) {
  const session = await getCurrentSession()
  const { slug } = await params

  // Validate slug parameter
  if (!slug || typeof slug !== 'string') {
    notFound()
  }

  const post = await prisma.post.findUnique({
    where: { slug },
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
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {post.author.name?.[0] || post.author.username[0]}
            </div>
            <div>
              <Link href={`/authors/${post.author.username}`} className="font-semibold text-gray-900 hover:text-green-600 transition-colors">
                {post.author.name ?? post.author.username}
              </Link>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <time dateTime={displayDate.toISOString()}>
                  {format(displayDate, 'MMMM d, yyyy')}
                </time>
                <span>•</span>
                <span>{post.readTime} min read</span>
                <span>•</span>
                <span>{post._count.likes} likes</span>
                <span>•</span>
                <span>{post._count.comments} comments</span>
              </div>
            </div>
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

        <div className="bg-gray-50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Story Stats</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{post._count.likes}</div>
              <div className="text-sm text-gray-500">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{post._count.comments}</div>
              <div className="text-sm text-gray-500">Comments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{post.readTime}</div>
              <div className="text-sm text-gray-500">Min Read</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{format(displayDate, 'MMM d')}</div>
              <div className="text-sm text-gray-500">Published</div>
            </div>
          </div>
          <div className="mt-4">
            <LikeButton
              slug={post.slug}
              initialCount={post._count?.likes ?? 0}
              initiallyLiked={viewerLike}
            />
          </div>
        </div>

        {post.tags.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug ?? tag.name}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 hover:from-green-200 hover:to-emerald-200 transition-all duration-200"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <section className="mt-8 sm:mt-12 bg-white rounded-2xl p-6 border border-gray-200">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Discussion ({serializedComments.length})</h2>
        <CommentThread postSlug={post.slug} initialComments={serializedComments} />
      </section>
    </div>
  )
}

