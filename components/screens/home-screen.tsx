'use client';

import { useState, useEffect } from 'react';
import { MoodGrid } from '@/components/mood-grid';
import { getTodaysMood, getMoodEmoji, MoodType } from '@/lib/mood-store';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function HomeScreen() {
  const [todaysMood, setTodaysMood] = useState<MoodType | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const mood = getTodaysMood();
    if (mood) {
      setTodaysMood(mood.mood);
    }
  }, []);

  const handleMoodLogged = (mood: MoodType) => {
    setTodaysMood(mood);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="flex flex-col items-center px-6 pt-12 pb-32 min-h-screen">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-muted-foreground text-sm font-medium mb-1">
          {formatDate()}
        </p>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {getGreeting()}
        </h1>
        <p className="text-muted-foreground">
          {todaysMood 
            ? `You're feeling ${todaysMood} ${getMoodEmoji(todaysMood)} today`
            : 'How are you feeling today?'
          }
        </p>
      </div>

      {/* Success message */}
      <div className={`
        transition-all duration-300 mb-6 
        ${showSuccess ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2 pointer-events-none'}
      `}>
        <div className="bg-mood-grateful/30 text-foreground px-6 py-3 rounded-2xl flex items-center gap-2">
          <span className="text-lg">✨</span>
          <span className="font-medium">Mood logged!</span>
        </div>
      </div>

      {/* Mood Grid */}
      <MoodGrid onMoodLogged={handleMoodLogged} />

      {/* Tip */}
      <div className="mt-10 max-w-xs text-center">
        <p className="text-sm text-muted-foreground">
          Tap on a mood to log how you&apos;re feeling. Track your emotions daily to discover patterns.
        </p>
      </div>
    </div>
  );
}
