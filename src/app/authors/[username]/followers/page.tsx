import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { FollowButton } from '@/components/follow/FollowButton'
import { getCurrentSession } from '@/lib/auth'

interface FollowersPageProps {
  params: Promise<{ username: string }>
}

export default async function FollowersPage({ params }: FollowersPageProps) {
  const session = await getCurrentSession()
  const { username } = await params

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      followers: {
        include: {
          follower: {
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
          {user.name || user.username}'s Followers
        </h1>
        <p className="text-gray-600 mt-2">{user.followers.length} followers</p>
      </div>

      <div className="space-y-4">
        {user.followers.map(({ follower }) => (
          <div key={follower.id} className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {follower.name?.[0] || follower.username[0]}
              </div>
              <div>
                <Link href={`/authors/${follower.username}`} className="font-semibold text-gray-900 hover:text-green-600">
                  {follower.name || follower.username}
                </Link>
                <p className="text-sm text-gray-500">@{follower.username}</p>
                {follower.bio && <p className="text-sm text-gray-600 mt-1">{follower.bio}</p>}
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                  <span>{follower._count.posts} posts</span>
                  <span>{follower._count.followers} followers</span>
                </div>
              </div>
            </div>
            {session?.user?.id !== follower.id && (
              <FollowButton 
                username={follower.username} 
                initiallyFollowing={false}
              />
            )}
          </div>
        ))}
        
        {user.followers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No followers yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}