'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { AnalyticsDashboard } from '@/components/analytics-dashboard'
import { GamificationWidget } from '@/components/gamification-widget'
import { DashboardHeader } from '@/components/dashboard-header'
import { getExpenses } from '@/lib/services/expense-service'
import { Expense } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadExpenses = async () => {
      try {
        setLoading(true)
        const data = await getExpenses(user.uid)
        setExpenses(data)
      } catch (error) {
        console.error('Error loading expenses:', error)
      } finally {
        setLoading(false)
      }
    }

    loadExpenses()
  }, [user])

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Please log in first</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="space-y-8">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-80 w-full" />
            </div>
          ) : (
            <>
              <AnalyticsDashboard expenses={expenses} />
              <GamificationWidget stats={getMockGamification()} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
