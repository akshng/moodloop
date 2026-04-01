'use client';

import { useState, useCallback, useEffect } from 'react';
import { MOODS, MoodType, saveMoodEntry, getTodaysMood } from '@/lib/mood-store';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface MoodGridProps {
  onMoodLogged?: (mood: MoodType) => void;
}

export function MoodGrid({ onMoodLogged }: MoodGridProps) {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);

  useEffect(() => {
    setSelectedMood(getTodaysMood()?.mood ?? null);
  }, []);

  const [animatingMood, setAnimatingMood] = useState<MoodType | null>(null);
  const [showRipple, setShowRipple] = useState<MoodType | null>(null);
  const [floatingEmoji, setFloatingEmoji] = useState<{ mood: MoodType; key: number } | null>(null);

  const handleMoodSelect = useCallback((mood: MoodType) => {
    // Start animations
    setAnimatingMood(mood);
    setShowRipple(mood);
    setFloatingEmoji({ mood, key: Date.now() });
    
    // Save to local storage
    saveMoodEntry(mood);
    setSelectedMood(mood);
    
    // Clear animations
    setTimeout(() => setAnimatingMood(null), 400);
    setTimeout(() => setShowRipple(null), 600);
    setTimeout(() => setFloatingEmoji(null), 800);
    
    onMoodLogged?.(mood);
  }, [onMoodLogged]);

  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-sm mx-auto">
      {MOODS.map((mood) => {
        const isSelected = selectedMood === mood.type;
        const isAnimating = animatingMood === mood.type;
        const hasRipple = showRipple === mood.type;
        
        return (
          <button
            key={mood.type}
            onClick={() => handleMoodSelect(mood.type)}
            className={cn(
              "relative flex flex-col items-center justify-center p-6 rounded-3xl transition-all duration-300",
              "hover:scale-105 active:scale-95 overflow-hidden",
              mood.color,
              isSelected && "ring-4 ring-foreground/20 ring-offset-2 ring-offset-background",
              isAnimating && "animate-mood-pop"
            )}
          >
            {/* Ripple effect */}
            {hasRipple && (
              <span className={cn(
                "absolute inset-0 flex items-center justify-center pointer-events-none"
              )}>
                <span className={cn(
                  "w-12 h-12 rounded-full bg-white/40 animate-mood-ripple"
                )} />
              </span>
            )}
            
            {/* Floating emoji */}
            {floatingEmoji?.mood === mood.type && (
              <span
                key={floatingEmoji.key}
                className="absolute text-3xl animate-float-up pointer-events-none"
              >
                {mood.emoji}
              </span>
            )}
            
            {/* Content */}
            <span className="text-4xl mb-2 relative z-10">{mood.emoji}</span>
            <span className="text-sm font-medium text-foreground/80 relative z-10">
              {mood.label}
            </span>
            
            {/* Selected checkmark */}
            {isSelected && (
              <span className={cn(
                "absolute top-3 right-3 w-6 h-6 rounded-full bg-foreground/20 flex items-center justify-center",
                isAnimating && "animate-check-appear"
              )}>
                <Check className="w-4 h-4 text-foreground/80" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
