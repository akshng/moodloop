'use client';

import { Home, Calendar, Sparkles, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Screen = 'home' | 'history' | 'insights';

interface BottomNavProps {
  activeScreen: Screen;
  onScreenChange: (screen: Screen) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const NAV_ITEMS: { id: Screen; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'Today', icon: <Home className="w-6 h-6" /> },
  { id: 'history', label: 'History', icon: <Calendar className="w-6 h-6" /> },
  { id: 'insights', label: 'Insights', icon: <Sparkles className="w-6 h-6" /> },
];

export function BottomNav({ activeScreen, onScreenChange, isDarkMode, onToggleDarkMode }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto px-4 pb-6">
        <nav className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-lg border border-border/50 p-2">
          <div className="flex items-center justify-around">
            {NAV_ITEMS.map((item) => {
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onScreenChange(item.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 px-6 py-3 rounded-2xl transition-all duration-300",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {item.icon}
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
            
            {/* Dark mode toggle */}
            <button
              onClick={onToggleDarkMode}
              className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-300"
            >
              {isDarkMode ? (
                <Sun className="w-6 h-6" />
              ) : (
                <Moon className="w-6 h-6" />
              )}
              <span className="text-xs font-medium">Theme</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
