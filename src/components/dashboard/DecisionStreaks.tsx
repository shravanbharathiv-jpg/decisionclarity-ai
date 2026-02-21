import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Star, Zap, Target } from 'lucide-react';
import { differenceInDays, differenceInCalendarDays, startOfDay } from 'date-fns';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalDecisions: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first', name: 'First Step', description: 'Make your first decision', icon: '🎯', unlocked: false },
  { id: 'streak3', name: 'On a Roll', description: '3-day decision streak', icon: '🔥', unlocked: false },
  { id: 'streak7', name: 'Unstoppable', description: '7-day decision streak', icon: '⚡', unlocked: false },
  { id: 'five', name: 'High Five', description: 'Complete 5 decisions', icon: '🖐️', unlocked: false },
  { id: 'ten', name: 'Decision Master', description: 'Complete 10 decisions', icon: '🏆', unlocked: false },
  { id: 'deep', name: 'Deep Thinker', description: 'Complete a deep decision', icon: '🧠', unlocked: false },
];

const calculateLevel = (xp: number) => {
  let level = 1;
  let required = 100;
  let totalRequired = 0;
  while (totalRequired + required <= xp) {
    totalRequired += required;
    level++;
    required = Math.floor(required * 1.5);
  }
  return { level, xp: xp - totalRequired, nextLevelXp: required };
};

const DecisionStreaks = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0, longestStreak: 0, totalDecisions: 0,
    level: 1, xp: 0, nextLevelXp: 100, achievements: ACHIEVEMENTS,
  });

  useEffect(() => {
    if (!user) return;
    const fetchStreak = async () => {
      const { data } = await supabase
        .from('decisions')
        .select('created_at, is_locked, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!data || data.length === 0) return;

      // Calculate streaks
      const dates = [...new Set(data.map(d => startOfDay(new Date(d.created_at)).toISOString()))].sort().reverse();
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 1;

      const today = startOfDay(new Date());
      const lastDate = startOfDay(new Date(dates[0]));
      const daysSinceLast = differenceInCalendarDays(today, lastDate);

      if (daysSinceLast <= 1) {
        currentStreak = 1;
        for (let i = 1; i < dates.length; i++) {
          const diff = differenceInCalendarDays(new Date(dates[i - 1]), new Date(dates[i]));
          if (diff === 1) { currentStreak++; tempStreak++; }
          else { longestStreak = Math.max(longestStreak, tempStreak); tempStreak = 1; }
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

      const completed = data.filter(d => d.is_locked).length;
      const total = data.length;
      const xp = completed * 50 + (total - completed) * 20 + currentStreak * 10;
      const { level, xp: currentXp, nextLevelXp } = calculateLevel(xp);

      const achievements = ACHIEVEMENTS.map(a => ({
        ...a,
        unlocked: 
          (a.id === 'first' && total >= 1) ||
          (a.id === 'streak3' && (currentStreak >= 3 || longestStreak >= 3)) ||
          (a.id === 'streak7' && (currentStreak >= 7 || longestStreak >= 7)) ||
          (a.id === 'five' && completed >= 5) ||
          (a.id === 'ten' && completed >= 10) ||
          (a.id === 'deep' && completed >= 1),
      }));

      setStreak({ currentStreak, longestStreak, totalDecisions: total, level, xp: currentXp, nextLevelXp, achievements });
    };
    fetchStreak();
  }, [user]);

  const xpPercent = Math.round((streak.xp / streak.nextLevelXp) * 100);

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Decision Streaks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Streak & Level */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{streak.currentStreak}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Day Streak</p>
            </div>
            {streak.currentStreak > 0 && (
              <Flame className="h-8 w-8 text-orange-500 animate-pulse" />
            )}
          </div>
          <div className="text-center">
            <Badge variant="outline" className="text-xs mb-1">Level {streak.level}</Badge>
            <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${xpPercent}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">{streak.xp}/{streak.nextLevelXp} XP</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted/50 rounded-lg p-2">
            <Trophy className="h-3.5 w-3.5 mx-auto text-amber-500 mb-0.5" />
            <p className="text-xs font-medium">{streak.longestStreak}</p>
            <p className="text-[10px] text-muted-foreground">Best</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <Target className="h-3.5 w-3.5 mx-auto text-primary mb-0.5" />
            <p className="text-xs font-medium">{streak.totalDecisions}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <Star className="h-3.5 w-3.5 mx-auto text-yellow-500 mb-0.5" />
            <p className="text-xs font-medium">{streak.achievements.filter(a => a.unlocked).length}</p>
            <p className="text-[10px] text-muted-foreground">Badges</p>
          </div>
        </div>

        {/* Achievements */}
        <div className="flex flex-wrap gap-2">
          {streak.achievements.map(a => (
            <div
              key={a.id}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border transition-all ${
                a.unlocked 
                  ? 'bg-primary/10 border-primary/30 text-foreground' 
                  : 'bg-muted/30 border-border/30 text-muted-foreground opacity-50'
              }`}
              title={a.description}
            >
              <span>{a.icon}</span>
              <span>{a.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DecisionStreaks;
