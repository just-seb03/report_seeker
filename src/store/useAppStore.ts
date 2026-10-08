import { create } from 'zustand';
import { type Trabajador, getCurrentUser } from '../control/global/authControl';

export type Language = 'es' | 'en';

interface AppState {
  // Authentication / User
  currentUser: Trabajador | null;
  setCurrentUser: (user: Trabajador | null) => void;
  updateUser: (user: Partial<Trabajador>) => void;
  logout: () => void;

  // Dark Mode Preference
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;

  // Language
  language: Language;
  setLanguage: (lang: Language) => void;

  // Synchronization Signals
  reportsSyncToken: number;
  triggerReportsSync: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Authentication
  currentUser: getCurrentUser(),
  setCurrentUser: (user) => set({ currentUser: user }),
  updateUser: (partialUser) => set((state) => ({
    currentUser: state.currentUser ? { ...state.currentUser, ...partialUser } : null
  })),
  logout: () => set({ currentUser: null }),

  // Dark Mode
  isDarkMode: window.localStorage.getItem('report-seeker-theme') === 'dark',
  toggleDarkMode: () => set((state) => {
    const newMode = !state.isDarkMode;
    window.localStorage.setItem('report-seeker-theme', newMode ? 'dark' : 'light');
    return { isDarkMode: newMode };
  }),
  setDarkMode: (isDark) => {
    window.localStorage.setItem('report-seeker-theme', isDark ? 'dark' : 'light');
    set({ isDarkMode: isDark });
  },

  // Language
  language: (localStorage.getItem('appLanguage') as Language) || 'es',
  setLanguage: (lang) => {
    localStorage.setItem('appLanguage', lang);
    set({ language: lang });
  },

  // Synchronization Signal
  reportsSyncToken: 0,
  triggerReportsSync: () => set((state) => ({ reportsSyncToken: state.reportsSyncToken + 1 })),
}));
