'use client'

import { useMemo } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Expense } from '@/lib/types'

interface AnalyticsDashboardProps {
  expenses: Expense[]
}

export function AnalyticsDashboard({ expenses }: AnalyticsDashboardProps) {
  const categoryData = useMemo(() => {
    const grouped = expenses.reduce((acc, expense) => {
      const existing = acc.find(item => item.name === expense.category)
      if (existing) {
        existing.value += expense.amount
        existing.count += 1
      } else {
        acc.push({ name: expense.category, value: expense.amount, count: 1 })
      }
      return acc
    }, [] as Array<{ name: string; value: number; count: number }>)
    return grouped.sort((a, b) => b.value - a.value)
  }, [expenses])

  const monthlyData = useMemo(() => {
    const grouped: Record<string, number> = {}
    expenses.forEach(expense => {
      const monthKey = new Date(expense.date).toLocaleString('default', { month: 'short' })
      grouped[monthKey] = (grouped[monthKey] || 0) + expense.amount
    })
    return Object.entries(grouped).map(([month, value]) => ({ name: month, value }))
  }, [expenses])

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0)
  }, [expenses])

  const averageExpense = useMemo(() => {
    return expenses.length > 0 ? totalSpent / expenses.length : 0
  }, [expenses, totalSpent])

  const COLORS = ['#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f97316']

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Spent</CardTitle>
            <CardDescription>All expenses combined</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">₹{totalSpent.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average Expense</CardTitle>
            <CardDescription>{expenses.length} expenses tracked</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">₹{averageExpense.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ₹${value.toFixed(0)}`} outerRadius={80} fill="#8884d8" dataKey="value">
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
              <Bar dataKey="value" fill="#7c3aed" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{item.value.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{item.count} items</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
