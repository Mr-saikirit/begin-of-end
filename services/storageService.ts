
import { User, Donation, AppState, UserRole } from '../types';

const STORAGE_KEY = 'givebound_data';

const initialUsers: User[] = [
  {
    id: 'admin-1',
    name: 'Platform Admin',
    email: 'admin@givebound.com',
    phone: '1234567890',
    role: UserRole.ADMIN,
    createdAt: new Date().toISOString()
  }
];

export const storageService = {
  loadData: (): AppState => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      const defaultState: AppState = { currentUser: null, users: initialUsers, donations: [] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
      return defaultState;
    }
    const data = JSON.parse(saved);
    // Ensure admin exists if somehow wiped
    if (!data.users.some((u: User) => u.role === UserRole.ADMIN)) {
      data.users.push(initialUsers[0]);
    }
    return data;
  },

  saveData: (state: AppState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },

  clearSession: () => {
    const data = storageService.loadData();
    data.currentUser = null;
    storageService.saveData(data);
  }
};
