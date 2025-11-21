import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getCurrentSession } from '@/lib/auth'
import type { Post } from '@/types'
import { PostCard } from '@/components/posts/PostCard'

type LatestPostsResult = Awaited<ReturnType<typeof prisma.post.findMany>>
type TrendingTagsResult = Awaited<ReturnType<typeof prisma.tag.findMany>>

export default async function Home() {
  const [session, latestPosts, trendingTags, featuredPost] = (await Promise.all([
    getCurrentSession(),
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
      where: {
        posts: {
          some: {
            published: true
          }
        }
      },
      take: 10,
      orderBy: { name: 'asc' },
    }),
    prisma.post.findFirst({
      where: { published: true },
      orderBy: { likes: { _count: 'desc' } },
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
  ])) as [Awaited<ReturnType<typeof getCurrentSession>>, LatestPostsResult, TrendingTagsResult, LatestPostsResult[0]]

  const serializedPosts = JSON.parse(JSON.stringify(latestPosts)) as Post[]
  const serializedFeatured = featuredPost ? JSON.parse(JSON.stringify(featuredPost)) as Post : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-green-600 via-green-700 to-emerald-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Where Stories
              <span className="block text-green-200">Come to Life</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-green-100 leading-relaxed">
              Join a community of storytellers. Share your thoughts, discover amazing content, and connect with readers who matter.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={session ? "/editor" : "/signup"}
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-semibold text-green-700 shadow-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
              >
                {session ? "✍️ Start Writing" : "🚀 Join StoryPress"}
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center justify-center rounded-full border-2 border-white/30 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-all duration-200"
              >
                📚 Explore Stories
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-12">
            {/* Featured Story */}
            {serializedFeatured && (
              <section className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">⭐ FEATURED</span>
                  </div>
                  <Link href={`/posts/${serializedFeatured.slug}`} className="group">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-green-600 transition-colors leading-tight">
                      {serializedFeatured.title}
                    </h2>
                    <p className="mt-4 text-gray-600 text-lg leading-relaxed line-clamp-3">
                      {serializedFeatured.excerpt}
                    </p>
                  </Link>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {serializedFeatured.author.name?.[0] || serializedFeatured.author.username[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{serializedFeatured.author.name || serializedFeatured.author.username}</p>
                        <p className="text-sm text-gray-500">{serializedFeatured.readTime} min read</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        ❤️ {serializedFeatured._count.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        💬 {serializedFeatured._count.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Latest Stories */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Latest Stories</h2>
                  <p className="text-gray-600 mt-1">Fresh content from our community</p>
                </div>
                <Link href="/explore" className="text-green-600 hover:text-green-700 font-semibold text-sm">
                  View all →
                </Link>
              </div>
              <div className="space-y-8">
                {serializedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
                {serializedPosts.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4"></div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No stories yet</h3>
                    <p className="text-gray-600 mb-6">Be the first to share your story with the community!</p>
                    <Link
                      href="/editor"
                      className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors"
                    >
                      Start Writing Story
                    </Link>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="w-full xl:max-w-sm space-y-6 xl:sticky xl:top-24 xl:h-fit">
            {/* Trending Topics */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Trending Topics</h3>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug ?? tag.name}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 hover:from-green-200 hover:to-emerald-200 transition-all duration-200"
                  >
                    #{tag.name}
                  </Link>
                ))}
                {trendingTags.length === 0 && (
                  <p className="text-gray-500 text-sm italic">Topics will appear as stories are published</p>
                )}
              </div>
            </div>

            {/* Creator Spotlight */}
            <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-2xl shadow-lg border border-purple-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3"> Join Our Community</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Share your stories, connect with readers, and be part of a growing community of creators.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">✓</span>
                  Unlimited story publishing
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">✓</span>
                  Reader analytics & insights
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">✓</span>
                  Community engagement tools
                </div>
              </div>
              <Link
                href={session ? "/dashboard" : "/signup"}
                className="mt-4 w-full inline-flex justify-center items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                {session ? " View Dashboard" : " Get Started"}
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Community Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Stories Published</span>
                  <span className="font-bold text-green-600">{latestPosts.length}+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Topics</span>
                  <span className="font-bold text-purple-600">{trendingTags.length}+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Growing Daily</span>
                  <span className="font-bold text-blue-600"></span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
