'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '../../lib/utils'

export function Header() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
      { href: '/explore', label: 'Explore' },

  ]

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-green-600">
           STORYPRESS
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-green-600',
                  pathname === item.href ? 'text-green-600' : 'text-gray-600'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-green-600"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}