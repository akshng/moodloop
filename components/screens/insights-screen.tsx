'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BarChart3, Calendar, Sparkles, TrendingUp } from 'lucide-react';
import {
  getMoodEntries,
  getMoodColor,
  getMoodEmoji,
  getMoodLabel,
  MOODS,
  MoodEntry,
  MoodType,
  countLoggedDays,
  getMostCommonMood,
  getDominantMoodThisWeek,
  getWeekEntries,
} from '@/lib/mood-store';
import { cn } from '@/lib/utils';

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function loadEntries(): MoodEntry[] {
  return getMoodEntries();
}

export function InsightsScreen() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  const refresh = useCallback(() => {
    setEntries(loadEntries());
  }, []);

  useEffect(() => {
    setMounted(true);
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'moodloop-entries' || e.key === null) refresh();
    };
    const onCustom = () => refresh();
    window.addEventListener('storage', onStorage);
    window.addEventListener('moodloop-entries-changed', onCustom);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') refresh();
    });
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('moodloop-entries-changed', onCustom);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);

  const hasData = entries.length > 0;

  const mostCommon = useMemo(() => getMostCommonMood(entries), [entries]);
  const thisWeek = useMemo(() => getDominantMoodThisWeek(entries), [entries]);
  const daysLogged = useMemo(() => countLoggedDays(entries), [entries]);

  const weekSlots = useMemo(() => {
    const week = getWeekEntries(0);
    return SHORT_DAYS.map((label, i) => ({
      label,
      entry: week[i],
    }));
  }, [entries]);

  if (!mounted) {
    return (
      <div className="flex flex-col px-6 pt-12 pb-32 min-h-screen">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Insights</h1>
          <p className="text-muted-foreground">Patterns from your mood logs</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-10 text-center text-muted-foreground text-sm">
          Loading…
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="flex flex-col px-6 pt-12 pb-32 min-h-screen">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Insights</h1>
          <p className="text-muted-foreground">Patterns from your mood logs</p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center min-h-[280px]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">No mood logs yet</h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
            When you log how you feel on the Home tab, you&apos;ll see your most common mood,
            how this week looks, and how many days you&apos;ve tracked.
          </p>
        </div>
      </div>
    );
  }

  const commonMood = mostCommon?.mood;
  const commonMeta = commonMood ? MOODS.find((m) => m.type === commonMood) : null;
  const weekMood = thisWeek?.mood;
  const weekMeta = weekMood ? MOODS.find((m) => m.type === weekMood) : null;

  return (
    <div className="flex flex-col px-6 pt-12 pb-32 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Insights</h1>
        <p className="text-muted-foreground">Patterns from your mood logs</p>
      </div>

      {/* Summary strip */}
      <div className="grid gap-3 mb-6">
        <div
          className={cn(
            'rounded-3xl p-5 border border-border shadow-sm',
            commonMeta?.color ?? 'bg-muted'
          )}
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/25 text-2xl">
              {commonMeta ? getMoodEmoji(commonMood!) : '—'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground/80 mb-1">
                <TrendingUp className="h-4 w-4" />
                Most common mood
              </div>
              <p className="text-2xl font-bold text-foreground">
                {commonMeta ? getMoodLabel(commonMood!) : '—'}
              </p>
              <p className="text-sm text-foreground/70 mt-1">
                Logged {mostCommon?.count} time{mostCommon?.count === 1 ? '' : 's'} across your
                history
              </p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            'rounded-3xl p-5 border border-border shadow-sm',
            weekMeta?.color ?? 'bg-muted'
          )}
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/25 text-2xl">
              {weekMeta ? getMoodEmoji(weekMood!) : '📅'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground/80 mb-1">
                <Calendar className="h-4 w-4" />
                Mood this week
              </div>
              {weekMeta ? (
                <>
                  <p className="text-2xl font-bold text-foreground">
                    {getMoodLabel(weekMood!)}
                  </p>
                  <p className="text-sm text-foreground/70 mt-1">
                    Your most frequent mood this calendar week ({thisWeek?.count} day
                    {thisWeek?.count === 1 ? '' : 's'} logged)
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-foreground">Not enough yet</p>
                  <p className="text-sm text-foreground/70 mt-1">
                    Log at least once this week (Sun–Sat) to see a dominant mood here.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-3xl p-5 border border-border bg-card shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">Days logged</p>
              <p className="text-2xl font-bold text-foreground">{daysLogged}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Unique days you&apos;ve recorded a mood
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* This week chart */}
      <div className="bg-card rounded-3xl p-6 shadow-sm border border-border mb-6">
        <h3 className="font-semibold text-foreground mb-4">This week</h3>
        <div className="flex items-end justify-between gap-2 h-32">
          {weekSlots.map(({ label, entry }) => {
            const mood = entry?.mood;
            const barClass = mood ? getMoodColor(mood as MoodType) : 'bg-muted';
            const heightPct = entry ? 72 : 8;
            return (
              <div key={label} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                <div
                  className={cn('w-full rounded-xl transition-all duration-300', barClass)}
                  style={{ height: `${heightPct}%` }}
                  title={mood ? getMoodLabel(mood as MoodType) : 'No log'}
                />
                <span className="text-xs font-medium text-muted-foreground truncate w-full text-center">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2 text-center">
        <p className="text-sm text-muted-foreground">
          Keep logging on Home to refine these insights.
        </p>
      </div>
    </div>
  );
}
