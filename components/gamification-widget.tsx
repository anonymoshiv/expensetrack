'use client'

import { Trophy, Flame, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GamificationStats } from '@/lib/types'

interface GamificationWidgetProps {
  stats: GamificationStats
}

export function GamificationWidget({ stats }: GamificationWidgetProps) {
  const badgeEmojis: Record<string, string> = {
    'Spender': '💰',
    'Budget Master': '🎯',
    'Consistent Tracker': '📊',
    'Frugal King': '👑',
    'Ultra Saver': '🌟',
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="text-accent" size={20} />
            Streak & Level
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-primary/10 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-2xl font-bold text-accent">{stats.currentStreak}</p>
            </div>
            <div className="bg-primary/10 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Longest Streak</p>
              <p className="text-2xl font-bold text-primary">{stats.longestStreak}</p>
            </div>
            <div className="bg-primary/10 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Level</p>
              <p className="text-2xl font-bold text-primary">{stats.level}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Experience Points</span>
              <span className="font-semibold">{stats.points} / 500 XP</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
                style={{ width: `${(stats.points / 500) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {stats.badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="text-accent" size={20} />
              Badges Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.badges.map(badge => (
                <div key={badge} className="bg-accent/10 border border-accent/30 rounded-full px-3 py-1 flex items-center gap-2 text-sm">
                  <span>{badgeEmojis[badge] || '⭐'}</span>
                  <span className="font-medium">{badge}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="text-accent" size={20} />
            Total Expenses Tracked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-primary">{stats.totalExpenses.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground mt-2">Keep tracking to earn more badges!</p>
        </CardContent>
      </Card>
    </div>
  )
}
