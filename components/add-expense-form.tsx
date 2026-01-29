'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categoryConfig, categorizeExpense } from '@/lib/categories';
import { addExpense } from '@/lib/services/expense-service';
import { useAuth } from '@/lib/auth-context';
import { Category } from '@/lib/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const expenseSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['food', 'transport', 'entertainment', 'utilities', 'shopping', 'health', 'education', 'other'] as const),
  date: z.string(),
});

type ExpenseForm = z.infer<typeof expenseSchema>;

interface AddExpenseFormProps {
  onSuccess?: () => void;
  autoCategory?: boolean;
}

export const AddExpenseForm: React.FC<AddExpenseFormProps> = ({ onSuccess, autoCategory = true }) => {
  const { firebaseUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      category: 'other',
    },
  });

  const description = watch('description');

  React.useEffect(() => {
    if (autoCategory && description && description.length > 2) {
      const suggestedCategory = categorizeExpense(description);
      setValue('category', suggestedCategory);
    }
  }, [description, autoCategory, setValue]);

  const onSubmit = async (data: ExpenseForm) => {
    if (!firebaseUser) {
      toast.error('You must be logged in');
      return;
    }

    setIsLoading(true);
    try {
      await addExpense(firebaseUser.uid, {
        amount: data.amount,
        description: data.description,
        category: data.category as Category,
        date: new Date(data.date),
      });

      toast.success('Expense added!');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to add expense');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register('amount', { valueAsNumber: true })}
          className="mt-2"
        />
        {errors.amount && <p className="text-destructive text-sm mt-1">{errors.amount.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          type="text"
          placeholder="What did you spend on?"
          {...register('description')}
          className="mt-2"
        />
        {errors.description && <p className="text-destructive text-sm mt-1">{errors.description.message}</p>}
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select defaultValue="other" onValueChange={(value) => setValue('category', value as Category)}>
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
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          {...register('date')}
          className="mt-2"
        />
        {errors.date && <p className="text-destructive text-sm mt-1">{errors.date.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          'Add Expense'
        )}
      </Button>
    </form>
  );
};
