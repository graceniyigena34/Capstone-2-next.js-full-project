import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { PostCard } from '@/components/posts/PostCard'
import { FollowButton } from '@/components/follow/FollowButton'
import { getCurrentSession } from '@/lib/auth'
import type { Post } from '@/types'

interface AuthorPageProps {
  params: Promise<{ username: string }>
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const session = await getCurrentSession()
  const { username } = await params
  const author = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      image: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
      posts: {
        where: { published: true },
        orderBy: { publishedAt: 'desc' },
        include: {
          author: true,
          tags: true,
          _count: {
            select: { likes: true, comments: true },
          },
        },
      },
    },
  })

  if (!author) {
    notFound()
  }

  const posts = JSON.parse(JSON.stringify(author.posts)) as Post[]
  const isOwner = session?.user?.id === author.id
  const viewerFollows = !isOwner && session?.user?.id
    ? Boolean(
        await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: session.user.id,
              followingId: author.id,
            },
          },
        }),
      )
    : false

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 space-y-10">
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-green-600">Author</p>
            <h1 className="text-4xl font-bold text-gray-900">{author.name ?? author.username}</h1>
            <p className="text-sm text-gray-500">@{author.username}</p>
            {author.bio && <p className="mt-4 text-gray-700">{author.bio}</p>}
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <span>{author._count.posts} stories</span>
            <span>{author._count.followers} followers</span>
            <span>{author._count.following} following</span>
          </div>
        </div>
        {!isOwner && (
          <div className="mt-6">
            <FollowButton username={author.username} initiallyFollowing={viewerFollows} />
          </div>
        )}
      </div>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Stories</h2>
          <p className="text-sm text-gray-500">Latest from {author.name ?? author.username}</p>
        </div>
        {posts.length === 0 && (
          <p className="text-sm text-gray-500">This author hasn&apos;t published anything yet.</p>
        )}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">
          Want to see more from this author?{' '}
          <Link href="/login" className="font-semibold text-green-600">
            Sign in to follow
          </Link>
        </p>
      </div>
    </div>
  )
}

