import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { getCurrentSession } from '@/lib/auth'
import { buildExcerpt, calculateReadingTime, normalizeTag, slugify } from '@/lib/utils'
import { updatePostSchema } from '@/lib/validators'

type RouteContext = {
  params: Promise<{ slug: string }>
}

const postInclude = {
  author: {
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
    },
  },
  tags: true,
  _count: {
    select: {
      likes: true,
      comments: true,
    },
  },
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        ...postInclude,
        comments: {
          where: { parentId: null },
          include: {
            author: {
              select: { id: true, name: true, username: true, image: true },
            },
            replies: {
              include: {
                author: { select: { id: true, name: true, username: true, image: true } },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ data: post })
  } catch (error) {
    console.error('Failed to fetch post', error)
    return NextResponse.json({ error: 'Unable to load post' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params
  const session = await getCurrentSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const post = await prisma.post.findUnique({
    where: { slug },
    select: { id: true, authorId: true },
  })

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  if (post.authorId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const payload = await request.json()
    const parsed = updatePostSchema.safeParse(payload)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { title, content, tags, coverImage, published } = parsed.data

    const data: Prisma.PostUpdateInput = {}

    if (title) {
      data.title = title
      const newSlugBase = slugify(title)
      if (newSlugBase !== slug) {
        let slug = newSlugBase
        let suffix = 1

        while (await prisma.post.findUnique({ where: { slug } })) {
          slug = `${newSlugBase}-${suffix++}`
        }

        data.slug = slug
      }
    }

    if (typeof content === 'string') {
      data.content = content
      data.excerpt = buildExcerpt(content)
      data.readTime = calculateReadingTime(content)
    }

    if (typeof coverImage !== 'undefined') {
      data.coverImage = coverImage
    }

    if (typeof published === 'boolean') {
      data.published = published
      data.publishedAt = published ? new Date() : null
    }

    if (Array.isArray(tags)) {
      const tagConnections = tags.map((tagName) => {
        const normalized = normalizeTag(tagName)
        return {
          where: { name: normalized },
          create: {
            name: normalized,
            slug: slugify(normalized),
          },
        }
      })

      data.tags = {
        set: [],
        connectOrCreate: tagConnections,
      }
    }

    const updated = await prisma.post.update({
      where: { id: post.id },
      data,
      include: postInclude,
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Failed to update post', error)
    return NextResponse.json({ error: 'Unable to update post' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { slug } = await context.params
  const session = await getCurrentSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const post = await prisma.post.findUnique({
    where: { slug },
    select: { id: true, authorId: true },
  })

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  if (post.authorId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    await prisma.post.delete({
      where: { id: post.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete post', error)
    return NextResponse.json({ error: 'Unable to delete post' }, { status: 500 })
  }
}

