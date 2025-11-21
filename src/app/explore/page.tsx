import Link from 'next/link'
import { prisma } from '@/lib/db'
import { PostCard } from '@/components/posts/PostCard'
import type { Post } from '@/types'

interface ExplorePageProps {
  searchParams?: Promise<{ q?: string }>
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const resolvedSearchParams = await searchParams
  const query = resolvedSearchParams?.q ?? ''

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
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-green-600">Explore</p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 mt-1">Discover new voices</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Search topics, tags, and authors.</p>
        </div>
        <form className="flex w-full lg:max-w-sm gap-2 sm:gap-3" action="/explore" method="get">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search stories"
            className="flex-1 rounded-full border border-gray-200 px-3 sm:px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
          />
          <button
            type="submit"
            className="rounded-full bg-gray-900 px-4 sm:px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors flex-shrink-0"
          >
            <span className="hidden sm:inline">Search</span>
            <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Recently Published Section */}
      {!query && serializedRecentPosts.length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recently Published</h2>
            </div>
            <span className="text-xs sm:text-sm text-gray-500">New stories in the last 24 hours</span>
          </div>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
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

      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          {query ? `Search Results for "${query}"` : 'All Stories'}
        </h2>
        <div className="space-y-4 sm:space-y-6">
          {serializedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        {serializedPosts.length === 0 && (
          <div className="rounded-xl sm:rounded-2xl border border-dashed border-gray-300 p-4 sm:p-6 text-sm sm:text-base text-gray-500 text-center">
            No stories matched your search. Try another keyword or{' '}
            <Link href="/tags" className="font-semibold text-green-600 hover:text-green-700">
              browse tags
            </Link>
            .
          </div>
        )}
      </div>
    </div>
  )
}

