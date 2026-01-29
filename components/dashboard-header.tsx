'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getExpenses } from '@/lib/services/expense-service';
import { Expense } from '@/lib/types';
import { LogOut, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export const DashboardHeader: React.FC = () => {
  const { user, logout, firebaseUser } = useAuth();
  const [totalSpent, setTotalSpent] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);

  useEffect(() => {
    if (!firebaseUser) return;

    const fetchStats = async () => {
      try {
        const expenses = await getExpenses(firebaseUser.uid);
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        setTotalSpent(total);

        // Get this month's expenses
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyTotal = expenses
          .filter((e) => new Date(e.date) >= monthStart)
          .reduce((sum, e) => sum + e.amount, 0);
        setMonthlyExpenses(monthlyTotal);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, [firebaseUser]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ExpenseTrack</h1>
          {user && <p className="text-muted-foreground">Welcome, {user.email}</p>}
        </div>
        <div className="flex gap-2">
          <Link href="/budgets">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              Budgets
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2 bg-transparent"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
          <p className="text-sm text-muted-foreground">Total Spent</p>
          <p className="text-2xl font-bold mt-1">₹{totalSpent.toFixed(2)}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold mt-1">₹{monthlyExpenses.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
