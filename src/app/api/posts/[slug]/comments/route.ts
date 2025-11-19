import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentSession } from '@/lib/auth'
import { commentSchema } from '@/lib/validators'

type RouteContext = {
  params: Promise<{ slug: string }>
}

const commentInclude = {
  author: {
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
    },
  },
  replies: {
    include: {
      author: {
        select: { id: true, name: true, username: true, image: true },
      },
    },
  },
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { slug } = await context.params
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const comments = await prisma.comment.findMany({
      where: { postId: post.id, parentId: null },
      include: commentInclude,
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ data: comments })
  } catch (error) {
    console.error('Failed to load comments', error)
    return NextResponse.json({ error: 'Unable to load comments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
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

    const payload = await request.json()
    const parsed = commentSchema.safeParse(payload)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    let parentId: string | undefined

    if (parsed.data.parentId) {
      const parent = await prisma.comment.findFirst({
        where: { id: parsed.data.parentId, postId: post.id },
        select: { id: true },
      })

      if (!parent) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 })
      }

      parentId = parent.id
    }

    const comment = await prisma.comment.create({
      data: {
        content: parsed.data.content,
        parentId,
        postId: post.id,
        authorId: session.user.id,
      },
      include: commentInclude,
    })

    return NextResponse.json({ data: comment }, { status: 201 })
  } catch (error) {
    console.error('Failed to create comment', error)
    return NextResponse.json({ error: 'Unable to comment' }, { status: 500 })
  }
}

