import Link from 'next/link'
import { prisma } from '@/lib/db'
import type { Post } from '@/types'
import { HomeFeed } from '@/components/posts/HomeFeed'

type LatestPostsResult = Awaited<ReturnType<typeof prisma.post.findMany>>
type TrendingTagsResult = Awaited<ReturnType<typeof prisma.tag.findMany>>

export default async function Home() {
  const [latestPosts, trendingTags] = (await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      take: 6,
      orderBy: { publishedAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, username: true, image: true },
        },
        tags: true,
        _count: {
          select: { likes: true, comments: true },
        },
      },
    }),
    prisma.tag.findMany({
      take: 10,
      orderBy: { name: 'asc' },
    }),
  ])) as [LatestPostsResult, TrendingTagsResult]

  const serializedPosts = JSON.parse(JSON.stringify(latestPosts)) as Post[]

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 sm:gap-8 lg:gap-12 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 xl:flex-row">
      <div className="flex-1 space-y-6 sm:space-y-8 lg:space-y-12">
        <section className="rounded-2xl sm:rounded-3xl bg-white p-6 sm:p-8 lg:p-10 shadow-sm ring-1 ring-gray-100">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-green-600">
            STORYPRESS
          </p>
          <h1 className="mt-2 sm:mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
            Where ideas take shape.
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-600 leading-relaxed">
            Publish thoughtful stories, follow your favorite authors, and build your personal corner
            of the internet.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href="/editor"
              className="rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white text-center hover:bg-gray-800 transition-colors"
            >
              Start writing
            </Link>
            <Link
              href="/explore"
              className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-900 text-center hover:bg-gray-50 transition-colors"
            >
              Browse stories
            </Link>
          </div>
        </section>

        <section className="space-y-4 sm:space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Latest from the community</h2>
            <p className="text-sm sm:text-base text-gray-500 mt-1">
              Fresh perspectives from authors you follow and trending voices
            </p>
          </div>
          <HomeFeed initialPosts={serializedPosts} />
        </section>
      </div>

      <aside className="w-full xl:max-w-sm space-y-4 sm:space-y-6 xl:sticky xl:top-24 xl:h-fit">
        <div className="rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
          <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-gray-500">Trending</h3>
          <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
            {trendingTags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug ?? tag.name}`}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
            {trendingTags.length === 0 && (
              <p className="text-xs sm:text-sm text-gray-500">Tags will appear as you start publishing.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl sm:rounded-2xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-4 sm:p-6 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Join the creator program</h3>
          <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
            Publish consistently, build an audience, and unlock insights about how your stories are
            performing.
          </p>
          <Link
            href="/signup"
            className="mt-3 sm:mt-4 inline-flex w-full sm:w-auto justify-center rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition-colors"
          >
            Create your account
          </Link>
        </div>
      </aside>
    </div>
  )
}
