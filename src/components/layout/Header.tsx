'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { AuthButton } from '@/components/auth/AuthButton'

export function Header() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/explore', label: 'Explore' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl sm:text-2xl font-bold text-green-600 flex-shrink-0">
            STORYPRESS
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 lg:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-green-600 px-2 py-1 rounded-md',
                  pathname === item.href ? 'text-green-600 bg-green-50' : 'text-gray-600'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Button */}
          <div className="hidden md:block">
            <AuthButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-green-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="px-2 pt-2 pb-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'block px-3 py-2 rounded-md text-base font-medium transition-colors',
                    pathname === item.href 
                      ? 'text-green-600 bg-green-50' 
                      : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200 mt-4">
                <AuthButton />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}