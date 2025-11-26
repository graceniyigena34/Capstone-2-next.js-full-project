import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { FollowButton } from '@/components/follow/FollowButton'
import { getCurrentSession } from '@/lib/auth'

interface FollowingPageProps {
  params: Promise<{ username: string }>
}

export default async function FollowingPage({ params }: FollowingPageProps) {
  const session = await getCurrentSession()
  const { username } = await params

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      following: {
        include: {
          following: {
            select: {
              id: true,
              name: true,
              username: true,
              bio: true,
              _count: {
                select: { posts: true, followers: true }
              }
            }
          }
        }
      }
    }
  })

  if (!user) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <Link href={`/authors/${username}`} className="text-green-600 hover:text-green-700 text-sm font-medium">
          ← Back to profile
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">
          {user.name || user.username} is Following
        </h1>
        <p className="text-gray-600 mt-2">{user.following.length} following</p>
      </div>

      <div className="space-y-4">
        {user.following.map(({ following }) => (
          <div key={following.id} className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {following.name?.[0] || following.username[0]}
              </div>
              <div>
                <Link href={`/authors/${following.username}`} className="font-semibold text-gray-900 hover:text-green-600">
                  {following.name || following.username}
                </Link>
                <p className="text-sm text-gray-500">@{following.username}</p>
                {following.bio && <p className="text-sm text-gray-600 mt-1">{following.bio}</p>}
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                  <span>{following._count.posts} posts</span>
                  <span>{following._count.followers} followers</span>
                </div>
              </div>
            </div>
            {session?.user?.id !== following.id && (
              <FollowButton 
                username={following.username} 
                initiallyFollowing={false}
              />
            )}
          </div>
        ))}
        
        {user.following.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Not following anyone yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}