'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { DashboardHeader } from '@/components/dashboard-header'
import { BudgetAlerts } from '@/components/budget-alerts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { categoryConfig } from '@/lib/categories'
import { Budget, Category } from '@/lib/types'
import { setBudget, getBudgets, deleteBudget, recalculateBudgetSpent } from '@/lib/services/budget-service'
import { toast } from 'sonner'

export default function BudgetsPage() {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [newBudget, setNewBudget] = useState({ category: 'food', limit: 1000 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return

    const loadBudgets = async () => {
      try {
        const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
        const data = await getBudgets(user.uid, currentMonth)
        
        // Recalculate spent amounts for each budget
        const updatedBudgets = await Promise.all(
          data.map(async (budget) => {
            try {
              const spent = await recalculateBudgetSpent(user.uid, budget.id, budget.category, currentMonth)
              return { ...budget, spent }
            } catch (error) {
              console.error('Error recalculating budget:', error)
              return budget
            }
          })
        )
        
        setBudgets(updatedBudgets)
      } catch (error) {
        console.error('Error loading budgets:', error)
      }
    }

    loadBudgets()
  }, [user])

  const handleAddBudget = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
      
      await setBudget(user.uid, {
        userId: user.uid,
        category: newBudget.category as Category,
        limit: newBudget.limit,
        spent: 0,
        month: currentMonth,
        alertThreshold: 80,
      })
      
      // Reload budgets
      const data = await getBudgets(user.uid, currentMonth)
      setBudgets(data)
      setNewBudget({ category: 'food', limit: 1000 })
      toast.success('Budget added!')
    } catch (error) {
      console.error('Error adding budget:', error)
      toast.error('Failed to add budget')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBudget = async (id: string) => {
    if (!user) return
    
    try {
      await deleteBudget(id)
      setBudgets(budgets.filter(b => b.id !== id))
      toast.success('Budget deleted')
    } catch (error) {
      console.error('Error deleting budget:', error)
      toast.error('Failed to delete budget')
    }
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Please log in first</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="space-y-8">
          <BudgetAlerts budgets={budgets} />

          <Card>
            <CardHeader>
              <CardTitle>Set New Budget</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newBudget.category} onValueChange={(value) => setNewBudget({ ...newBudget, category: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="limit">Monthly Limit (₹)</Label>
                <Input
                  id="limit"
                  type="number"
                  value={newBudget.limit}
                  onChange={(e) => setNewBudget({ ...newBudget, limit: Number(e.target.value) })}
                  placeholder="1000"
                  className="mt-2"
                  min="0"
                  step="100"
                />
              </div>

              <Button onClick={handleAddBudget} className="w-full" disabled={loading}>
                {loading ? 'Adding...' : 'Add Budget'}
              </Button>
            </CardContent>
          </Card>

          {budgets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>All Budgets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {budgets.map(budget => (
                    <div key={budget.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{budget.category}</p>
                        <p className="text-sm text-muted-foreground">₹{budget.spent.toFixed(2)} of ₹{budget.limit.toFixed(2)}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteBudget(budget.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
