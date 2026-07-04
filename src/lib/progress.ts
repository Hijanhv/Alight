// On-device progress for the daily loop (no account needed).
// Everything lives in localStorage so it works offline as a PWA and costs $0.

export interface Profile {
  typeKey?: string;
  name?: string;
  regulationScore?: number;
  createdAt?: string;
}

export interface Session {
  date: string;
  state: string;
  task: string;
}

export interface Progress {
  streak: number;
  lastCompletedDate: string | null;
  totalSessions: number;
  history: Session[];
}

const PROFILE_KEY = "alight.profile";
const PROGRESS_KEY = "alight.progress";

export function todayStr(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function isYesterday(dateStr: string): boolean {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return dateStr === todayStr(y);
}

export function loadProfile(): Profile | null {
  try {
    const r = localStorage.getItem(PROFILE_KEY);
    return r ? (JSON.parse(r) as Profile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(p: Profile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function loadProgress(): Progress {
  try {
    const r = localStorage.getItem(PROGRESS_KEY);
    if (r) return JSON.parse(r) as Progress;
  } catch {
    /* ignore */
  }
  return { streak: 0, lastCompletedDate: null, totalSessions: 0, history: [] };
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function completedToday(p: Progress): boolean {
  return p.lastCompletedDate === todayStr();
}

export function recordWin(
  state: string,
  task: string
): { progress: Progress; profile: Profile | null } {
  const progress = loadProgress();
  const today = todayStr();

  if (progress.lastCompletedDate !== today) {
    progress.streak =
      progress.lastCompletedDate && isYesterday(progress.lastCompletedDate)
        ? progress.streak + 1
        : 1;
    progress.lastCompletedDate = today;
  }
  progress.totalSessions += 1;
  progress.history = [
    { date: new Date().toISOString(), state, task },
    ...progress.history,
  ].slice(0, 60);
  saveProgress(progress);

  // Nudge the regulation score up a little with each completed loop.
  const profile = loadProfile();
  if (profile) {
    profile.regulationScore = Math.min(100, (profile.regulationScore ?? 50) + 2);
    saveProfile(profile);
  }

  return { progress, profile };
}
