import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getCurrentSession } from '@/lib/auth'
import type { Post } from '@/types'
import { PostCard } from '@/components/posts/PostCard'

export const dynamic = 'force-dynamic'

type PostWithRelations = {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  slug: string
  excerpt: string | null
  coverImage: string | null
  readTime: number
  published: boolean
  publishedAt: Date | null
  authorId: string
  author: {
    id: string
    name: string | null
    username: string
    image: string | null
  }

  _count: {
    likes: number
    comments: number
  }
}

type LatestPostsResult = PostWithRelations[]


export default async function Home() {
  let session: Awaited<ReturnType<typeof getCurrentSession>> = null;
  let latestPosts: LatestPostsResult = [];

  let featuredPost: PostWithRelations | null = null;
  
  try {
    [session, latestPosts, featuredPost] = await Promise.all([
      getCurrentSession(),
      prisma.post.findMany({
        where: { published: true },
        take: 6,
        orderBy: { publishedAt: 'desc' },
        include: {
          author: { select: { id: true, name: true, username: true, image: true } },
          tags: true,
          _count: { select: { likes: true, comments: true } },
        },
      }),

      prisma.post.findFirst({
        where: { published: true },
        orderBy: { likes: { _count: 'desc' } },
        include: {
          author: { select: { id: true, name: true, username: true, image: true } },
          tags: true,
          _count: { select: { likes: true, comments: true } },
        },
      }),
    ])
  } catch (error) {
    console.error('Database connection error:', error);
    // Fallback to empty data when database is unavailable
    session = null;
    latestPosts = [];

    featuredPost = null;
  }

  // Transform posts to match Post type
  const serializedPosts: Post[] = (latestPosts || []).map(post => ({
    ...post,
    publishedAt: post.publishedAt?.toISOString() || null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt?.toISOString() || post.createdAt.toISOString(),
    readTime: Math.max(1, Math.ceil((post.content?.length || 0) / 200)),
    excerpt: post.content ? post.content.substring(0, 160) + (post.content.length > 160 ? '...' : '') : '',
    author: {
      ...post.author,
      createdAt: new Date().toISOString()
    },

  }))

  const serializedFeatured: Post | null = featuredPost ? {
    ...featuredPost,
    publishedAt: featuredPost.publishedAt?.toISOString() || null,
    createdAt: featuredPost.createdAt.toISOString(),
    updatedAt: featuredPost.updatedAt?.toISOString() || featuredPost.createdAt.toISOString(),
    readTime: Math.max(1, Math.ceil((featuredPost.content?.length || 0) / 200)),
    excerpt: featuredPost.content ? featuredPost.content.substring(0, 160) + (featuredPost.content.length > 160 ? '...' : '') : '',
    author: {
      ...featuredPost.author,
      createdAt: new Date().toISOString()
    },

  } : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900 text-gray-900 dark:text-gray-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-green-600 via-green-700 to-emerald-800 dark:from-green-900 dark:via-green-800 dark:to-green-900">
        <div className="absolute inset-0 bg-black/25"></div>
        <div className="relative mx-auto max-w-7xl px-6 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
            Where Stories <span className="block text-green-200 dark:text-green-300">Come to Life</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed text-green-100 dark:text-green-200">
            Join a community of storytellers. Share your thoughts, discover amazing content, and connect with readers who matter.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/editor"
              className="rounded-full bg-white dark:bg-gray-800 px-8 py-4 text-green-700 dark:text-green-300 font-semibold shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 transition transform"
            >
              Start Writing
            </Link>
            <Link
              href="/explore"
              className="rounded-full border-2 border-white/30 dark:border-gray-600 px-8 py-4 text-white dark:text-gray-200 font-semibold hover:bg-white/10 dark:hover:bg-gray-700 transition"
            >
              Explore Stories
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col xl:flex-row gap-8">
        {/* Left Content */}
        <div className="flex-1 space-y-12">
          {/* Featured Story */}
          {serializedFeatured && (
            <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-shadow">
              <div className="p-8">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  ⭐ FEATURED
                </span>
                <Link href={`/posts/${serializedFeatured.slug}`} className="group block mt-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors leading-tight">
                    {serializedFeatured.title}
                  </h2>
                  <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg line-clamp-3">{serializedFeatured.excerpt}</p>
                </Link>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 dark:from-green-700 dark:to-green-900 flex items-center justify-center text-white font-semibold">
                      {serializedFeatured.author.name?.[0] || serializedFeatured.author.username?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold">{serializedFeatured.author.name || serializedFeatured.author.username}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{serializedFeatured.readTime} min read</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>❤️ {serializedFeatured._count?.likes || 0}</span>
                    <span>💬 {serializedFeatured._count?.comments || 0}</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Latest Stories */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Latest Stories</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Fresh content from our community</p>
              </div>
              <Link href="/explore" className="text-green-600 dark:text-green-400 font-semibold text-sm hover:text-green-700 dark:hover:text-green-300">
                View all →
              </Link>
            </div>
            <div className="space-y-8">
              {serializedPosts.length > 0 ? (
                serializedPosts.map((post) => <PostCard key={post.id} post={post} />)
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No stories yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Be the first to share your story with the community!</p>
                  <Link
                    href="/editor"
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white dark:text-gray-100 font-semibold rounded-full hover:bg-green-700 transition-colors"
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


          {/* Community CTA */}
          <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-pink-900 rounded-2xl shadow-lg border border-purple-100 dark:border-gray-700 p-6 text-center">
            <h3 className="text-lg font-bold mb-3">Join Our Community</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Share your stories, connect with readers, and be part of a growing community of creators.</p>
            <Link
              href="/dashboard"
              className="mt-4 w-full inline-flex justify-center items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full transition transform hover:scale-105 shadow-lg"
            >
              Get Started
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold mb-4">Community Stats</h3>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <div className="flex justify-between"><span>Stories Published</span><span className="font-bold text-green-600">{latestPosts?.length || 0}+</span></div>

              <div className="flex justify-between"><span>Growing Daily</span><span className="font-bold text-blue-600">📈</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
