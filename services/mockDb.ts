import { v4 as uuidv4 } from 'uuid';

export type UserRole = 'trial' | 'vip' | 'admin';
export type UserStatus = 'active' | 'locked';

export interface User {
  id: string;
  username: string;
  passwordHash: string; // Trong thực tế sẽ được hash, ở đây lưu plaintext hoặc mã hóa đơn giản để demo
  role: UserRole;
  status: UserStatus;
  trialStartDate?: number;
  vipEndDate?: number;
  apiKey?: string;
  createdAt: number;
}

export type ActionType = 'login' | 'upload_file' | 'generate_nls' | 'download_file' | 'update_api' | 'upgrade_vip';

export interface Log {
  id: string;
  userId: string;
  action: ActionType;
  timestamp: number;
  details: string;
}

const DB_KEY = 'nls_mock_db';

interface DBState {
  users: User[];
  logs: Log[];
}

const defaultAdmin: User = {
  id: 'admin-001',
  username: 'Admin',
  passwordHash: 'Admin123@', // Yêu cầu từ người dùng
  role: 'admin',
  status: 'active',
  createdAt: Date.now()
};

export class MockDB {
  private static getState(): DBState {
    try {
      const data = localStorage.getItem(DB_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error("Lỗi đọc DB", e);
    }
    return { users: [defaultAdmin], logs: [] };
  }

  private static saveState(state: DBState) {
    localStorage.setItem(DB_KEY, JSON.stringify(state));
  }

  // --- Users ---
  static getUsers(): User[] {
    return this.getState().users;
  }

  static getUserById(id: string): User | undefined {
    return this.getState().users.find(u => u.id === id);
  }

  static getUserByUsername(username: string): User | undefined {
    const users = this.getState().users;
    return users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  static createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const state = this.getState();
    const newUser: User = {
      ...user,
      id: uuidv4(),
      createdAt: Date.now()
    };
    state.users.push(newUser);
    this.saveState(state);
    return newUser;
  }

  static updateUser(id: string, updates: Partial<User>): User | null {
    const state = this.getState();
    const idx = state.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      state.users[idx] = { ...state.users[idx], ...updates };
      this.saveState(state);
      return state.users[idx];
    }
    return null;
  }

  // --- Logs ---
  static getLogs(): Log[] {
    return this.getState().logs;
  }

  static addLog(userId: string, action: ActionType, details: string = '') {
    const state = this.getState();
    state.logs.push({
      id: uuidv4(),
      userId,
      action,
      timestamp: Date.now(),
      details
    });
    this.saveState(state);
  }

  // --- Stats ---
  static getStats() {
    const state = this.getState();
    const users = state.users;
    const logs = state.logs;

    const totalUsers = users.filter(u => u.role !== 'admin').length;
    const totalVip = users.filter(u => u.role === 'vip').length;
    const totalTrial = users.filter(u => u.role === 'trial').length;
    
    // Logic expired
    const now = Date.now();
    const expiredTrial = users.filter(u => u.role === 'trial' && u.trialStartDate && (now - u.trialStartDate > 3 * 24 * 60 * 60 * 1000)).length; // 3 days trial
    const expiredVip = users.filter(u => u.role === 'vip' && u.vipEndDate && now > u.vipEndDate).length;
    const totalExpired = expiredTrial + expiredVip;

    const totalLogins = logs.filter(l => l.action === 'login').length;
    const totalUsage = logs.filter(l => l.action === 'generate_nls').length;
    const totalProcessed = logs.filter(l => l.action === 'generate_nls').length;
    const fileUploads = logs.filter(l => l.action === 'upload_file').length;
    const fileDownloads = logs.filter(l => l.action === 'download_file').length;

    return {
      totalUsers,
      totalVip,
      totalTrial,
      totalExpired,
      totalLogins,
      totalUsage,
      totalProcessed,
      fileUploads,
      fileDownloads
    };
  }
}
