import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { getCurrentSession } from '@/lib/auth'
import { buildExcerpt, calculateReadingTime, normalizeTag, slugify } from '@/lib/utils'
import { postPayloadSchema } from '@/lib/validators'

const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 25

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor') ?? undefined
  const limitParam = searchParams.get('limit')
  const parsedLimit = limitParam ? Number(limitParam) : DEFAULT_PAGE_SIZE
  const limit = Math.min(Number.isNaN(parsedLimit) ? DEFAULT_PAGE_SIZE : parsedLimit, MAX_PAGE_SIZE)
  const query = searchParams.get('q') ?? undefined
  const tag = searchParams.get('tag') ?? undefined
  const status = searchParams.get('status') ?? undefined
  const authorUsername = searchParams.get('author') ?? undefined
  const authorId = searchParams.get('authorId') ?? undefined

  const where: Prisma.PostWhereInput = {}

  if (!status) {
    where.published = true
  } else if (status === 'draft') {
    where.published = false
  } else if (status === 'published') {
    where.published = true
  }

  if (query) {
    where.OR = [
      { title: { contains: query } },
      { content: { contains: query } },
    ]
  }

  if (tag) {
    where.tags = {
      some: {
        OR: [
          { name: { equals: tag } },
          { slug: { equals: tag } },
        ],
      },
    }
  }

  if (authorUsername) {
    where.author = {
      username: authorUsername,
    }
  }

  if (authorId) {
    where.authorId = authorId
  }

  try {
    const posts = await prisma.post.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: status === 'draft' ? { id: 'desc' } : { publishedAt: 'desc' },
      include: {
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
      },
    })

    let nextCursor: string | null = null
    if (posts.length > limit) {
      const nextItem = posts.pop()
      nextCursor = nextItem?.id ?? null
    }

    return NextResponse.json({
      data: posts,
      nextCursor,
    })
  } catch (error) {
    console.error('Failed to fetch posts', error)
    return NextResponse.json({ error: 'Unable to load posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getCurrentSession()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    const parsed = postPayloadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { title, content, tags, coverImage, published } = parsed.data

    const baseSlug = slugify(title)
    let slug = baseSlug
    let suffix = 1

    while (await prisma.post.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`
    }

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



    const post = await prisma.post.create({
      data: {
        title,
        content,
        slug,
        coverImage: coverImage || null,
        excerpt: buildExcerpt(content),
        readTime: calculateReadingTime(content),
        published: Boolean(published),
        publishedAt: published ? new Date() : null,
        authorId: session.user.id,
        tags: {
          connectOrCreate: tagConnections,
        },
      },
      include: {
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
      },
    })

    return NextResponse.json({ data: post }, { status: 201 })
  } catch (error) {
    console.error('Failed to create post', error)
    
    // Provide more detailed error messages
    if (error instanceof Error) {
      // Prisma errors
      if (error.message.includes('Unique constraint') || error.message.includes('UNIQUE constraint')) {
        return NextResponse.json(
          { error: 'A post with this title already exists. Please choose a different title.' },
          { status: 400 }
        )
      }
      
      // Database connection errors
      if (error.message.includes('connect') || error.message.includes('database') || error.message.includes('P1001')) {
        console.error('Database connection error:', error)
        return NextResponse.json(
          { error: 'Database connection failed. Please check your database configuration.' },
          { status: 500 }
        )
      }
      
      // Column doesn't exist errors
      if (error.message.includes('does not exist') || error.message.includes('P2022')) {
        console.error('Database schema error:', error)
        return NextResponse.json(
          { error: 'Database schema mismatch. Please run migrations.' },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: error.message || 'Unable to create post' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ error: 'Unable to create post' }, { status: 500 })
  }
}

