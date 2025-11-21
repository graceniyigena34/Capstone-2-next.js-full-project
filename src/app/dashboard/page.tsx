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
      where: { authorId: session.user.id, published: true },
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
    <div className="mx-auto max-w-5xl px-4 py-12 space-y-10">
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-wide text-gray-500">Creator summary</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-4">
          <div>
            <p className="text-3xl font-bold text-gray-900">{publishedPosts.length}</p>
            <p className="text-sm text-gray-500">Published stories</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{followers}</p>
            <p className="text-sm text-gray-500">Followers</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{following}</p>
            <p className="text-sm text-gray-500">Following</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{totalLikes}</p>
            <p className="text-sm text-gray-500">Claps received</p>
          </div>
        </div>
        <div className="mt-8 flex gap-3">
          <Link
            href="/editor"
            className="rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white"
          >
            Write a story
          </Link>
          <Link
            href="#drafts"
            className="rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-900"
          >
            Manage drafts
          </Link>
        </div>
      </div>

      <section id="drafts" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Drafts</h2>
            <p className="text-sm text-gray-500">Finish and publish when you&apos;re ready.</p>
          </div>
          <span className="text-sm font-medium text-gray-500">{drafts.length} drafts</span>
        </div>

        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4">
          {drafts.map((draft) => (
            <div key={draft.id} className="flex flex-col gap-2 border-b border-gray-100 pb-4 last:border-none">
              <p className="text-base font-semibold text-gray-900">{draft.title}</p>
              <p className="text-sm text-gray-500">
                Draft
              </p>
              <div className="flex gap-3 text-xs text-gray-500">
                <span>{draft._count.likes} claps</span>
                <span>{draft._count.comments} comments</span>
              </div>
              <Link
                href={`/editor`}
                className="text-sm font-semibold text-green-600"
              >
                Keep writing
              </Link>
            </div>
          ))}

          {drafts.length === 0 && (
            <p className="text-sm text-gray-500">You don&apos;t have any drafts yet.</p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Published stories</h2>
            <p className="text-sm text-gray-500">Track performance at a glance.</p>
          </div>
        </div>

        <div className="space-y-4">
          {publishedPosts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Published {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : '—'}
                  </p>
                </div>
                <div className="flex gap-6 text-sm text-gray-500">
                  <span>{post._count.likes} claps</span>
                  <span>{post._count.comments} comments</span>
                </div>
              </div>
            </div>
          ))}

          {publishedPosts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-sm text-gray-500">
              Publish your first story to see analytics here.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
