'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Scale } from 'lucide-react'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dossiers', label: 'Dossiers' },
  { href: '/consultations', label: 'Consultations' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-italian-roast/95 backdrop-blur supports-[backdrop-filter]:bg-italian-roast/80">
      <nav className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-camel/10 text-camel transition-colors group-hover:bg-camel/20">
            <Scale className="h-5 w-5" />
          </div>
          <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
            Avocat-Link
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-camel',
                pathname === link.href
                  ? 'text-camel'
                  : 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-foreground">Me. Dupont</span>
            <span className="text-xs text-muted-foreground">Avocat associé</span>
          </div>
          <Avatar className="h-10 w-10 border-2 border-camel/30">
            <AvatarImage src="/avatar.jpg" alt="Me. Dupont" />
            <AvatarFallback className="bg-camel/20 text-camel font-serif text-sm">
              MD
            </AvatarFallback>
          </Avatar>
        </div>
      </nav>
    </header>
  )
}
