'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'

export function AuthButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="w-20 h-4 bg-gray-200 animate-pulse rounded"></div>
  }

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard"
          className="text-gray-600 hover:text-gray-900"
        >
          Dashboard
        </Link>
        <Link
          href="/editor"
          className="text-gray-600 hover:text-gray-900"
        >
          Write
        </Link>
        <button
          onClick={() => signOut()}
          className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-700"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <Link
        href="/login"
        className="text-gray-600 hover:text-gray-900"
      >
        Sign In
      </Link>
      <Link
        href="/register"
        className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-700"
      >
        Get Started
      </Link>
    </div>
  )
}