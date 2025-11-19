'use client'

import { type InfiniteData, useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Post } from '@/types'
import { PostCard } from './PostCard'

interface HomeFeedProps {
  initialPosts: Post[]
}

type PostsResponse = {
  data: Post[]
  nextCursor?: string | null
}

async function fetchPosts(cursor?: string | null) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_API_URL
  const url = new URL('/api/posts', baseUrl)
  if (cursor) {
    url.searchParams.set('cursor', cursor)
  }

  const response = await fetch(url.toString(), {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch posts')
  }

  return (await response.json()) as PostsResponse
}

export function HomeFeed({ initialPosts }: HomeFeedProps) {
  const initialData = useMemo(
    () =>
      ({
        pages: [{ data: initialPosts, nextCursor: null }],
        pageParams: [null],
      }) as InfiniteData<PostsResponse>,
    [initialPosts],
  )

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['posts', 'home'],
    queryFn: ({ pageParam }) => fetchPosts((pageParam as string | null) ?? null),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialData,
  })

  if (status === 'error') {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        We couldn&apos;t load the feed. Please try again later.
      </div>
    )
  }

  if (!data) {
    return null
  }

  const flattenedPosts = data.pages.flatMap((page) => page.data)

  return (
    <div className="space-y-6">
      {flattenedPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {hasNextPage && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-full border border-gray-300 px-6 py-2 text-sm font-medium text-gray-900 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFetchingNextPage ? 'Loading...' : 'Load more stories'}
          </button>
        </div>
      )}
    </div>
  )
}

