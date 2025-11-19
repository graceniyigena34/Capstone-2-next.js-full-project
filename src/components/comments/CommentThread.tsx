'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Comment } from '@/types'

interface CommentThreadProps {
  postSlug: string
  initialComments: Comment[]
}

interface CommentResponse {
  data: Comment[]
}

async function getComments(slug: string): Promise<CommentResponse> {
  const response = await fetch(`/api/posts/${slug}/comments`, { credentials: 'include' })

  if (!response.ok) {
    throw new Error('Failed to load comments')
  }

  return response.json()
}

export function CommentThread({ postSlug, initialComments }: CommentThreadProps) {
  const queryClient = useQueryClient()
  const [draftComment, setDraftComment] = useState('')
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [activeReply, setActiveReply] = useState<string | null>(null)

  const { data, status } = useQuery({
    queryKey: ['comments', postSlug],
    queryFn: () => getComments(postSlug),
    initialData: { data: initialComments },
  })

  const mutation = useMutation({
    mutationFn: async (payload: { content: string; parentId?: string }) => {
      const response = await fetch(`/api/posts/${postSlug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error ?? 'Unable to post comment')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postSlug] })
      setDraftComment('')
      setActiveReply(null)
      setReplyDrafts({})
    },
  })

  const handleSubmit = (content: string, parentId?: string) => {
    if (!content.trim()) return
    mutation.mutate({ content: content.trim(), parentId })
  }

  if (status === 'error') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        We couldn&apos;t load the conversation. Please refresh the page.
      </div>
    )
  }

  const comments = data?.data ?? []

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <textarea
          value={draftComment}
          onChange={(e) => setDraftComment(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm focus:border-green-500 focus:outline-none"
          rows={3}
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => handleSubmit(draftComment)}
            disabled={mutation.isPending}
            className="rounded-full bg-gray-900 px-6 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {mutation.isPending ? 'Posting...' : 'Respond'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="rounded-2xl border border-gray-200 p-4">
            <div className="text-sm font-semibold text-gray-900">{comment.author.name ?? comment.author.username}</div>
            <p className="mt-2 text-sm text-gray-700">{comment.content}</p>
            <div className="mt-4 flex gap-4 text-xs text-gray-500">
              <button
                type="button"
                onClick={() => setActiveReply(comment.id)}
                className="font-semibold text-green-600"
              >
                Reply
              </button>
            </div>

            {activeReply === comment.id && (
              <div className="mt-4 space-y-3 rounded-2xl bg-gray-50 p-3">
                <textarea
                  value={replyDrafts[comment.id] ?? ''}
                  onChange={(e) =>
                    setReplyDrafts((prev) => ({
                      ...prev,
                      [comment.id]: e.target.value,
                    }))
                  }
                  placeholder="Write a reply..."
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm focus:border-green-500 focus:outline-none"
                  rows={2}
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveReply(null)
                      setReplyDrafts((prev) => ({ ...prev, [comment.id]: '' }))
                    }}
                    className="text-sm font-medium text-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit(replyDrafts[comment.id] ?? '', comment.id)}
                    className="rounded-full bg-gray-900 px-4 py-1.5 text-sm font-semibold text-white"
                  >
                    Reply
                  </button>
                </div>
              </div>
            )}

            {comment.replies.length > 0 && (
              <div className="mt-4 space-y-4 border-l border-gray-200 pl-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id}>
                    <div className="text-sm font-semibold text-gray-900">
                      {reply.author.name ?? reply.author.username}
                    </div>
                    <p className="mt-1 text-sm text-gray-700">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-sm text-gray-500">There aren&apos;t any comments yet. Start the conversation.</p>
        )}
      </div>
    </div>
  )
}

