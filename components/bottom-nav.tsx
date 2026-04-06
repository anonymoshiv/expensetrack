'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, PlusCircle, RefreshCw, TrendingUp, Wallet } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'

const navItems = [
  {
    href: '/',
    icon: PlusCircle,
    label: 'Home',
  },
  {
    href: '/income',
    icon: Wallet,
    label: 'Income',
  },
  {
    href: '/budgets',
    icon: TrendingUp,
    label: 'Budgets',
  },
  {
    href: '/subscriptions',
    icon: RefreshCw,
    label: 'Subscriptions',
  },
  {
    href: '/analytics',
    icon: BarChart3,
    label: 'Analytics',
  },
]

export function BottomNav() {
  const pathname = usePathname()
  const { user, loading } = useAuth()

  if (loading || !user || pathname === '/share-target') {
    return null
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
      <div className="flex items-center justify-around bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl p-2 rounded-full">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href} aria-label={item.label}>
              <Button
                variant="ghost"
                className={`rounded-full w-12 h-12 flex flex-col gap-0.5 ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
              </Button>
            </Link>
          )
        })}
      </div>
    </div>
  )
}