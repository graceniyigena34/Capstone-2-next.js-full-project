'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export function AuthButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="w-20 h-4 bg-gray-200 animate-pulse rounded"></div>
  }

  if (session) {
    return (
      <div className="flex items-center space-x-2 sm:space-x-4">
        <Link
          href="/dashboard"
          className="hidden sm:block text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/editor"
          className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
        >
          <span className="hidden sm:inline">Write</span>
          <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </Link>
        <button
          onClick={() => signOut()}
          className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <span className="hidden sm:inline">Sign Out</span>
          <span className="sm:hidden">Out</span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2 sm:space-x-4">
      <Link
        href="/login"
        className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
      >
        <span className="hidden sm:inline">Sign In</span>
        <span className="sm:hidden">In</span>
      </Link>
      <Link
        href="/register"
        className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-green-700 transition-colors"
      >
        <span className="hidden sm:inline">Get Started</span>
        <span className="sm:hidden">Start</span>
      </Link>
    </div>
  )
}