'use client'

import { useState } from 'react'

interface FollowButtonProps {
  username: string
  initiallyFollowing: boolean
}

export function FollowButton({ username, initiallyFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initiallyFollowing)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleFollow = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/follow/${username}`, { method: 'POST' })

      if (response.status === 401) {
        window.location.href = '/login'
        return
      }

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to update follow state')
      }

      setIsFollowing(Boolean(payload.data?.following))
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'Please try again later')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggleFollow}
      disabled={isSubmitting}
      className={`rounded-full px-5 py-2 text-sm font-semibold ${
        isFollowing ? 'bg-gray-200 text-gray-900' : 'bg-green-600 text-white'
      } disabled:opacity-60`}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}

