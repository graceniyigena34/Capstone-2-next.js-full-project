// 'use client'

// import { type InfiniteData, useInfiniteQuery } from '@tanstack/react-query'
// import { useMemo } from 'react'
// import Link from 'next/link'
// import { Post } from '@/types'
// import { PostCard } from './PostCard'

// interface HomeFeedProps {
//   initialPosts: Post[]
// }

// type PostsResponse = {
//   data: Post[]
//   nextCursor?: string | null
// }

// async function fetchPosts(cursor?: string | null) {
//   const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
//   const url = new URL('/api/posts', baseUrl)
//   if (cursor) {
//     url.searchParams.set('cursor', cursor)
//   }

//   const response = await fetch(url.toString(), {
//     credentials: 'include',
//   })

//   if (!response.ok) {
//     throw new Error(`Failed to fetch posts: ${response.status}`)
//   }

//   return (await response.json()) as PostsResponse
// }

// export function HomeFeed({ initialPosts }: HomeFeedProps) {
//   const initialData = useMemo(
//     () =>
//       ({
//         pages: [{ data: initialPosts, nextCursor: null }],
//         pageParams: [null],
//       }) as InfiniteData<PostsResponse>,
//     [initialPosts],
//   )

//   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
//     queryKey: ['posts', 'home'],
//     queryFn: ({ pageParam }) => fetchPosts((pageParam as string | null) ?? null),
//     initialPageParam: null,
//     getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
//     initialData,
//   })

//   if (status === 'pending') {
//     return (
//       <div className="space-y-8">
//         {[...Array(3)].map((_, i) => (
//           <div key={i} className="animate-pulse bg-white rounded-2xl p-6 border border-gray-200">
//             <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
//             <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
//             <div className="h-3 bg-gray-200 rounded w-2/3"></div>
//           </div>
//         ))}
//       </div>
//     )
//   }

//   if (status === 'error') {
//     return (
//       <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
//         We couldn&apos;t load the feed. Please try again later.
//       </div>
//     )
//   }

//   if (!data) {
//     return null
//   }

//   const flattenedPosts = data.pages.flatMap((page) => page.data)

//   return (
//     <div className="space-y-8">
//       {flattenedPosts.map((post) => (
//         <PostCard key={post.id} post={post} />
//       ))}

//       {flattenedPosts.length === 0 && (
//         <div className="text-center py-12">
//           <div className="text-6xl mb-4">📝</div>
//           <h3 className="text-xl font-semibold text-gray-900 mb-2">No stories yet</h3>
//           <p className="text-gray-600 mb-6">Be the first to share your story with the community!</p>
//           <Link
//             href="/editor"
//             className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors"
//           >
//             ✍️ Write your first story
//           </Link>
//         </div>
//       )}

//       {hasNextPage && (
//         <div className="flex justify-center pt-8">
//           <button
//             type="button"
//             onClick={() => fetchNextPage()}
//             disabled={isFetchingNextPage}
//             className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:border-green-300 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-200 shadow-sm hover:shadow-md"
//           >
//             {isFetchingNextPage ? (
//               <>
//                 <div className="w-4 h-4 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
//                 Loading stories...
//               </>
//             ) : (
//               <>
//                 📚 Load more stories
//               </>
//             )}
//           </button>
//         </div>
//       )}
//     </div>
//   )
// }

