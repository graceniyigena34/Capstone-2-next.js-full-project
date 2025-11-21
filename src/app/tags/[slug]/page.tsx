import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { PostCard } from '@/components/posts/PostCard'
import type { Post } from '@/types'

interface TagPageProps {
  params: { slug: string }
}

export default async function TagDetailPage({ params }: TagPageProps) {
  const tag = await prisma.tag.findFirst({
    where: {
      OR: [
        { slug: params.slug },
        { name: params.slug },
      ],
    },
    include: {
      posts: {
        where: { published: true },
        orderBy: { publishedAt: 'desc' },
        include: {
          author: { select: { id: true, name: true, username: true, image: true } },
          tags: true,
          _count: { select: { likes: true, comments: true } },
        },
      },
    },
  })

  if (!tag) {
    notFound()
  }

  const posts = JSON.parse(JSON.stringify(tag.posts)) as Post[]

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      <div className="mb-6 sm:mb-8 lg:mb-10 space-y-2">
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-green-600">Topic</p>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">#{tag.name}</h1>
        <p className="text-sm sm:text-base text-gray-600">
          {tag.posts.length === 1 ? '1 published story' : `${tag.posts.length} published stories`}
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {posts.length === 0 && (
          <div className="rounded-xl sm:rounded-2xl border border-dashed border-gray-300 p-4 sm:p-6 text-sm text-gray-500 text-center">
            No stories yet. Be the first to publish under this tag.
          </div>
        )}
      </div>
    </div>
  )
}

