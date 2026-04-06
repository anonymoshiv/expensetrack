import { Expense, GamificationStats } from '@/lib/types'

const DAY_IN_MS = 24 * 60 * 60 * 1000
const XP_PER_LEVEL = 200

const toStartOfDay = (date: Date) => {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

const daysBetween = (a: Date, b: Date) => {
  const aStart = toStartOfDay(a).getTime()
  const bStart = toStartOfDay(b).getTime()
  return Math.round((aStart - bStart) / DAY_IN_MS)
}

const getLongestStreak = (days: Date[]) => {
  if (days.length === 0) return 0

  let longest = 1
  let running = 1

  for (let i = 1; i < days.length; i += 1) {
    const delta = daysBetween(days[i], days[i - 1])
    if (delta === 1) {
      running += 1
      longest = Math.max(longest, running)
    } else {
      running = 1
    }
  }

  return longest
}

const getCurrentStreak = (days: Date[]) => {
  if (days.length === 0) return 0

  const today = toStartOfDay(new Date())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const latest = days[days.length - 1]
  const latestIsToday = daysBetween(today, latest) === 0
  const latestIsYesterday = daysBetween(today, latest) === 1

  if (!latestIsToday && !latestIsYesterday) {
    return 0
  }

  let streak = 1
  for (let i = days.length - 1; i > 0; i -= 1) {
    const delta = daysBetween(days[i], days[i - 1])
    if (delta === 1) {
      streak += 1
    } else {
      break
    }
  }

  return streak
}

const getBadges = (args: {
  expenseCount: number
  totalSpent: number
  averageExpense: number
  categoryCount: number
  longestStreak: number
}) => {
  const { expenseCount, totalSpent, averageExpense, categoryCount, longestStreak } = args
  const badges: string[] = []

  if (expenseCount >= 1) badges.push('Starter')
  if (expenseCount >= 10 && averageExpense <= 300) badges.push('Saver')
  if (totalSpent >= 10000) badges.push('Spender')
  if (longestStreak >= 7) badges.push('Consistent Tracker')
  if (expenseCount >= 20 && categoryCount >= 5) badges.push('Budget Master')
  if (expenseCount >= 30 && averageExpense <= 200) badges.push('Frugal King')
  if (expenseCount >= 50 && averageExpense <= 150) badges.push('Ultra Saver')

  return badges
}

export const calculateGamificationStats = (userId: string, expenses: Expense[]): GamificationStats => {
  const expenseCount = expenses.length
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const averageExpense = expenseCount > 0 ? totalSpent / expenseCount : 0

  const uniqueCategories = new Set(expenses.map((expense) => expense.category))
  const categoryCount = uniqueCategories.size

  const uniqueDays = Array.from(
    new Set(expenses.map((expense) => toStartOfDay(new Date(expense.date)).getTime()))
  )
    .sort((a, b) => a - b)
    .map((dayTs) => new Date(dayTs))

  const longestStreak = getLongestStreak(uniqueDays)
  const currentStreak = getCurrentStreak(uniqueDays)

  const baseXp = expenseCount * 10
  const streakXp = longestStreak * 5 + currentStreak * 3
  const diversityXp = categoryCount * 8
  const consistencyXp = uniqueDays.length * 2
  const milestoneXp =
    (expenseCount >= 10 ? 50 : 0) +
    (expenseCount >= 25 ? 100 : 0) +
    (expenseCount >= 50 ? 200 : 0)

  const points = baseXp + streakXp + diversityXp + consistencyXp + milestoneXp
  const level = Math.floor(points / XP_PER_LEVEL) + 1

  return {
    userId,
    currentStreak,
    longestStreak,
    totalExpenses: expenseCount,
    badges: getBadges({ expenseCount, totalSpent, averageExpense, categoryCount, longestStreak }),
    points,
    level,
  }
}
