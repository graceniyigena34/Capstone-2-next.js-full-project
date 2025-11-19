import { NextResponse } from 'next/server'
import { getCurrentSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getCurrentSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        bio: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            follows: true,
          },
        },
        posts: {
          orderBy: { updatedAt: 'desc' },
          take: 5,
          select: {
            id: true,
            title: true,
            slug: true,
            published: true,
            updatedAt: true,
          },
        },
      },
    })

    return NextResponse.json({ data: user })
  } catch (error) {
    console.error('Failed to load profile', error)
    return NextResponse.json({ error: 'Unable to load profile' }, { status: 500 })
  }
}

