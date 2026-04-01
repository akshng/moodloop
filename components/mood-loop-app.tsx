'use client';

import { useState, useEffect } from 'react';
import { BottomNav, Screen } from '@/components/bottom-nav';
import { HomeScreen } from '@/components/screens/home-screen';
import { HistoryScreen } from '@/components/screens/history-screen';
import { InsightsScreen } from '@/components/screens/insights-screen';

export function MoodLoopApp() {
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for system preference or saved preference
    const savedTheme = localStorage.getItem('moodloop-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      if (newValue) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('moodloop-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('moodloop-theme', 'light');
      }
      return newValue;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        {/* Screen Content */}
        <div className="transition-all duration-300">
          {activeScreen === 'home' && <HomeScreen />}
          {activeScreen === 'history' && <HistoryScreen />}
          {activeScreen === 'insights' && <InsightsScreen />}
        </div>

        {/* Bottom Navigation */}
        <BottomNav
          activeScreen={activeScreen}
          onScreenChange={setActiveScreen}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      </div>
    </div>
  );
}
