'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { AnalyticsDashboard } from '@/components/analytics-dashboard'
import { GamificationWidget } from '@/components/gamification-widget'
import { DashboardHeader } from '@/components/dashboard-header'
import { getExpenses } from '@/lib/services/expense-service'
import { calculateGamificationStats } from '@/lib/services/gamification-service'
import { Expense } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const gamificationStats = useMemo(
    () => calculateGamificationStats(user?.uid ?? 'unknown-user', expenses),
    [user?.uid, expenses]
  )

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
    <div className="min-h-dvh bg-background relative pb-24">
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-64 bg-linear-to-b from-primary/5 to-transparent -z-10 pointer-events-none" />

      <div className="app-page-container">
        <div className="pt-6 pb-2">
          <h1 className="text-2xl font-extrabold tracking-tight">Analytics</h1>
        </div>

        <DashboardHeader />

        <div className="mt-6 space-y-8">

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-3xl" />
              <Skeleton className="h-80 w-full rounded-3xl" />
            </div>
          ) : (
            <>
              <div className="bg-card shadow-sm border border-border/50 rounded-3xl overflow-hidden p-2">
                <AnalyticsDashboard expenses={expenses} />
              </div>
              <div className="bg-card shadow-sm border border-border/50 rounded-3xl overflow-hidden p-2">
                <GamificationWidget stats={gamificationStats} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
