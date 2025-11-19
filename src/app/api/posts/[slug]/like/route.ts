import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentSession } from '@/lib/auth'

type RouteContext = {
  params: Promise<{ slug: string }>
}

export async function POST(_request: NextRequest, context: RouteContext) {
  const { slug } = await context.params
  const session = await getCurrentSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: post.id,
        },
      },
    })

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } })
      return NextResponse.json({ data: { liked: false } })
    }

    await prisma.like.create({
      data: {
        userId: session.user.id,
        postId: post.id,
      },
    })

    return NextResponse.json({ data: { liked: true } })
  } catch (error) {
    console.error('Failed to toggle like', error)
    return NextResponse.json({ error: 'Unable to react to post' }, { status: 500 })
  }
}

