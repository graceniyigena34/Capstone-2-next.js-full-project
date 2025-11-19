import Link from 'next/link'
import { prisma } from '@/lib/db'
import { PostCard } from '@/components/posts/PostCard'
import type { Post } from '@/types'

interface ExplorePageProps {
  searchParams?: { q?: string }
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const query = searchParams?.q ?? ''

  const posts = await prisma.post.findMany({
    where: {
      published: true,
      ...(query
        ? {
            OR: [
              { title: { contains: query } },
              { content: { contains: query } },
            ],
          }
        : {}),
    },
    orderBy: { publishedAt: 'desc' },
    include: {
      author: { select: { id: true, name: true, username: true, image: true } },
      tags: true,
      _count: { select: { likes: true, comments: true } },
    },
  })

  const serializedPosts = JSON.parse(JSON.stringify(posts)) as Post[]

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-green-600">Explore</p>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Discover new voices</h1>
          <p className="text-sm text-gray-500">Search topics, tags, and authors.</p>
        </div>
        <form className="flex w-full max-w-sm gap-3" action="/explore" method="get">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search stories"
            className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm focus:border-green-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white"
          >
            Search
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {serializedPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {serializedPosts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-sm text-gray-500">
            No stories matched your search. Try another keyword or{' '}
            <Link href="/tags" className="font-semibold text-green-600">
              browse tags
            </Link>
            .
          </div>
        )}
      </div>
    </div>
  )
}

