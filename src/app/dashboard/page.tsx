
import Link from 'next/link'
import { format } from 'date-fns'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getCurrentSession } from '@/lib/auth'

type PublishedSummary = {
  id: string
  title: string
  publishedAt: Date | null
  _count: { likes: number; comments: number }
}

type DraftSummary = {
  id: string
  title: string
  _count: { likes: number; comments: number }
}

export default async function DashboardPage() {
  const session = await getCurrentSession()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const [publishedPosts, drafts, totalLikes] = (await Promise.all([
    prisma.post.findMany({
      where: { authorId: session.user.id, published: true  },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        publishedAt: true,
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.post.findMany({
      where: { authorId: session.user.id, published: false },
      orderBy: { id: 'desc' },
      select: {
        id: true,
        title: true,
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.like.count({
      where: { post: { authorId: session.user.id } },
    }),
  ])) as [PublishedSummary[], DraftSummary[], number]

  const followers = 0
  const following = 0

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 space-y-6 sm:space-y-8 lg:space-y-10">
      <div className="rounded-2xl sm:rounded-3xl border border-gray-200 bg-white p-4 sm:p-6 lg:p-8 shadow-sm">
        <p className="text-xs sm:text-sm uppercase tracking-wide text-gray-500">Creator summary</p>
        <div className="mt-4 sm:mt-6 grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          <div className="text-center sm:text-left">
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{publishedPosts.length}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Published stories</p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{followers}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Followers</p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{following}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Following</p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalLikes}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Claps received</p>
          </div>
        </div>
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/editor"
            className="rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white text-center hover:bg-gray-800 transition-colors"
          >
            Write a story
          </Link>
          <Link
            href="#drafts"
            className="rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-900 text-center hover:bg-gray-50 transition-colors"
          >
            Manage drafts
          </Link>
        </div>
      </div>

      <section id="drafts" className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Drafts</h2>
            <p className="text-sm text-gray-500">Finish and publish when you&apos;re ready.</p>
          </div>
          <span className="text-sm font-medium text-gray-500 self-start sm:self-auto">{drafts.length} drafts</span>
        </div>

        <div className="space-y-3 sm:space-y-4 rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
          {drafts.map((draft) => (
            <div key={draft.id} className="flex flex-col gap-2 border-b border-gray-100 pb-3 sm:pb-4 last:border-none">
              <p className="text-sm sm:text-base font-semibold text-gray-900 leading-tight">{draft.title}</p>
              <p className="text-xs sm:text-sm text-gray-500">
                Draft
              </p>
              <div className="flex gap-3 text-xs text-gray-500">
                <span>{draft._count.likes} claps</span>
                <span>{draft._count.comments} comments</span>
              </div>
              <Link
                href={`/editor`}
                className="text-xs sm:text-sm font-semibold text-green-600 hover:text-green-700 self-start"
              >
                Keep writing
              </Link>
            </div>
          ))}

          {drafts.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">You don&apos;t have any drafts yet.</p>
          )}
        </div>
      </section>

      <section className="space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Published stories</h2>
          <p className="text-sm text-gray-500">Track performance at a glance.</p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {publishedPosts.map((post) => (
            <div
              key={post.id}
              className="rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm transition hover:border-gray-300"
            >
              <div className="flex flex-col gap-2 sm:gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Published {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : '—'}
                  </p>
                </div>
                <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500 flex-shrink-0">
                  <span>{post._count.likes} claps</span>
                  <span>{post._count.comments} comments</span>
                </div>
              </div>
            </div>
          ))}

          {publishedPosts.length === 0 && (
            <div className="rounded-xl sm:rounded-2xl border border-dashed border-gray-300 p-4 sm:p-6 text-sm text-gray-500 text-center">
              Publish your first story to see analytics here.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
