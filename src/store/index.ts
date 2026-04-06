import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole, AuthSession } from '../types';

interface AuthState {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isOfflineMode: boolean;
  
  // Actions
  setUser: (user: User) => void;
  setSession: (session: AuthSession) => void;
  setOfflineMode: (offline: boolean) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isOfflineMode: false,

      setUser: (user: User) =>
        set({
          user,
          isAuthenticated: true,
        }),

      setSession: (session: AuthSession) =>
        set({
          session,
          isOfflineMode: session.isOfflineMode,
        }),

      setOfflineMode: (offline: boolean) =>
        set({ isOfflineMode: offline }),

      logout: () =>
        set({
          user: null,
          session: null,
          isAuthenticated: false,
        }),

      hasPermission: (permission: string) => {
        const { user } = get();
        return user?.permissions.includes(permission) ?? false;
      },

      hasRole: (role: UserRole) => {
        const { user } = get();
        return user?.role === role;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// UI State Store
interface UIState {
  isSidebarOpen: boolean;
  currentModule: string;
  theme: 'light' | 'dark';
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: Date;
  }>;

  setSidebarOpen: (open: boolean) => void;
  setCurrentModule: (module: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (type: string, message: string) => void;
  clearNotification: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  currentModule: 'dashboard',
  theme: 'light',
  notifications: [],

  setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),

  setCurrentModule: (module: string) => set({ currentModule: module }),

  setTheme: (theme: 'light' | 'dark') => set({ theme }),

  addNotification: (type: string, message: string) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id: Date.now().toString(),
          type: type as any,
          message,
          timestamp: new Date(),
        },
      ],
    })),

  clearNotification: (id: string) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));

// Sync State Store
interface SyncState {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncErrors: string[];
  pendingEvents: number;

  setSyncing: (syncing: boolean) => void;
  setLastSyncTime: (time: Date) => void;
  addSyncError: (error: string) => void;
  clearSyncErrors: () => void;
  setPendingEvents: (count: number) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isSyncing: false,
  lastSyncTime: null,
  syncErrors: [],
  pendingEvents: 0,

  setSyncing: (syncing: boolean) => set({ isSyncing: syncing }),

  setLastSyncTime: (time: Date) => set({ lastSyncTime: time }),

  addSyncError: (error: string) =>
    set((state) => ({
      syncErrors: [...state.syncErrors, error],
    })),

  clearSyncErrors: () => set({ syncErrors: [] }),

  setPendingEvents: (count: number) => set({ pendingEvents: count }),
}));
