import Link from 'next/link'
import { prisma } from '@/lib/db'
import { PostCard } from '@/components/posts/PostCard'
import type { Post } from '@/types'

interface ExplorePageProps {
  searchParams?: { q?: string }
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const query = searchParams?.q ?? ''

  // Get recently published posts (last 24 hours) for highlighting
  const recentlyPublished = await prisma.post.findMany({
    where: {
      published: true,
      publishedAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    include: {
      author: { select: { id: true, name: true, username: true, image: true } },
      tags: true,
      _count: { select: { likes: true, comments: true } },
    },
  })

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
  const serializedRecentPosts = JSON.parse(JSON.stringify(recentlyPublished)) as Post[]

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

      {/* Recently Published Section */}
      {!query && serializedRecentPosts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <h2 className="text-lg font-semibold text-gray-900">Recently Published</h2>
            <span className="text-xs text-gray-500">New stories in the last 24 hours</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {serializedRecentPosts.map((post) => (
              <div key={post.id} className="relative">
                <div className="absolute -top-2 -right-2 z-10">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    New
                  </span>
                </div>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {query ? `Search Results for "${query}"` : 'All Stories'}
        </h2>
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

