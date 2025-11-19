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
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10 space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-600">Topic</p>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">#{tag.name}</h1>
        <p className="text-gray-600">
          {tag.posts.length === 1 ? '1 published story' : `${tag.posts.length} published stories`}
        </p>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {posts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-sm text-gray-500">
            No stories yet. Be the first to publish under this tag.
          </div>
        )}
      </div>
    </div>
  )
}

