import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentSession } from '@/lib/auth'

type RouteContext = {
  params: Promise<{ username: string }>
}

export async function POST(_request: NextRequest, context: RouteContext) {
  const { username } = await context.params
  const session = await getCurrentSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 })
  }

  if (username === session.user.username) {
    return NextResponse.json({ error: 'You cannot follow yourself' }, { status: 400 })
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUser.id,
        },
      },
    })

    if (existingFollow) {
      await prisma.follow.delete({ where: { id: existingFollow.id } })
      return NextResponse.json({ data: { following: false } })
    }

    await prisma.follow.create({
      data: {
        followerId: session.user.id,
        followingId: targetUser.id,
      },
    })

    return NextResponse.json({ data: { following: true } })
  } catch (error) {
    console.error('Failed to toggle follow', error)
    return NextResponse.json({ error: 'Unable to follow user' }, { status: 500 })
  }
}

