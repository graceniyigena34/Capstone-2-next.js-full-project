'use client'

import { useState } from 'react'

interface LikeButtonProps {
  slug: string
  initialCount: number
  initiallyLiked: boolean
}

export function LikeButton({ slug, initialCount, initiallyLiked }: LikeButtonProps) {
  const [liked, setLiked] = useState(initiallyLiked)
  const [count, setCount] = useState(initialCount)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleLike = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/posts/${slug}/like`, { method: 'POST' })

      if (response.status === 401) {
        window.location.href = '/login'
        return
      }

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to react to this story')
      }

      const nextLiked = Boolean(payload.data?.liked)
      setLiked(nextLiked)
      setCount((prev) => Math.max(0, prev + (nextLiked ? 1 : -1)))
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggleLike}
      disabled={isSubmitting}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
        liked ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-900'
      } disabled:opacity-60`}
    >
      <span>{liked ? 'Clapped' : 'Clap'}</span>
      <span className="rounded-full bg-white/30 px-2 py-0.5 text-xs font-bold text-gray-900">
        {count}
      </span>
    </button>
  )
}

