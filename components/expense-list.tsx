'use client';

import React, { useEffect, useState } from 'react';
import { Expense } from '@/lib/types';
import { getExpenses } from '@/lib/services/expense-service';
import { useAuth } from '@/lib/auth-context';
import { categoryConfig } from '@/lib/categories';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { Trash2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteExpense } from '@/lib/services/expense-service';
import { toast } from 'sonner';
import { SplitExpenseModal } from '@/components/split-expense-modal';

interface ExpenseListProps {
  onExpensesLoad?: (count: number) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ onExpensesLoad }) => {
  const { firebaseUser } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const fetchExpenses = async () => {
    if (!firebaseUser) return;
    
    try {
      setLoading(true);
      const data = await getExpenses(firebaseUser.uid);
      setExpenses(data);
      onExpensesLoad?.(data.length);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [firebaseUser]);

  const handleDelete = async (expenseId: string) => {
    try {
      await deleteExpense(expenseId);
      setExpenses(expenses.filter((e) => e.id !== expenseId));
      toast.success('Expense deleted');
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading expenses...</div>;
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No expenses yet. Add one to get started!</p>
      </div>
    );
  }

  // Group expenses by date
  const groupedExpenses = expenses.reduce(
    (acc, expense) => {
      const dateKey = format(expense.date, 'yyyy-MM-dd');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(expense);
      return acc;
    },
    {} as Record<string, Expense[]>,
  );

  return (
    <div className="space-y-4">
      {Object.entries(groupedExpenses).map(([dateKey, dayExpenses]) => (
        <div key={dateKey}>
          <h3 className="font-semibold text-sm text-muted-foreground mb-2 px-2">
            {format(new Date(dateKey), 'EEE, MMM d, yyyy')}
          </h3>
          <div className="space-y-2">
            {dayExpenses.map((expense) => {
              const categoryInfo = categoryConfig[expense.category];
              const Icon = categoryInfo.icon;

              return (
                <Card key={expense.id} className="p-3 flex items-center justify-between hover:bg-muted/50 transition">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="p-2 rounded-full"
                      style={{ backgroundColor: categoryInfo.color + '20' }}
                    >
                      <Icon className="w-5 h-5" style={{ color: categoryInfo.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{expense.description}</p>
                      <p className="text-xs text-muted-foreground">{categoryInfo.name}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-semibold text-sm">₹{expense.amount.toFixed(2)}</p>
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedExpense(expense)}
                        className="h-6 w-6 p-0 text-primary hover:bg-primary/10"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(expense.id)}
                        className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
      <SplitExpenseModal expense={selectedExpense} onClose={() => setSelectedExpense(null)} />
    </div>
  );
};
