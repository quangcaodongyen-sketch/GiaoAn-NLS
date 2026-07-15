import { create } from 'zustand';
import { User, MockDB } from '../services/mockDb';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  checkExpiration: () => boolean; // returns true if expired
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  login: (user) => {
    // Check if user is expired or locked before fully logging in?
    // Actually we handle it in the component. We just save the session.
    localStorage.setItem('currentUser', JSON.stringify(user));
    MockDB.addLog(user.id, 'login', 'User logged in');
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('currentUser');
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (updates) => {
    const { user } = get();
    if (user) {
      const updated = MockDB.updateUser(user.id, updates);
      if (updated) {
        localStorage.setItem('currentUser', JSON.stringify(updated));
        set({ user: updated });
      }
    }
  },

  checkExpiration: () => {
    const { user } = get();
    if (!user) return true;
    if (user.role === 'admin') return false;
    if (user.status === 'locked') return true;

    const now = Date.now();
    if (user.role === 'trial') {
      if (user.trialStartDate && now - user.trialStartDate > 3 * 24 * 60 * 60 * 1000) {
        return true;
      }
      return false; // Trial has no limit if not 3 days
    }
    
    if (user.role === 'vip') {
      if (user.vipEndDate && now > user.vipEndDate) {
        return true;
      }
      return false;
    }

    return true;
  }
}));

// Initialize from local storage
const initAuth = () => {
  try {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      const parsedUser = JSON.parse(stored);
      // Fetch fresh data from DB to ensure status is synced
      const freshUser = MockDB.getUserById(parsedUser.id);
      if (freshUser) {
        useAuthStore.setState({ user: freshUser, isAuthenticated: true });
      } else {
        localStorage.removeItem('currentUser');
      }
    }
  } catch (e) {
    console.error("Failed to parse current user");
  }
};

initAuth();
