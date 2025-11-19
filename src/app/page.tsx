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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-12 lg:flex-row">
      <div className="flex-1 space-y-12">
        <section className="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
            STORYPRESS
          </p>
          <h1 className="mt-3 text-5xl font-bold tracking-tight text-gray-900">
            Where ideas take shape.
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            Publish thoughtful stories, follow your favorite authors, and build your personal corner
            of the internet.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/editor"
              className="rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white"
            >
              Start writing
            </Link>
            <Link
              href="/signup"
              className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-900"
            >
              Browse stories
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Latest from the community</h2>
            <p className="text-sm text-gray-500">
              Fresh perspectives from authors you follow and trending voices
            </p>
          </div>
          <HomeFeed initialPosts={serializedPosts} />
        </section>
      </div>

      <aside className="w-full max-w-sm space-y-6 lg:sticky lg:top-24">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Trending</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {trendingTags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug ?? tag.name}`}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
              >
                #{tag.name}
              </Link>
            ))}
            {trendingTags.length === 0 && (
              <p className="text-sm text-gray-500">Tags will appear as you start publishing.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Join the creator program</h3>
          <p className="mt-2 text-sm text-gray-600">
            Publish consistently, build an audience, and unlock insights about how your stories are
            performing.
          </p>
          <Link
            href="/signup"
            className="mt-4 inline-flex rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
          >
            Create your account
          </Link>
        </div>
      </aside>
    </div>
  )
}
