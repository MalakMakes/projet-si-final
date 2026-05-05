'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Scale, LogOut } from 'lucide-react'
import { logout } from '@/app/login/actions'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dossiers', label: 'Dossiers' },
  { href: '/reservations', label: 'Réservations' },
  { href: '/dashboard/appointments', label: 'Rendez-vous' },
]

export function Navbar({ profile }: { profile?: { nom_complet: string, role: string } | null }) {
  const pathname = usePathname()

  const displayName = profile?.nom_complet || 'Utilisateur'
  const displayRole = profile?.role 
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) 
    : 'Chargement...'

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

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
          <Link 
            href="/profile" 
            className="hidden sm:flex flex-col items-end hover:opacity-80 transition-opacity"
          >
            <span className="text-sm font-medium text-foreground">{displayName}</span>
            <span className="text-xs text-muted-foreground">{displayRole}</span>
          </Link>
          <Link href="/profile" className="hover:ring-2 hover:ring-camel/20 rounded-full transition-all">
            <Avatar className="h-10 w-10 border-2 border-camel/30">
              <AvatarImage src="" alt={displayName} />
              <AvatarFallback className="bg-camel/20 text-camel font-serif text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors ml-2"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </nav>
    </header>
  )
}
