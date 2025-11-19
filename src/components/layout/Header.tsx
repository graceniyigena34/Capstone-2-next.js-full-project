'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AuthButton } from '@/components/auth/AuthButton'

export function Header() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/explore', label: 'Explore' },
    { href: '/tags', label: 'Topics' },
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

          <AuthButton />
        </div>
      </div>
    </header>
  )
}