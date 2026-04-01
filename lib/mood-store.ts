export type MoodType = 'happy' | 'calm' | 'anxious' | 'sad' | 'tired' | 'energized' | 'frustrated' | 'grateful';

export interface MoodEntry {
  id: string;
  mood: MoodType;
  date: string; // ISO date string YYYY-MM-DD
  timestamp: number;
}

export const MOODS: { type: MoodType; emoji: string; label: string; color: string }[] = [
  { type: 'happy', emoji: '😊', label: 'Happy', color: 'bg-mood-happy' },
  { type: 'calm', emoji: '😌', label: 'Calm', color: 'bg-mood-calm' },
  { type: 'anxious', emoji: '😰', label: 'Anxious', color: 'bg-mood-anxious' },
  { type: 'sad', emoji: '😢', label: 'Sad', color: 'bg-mood-sad' },
  { type: 'tired', emoji: '😴', label: 'Tired', color: 'bg-mood-tired' },
  { type: 'energized', emoji: '⚡', label: 'Energized', color: 'bg-mood-energized' },
  { type: 'frustrated', emoji: '😤', label: 'Frustrated', color: 'bg-mood-frustrated' },
  { type: 'grateful', emoji: '🙏', label: 'Grateful', color: 'bg-mood-grateful' },
];

const STORAGE_KEY = 'moodloop-entries';

/**
 * Calendar date in the user's local timezone as YYYY-MM-DD (for storage and comparison).
 * Uses local date fields (not UTC) so it stays consistent across browsers and matches stored keys.
 */
export function formatLocalDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getMoodEntries(): MoodEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as MoodEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveMoodEntry(mood: MoodType): MoodEntry {
  const entries = getMoodEntries();
  const now = new Date();
  const dateStr = formatLocalDate(now);
  
  // Check if there's already an entry for today
  const existingIndex = entries.findIndex(e => e.date === dateStr);
  
  const newEntry: MoodEntry = {
    id: `${dateStr}-${Date.now()}`,
    mood,
    date: dateStr,
    timestamp: now.getTime(),
  };
  
  if (existingIndex >= 0) {
    entries[existingIndex] = newEntry;
  } else {
    entries.push(newEntry);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('moodloop-entries-changed'));
  }
  return newEntry;
}

export function getTodaysMood(): MoodEntry | null {
  const entries = getMoodEntries();
  const today = formatLocalDate(new Date());
  return entries.find(e => e.date === today) || null;
}

export function getMoodForDate(date: string): MoodEntry | null {
  const entries = getMoodEntries();
  return entries.find(e => e.date === date) || null;
}

export function getWeekEntries(weekOffset: number = 0): (MoodEntry | null)[] {
  const entries = getMoodEntries();
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
  
  const weekEntries: (MoodEntry | null)[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dateStr = formatLocalDate(date);
    weekEntries.push(entries.find(e => e.date === dateStr) || null);
  }
  
  return weekEntries;
}

export function getMoodColor(mood: MoodType): string {
  const moodData = MOODS.find(m => m.type === mood);
  return moodData?.color || 'bg-muted';
}

export function getMoodEmoji(mood: MoodType): string {
  const moodData = MOODS.find(m => m.type === mood);
  return moodData?.emoji || '❓';
}

export function getMoodLabel(mood: MoodType): string {
  return MOODS.find(m => m.type === mood)?.label ?? mood;
}

/** Unique calendar days with at least one log. */
export function countLoggedDays(entries: MoodEntry[]): number {
  return new Set(entries.map((e) => e.date)).size;
}

export function getMostCommonMood(
  entries: MoodEntry[]
): { mood: MoodType; count: number } | null {
  if (entries.length === 0) return null;
  const counts = new Map<MoodType, number>();
  for (const e of entries) {
    counts.set(e.mood, (counts.get(e.mood) ?? 0) + 1);
  }
  let best: MoodType | null = null;
  let max = 0;
  for (const [mood, c] of counts) {
    if (c > max) {
      max = c;
      best = mood;
    }
  }
  return best !== null ? { mood: best, count: max } : null;
}

/** Entries whose date falls in the current calendar week (Sun–Sat), local time. */
export function getEntriesThisWeek(entries: MoodEntry[]): MoodEntry[] {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const startStr = formatLocalDate(start);
  const endStr = formatLocalDate(end);
  return entries.filter((e) => e.date >= startStr && e.date <= endStr);
}

/** Dominant mood among entries in the current week, or null if none. */
export function getDominantMoodThisWeek(
  entries: MoodEntry[]
): { mood: MoodType; count: number } | null {
  return getMostCommonMood(getEntriesThisWeek(entries));
}
