'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getMoodEntries,
  MoodEntry,
  getMoodColor,
  getMoodEmoji,
  MOODS,
  formatLocalDate,
} from '@/lib/mood-store';
import { cn } from '@/lib/utils';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface WeekData {
  startDate: Date;
  days: {
    date: Date;
    dateStr: string;
    entry: MoodEntry | null;
    isToday: boolean;
    isFuture: boolean;
  }[];
}

function getWeekData(weekOffset: number): WeekData {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
  
  const entries = getMoodEntries();
  
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dateStr = formatLocalDate(date);
    
    days.push({
      date,
      dateStr,
      entry: entries.find(e => e.date === dateStr) || null,
      isToday: date.getTime() === today.getTime(),
      isFuture: date.getTime() > today.getTime(),
    });
  }
  
  return { startDate: startOfWeek, days };
}

function formatWeekRange(startDate: Date): string {
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  
  const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDate.getDate()} - ${endDate.getDate()}`;
  }
  return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}`;
}

export function HistoryScreen() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekData, setWeekData] = useState<WeekData | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    setWeekData(getWeekData(weekOffset));
  }, [weekOffset]);

  if (!weekData) return null;

  const selectedEntry = weekData.days.find(d => d.dateStr === selectedDay);
  const moodData = selectedEntry?.entry 
    ? MOODS.find(m => m.type === selectedEntry.entry?.mood)
    : null;

  return (
    <div className="flex flex-col px-6 pt-12 pb-32 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">History</h1>
        <p className="text-muted-foreground">Your mood journey over time</p>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setWeekOffset(prev => prev - 1)}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        
        <div className="text-center">
          <p className="font-semibold text-foreground">
            {formatWeekRange(weekData.startDate)}
          </p>
          {weekOffset === 0 && (
            <p className="text-xs text-muted-foreground">This week</p>
          )}
        </div>
        
        <button
          onClick={() => setWeekOffset(prev => prev + 1)}
          disabled={weekOffset >= 0}
          className={cn(
            "w-10 h-10 rounded-full bg-secondary flex items-center justify-center transition-colors",
            weekOffset >= 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-accent"
          )}
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Week Heatmap */}
      <div className="bg-card rounded-3xl p-6 shadow-sm border border-border mb-6">
        <div className="grid grid-cols-7 gap-2">
          {/* Day labels */}
          {DAYS.map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground mb-2">
              {day}
            </div>
          ))}
          
          {/* Day cells */}
          {weekData.days.map(day => (
            <button
              key={day.dateStr}
              onClick={() => !day.isFuture && setSelectedDay(day.dateStr === selectedDay ? null : day.dateStr)}
              disabled={day.isFuture}
              className={cn(
                "aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-200",
                day.entry && getMoodColor(day.entry.mood),
                !day.entry && !day.isFuture && "bg-secondary hover:bg-accent",
                day.isFuture && "bg-muted/50 cursor-not-allowed",
                day.isToday && "ring-2 ring-foreground/20 ring-offset-2 ring-offset-card",
                selectedDay === day.dateStr && "scale-110 shadow-lg"
              )}
            >
              <span className="text-xs font-medium text-foreground/70">
                {day.date.getDate()}
              </span>
              {day.entry && (
                <span className="text-lg mt-0.5">
                  {getMoodEmoji(day.entry.mood)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Day Detail */}
      {selectedEntry && (
        <div className={cn(
          "rounded-3xl p-6 transition-all duration-300",
          selectedEntry.entry ? getMoodColor(selectedEntry.entry.mood) : "bg-secondary"
        )}>
          <div className="flex items-center gap-4">
            {selectedEntry.entry ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <span className="text-4xl">{moodData?.emoji}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground/70">
                    {selectedEntry.date.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {moodData?.label}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center w-full py-4">
                <p className="text-muted-foreground">No mood logged for this day</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mood Legend */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Mood Legend</h3>
        <div className="grid grid-cols-4 gap-3">
          {MOODS.map(mood => (
            <div key={mood.type} className="flex flex-col items-center gap-1">
              <div className={cn("w-8 h-8 rounded-xl", mood.color)} />
              <span className="text-xs text-muted-foreground">{mood.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
