import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { api } from '../services/api';

interface AuthUser {
  id: string;
  openId?: string;
  nickname?: string;
  avatarUrl?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (code: string, nickname?: string) => Promise<void>;
  logout: () => void;
  restore: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoggedIn: false,

  async login(code, nickname) {
    const result = await api.login(code, nickname) as { accessToken: string; user: AuthUser };
    Taro.setStorageSync('auth_token', result.accessToken);
    Taro.setStorageSync('auth_user', JSON.stringify(result.user));
    set({ token: result.accessToken, user: result.user, isLoggedIn: true });
  },

  logout() {
    Taro.removeStorageSync('auth_token');
    Taro.removeStorageSync('auth_user');
    set({ token: null, user: null, isLoggedIn: false });
  },

  restore() {
    try {
      const token = Taro.getStorageSync('auth_token');
      const userStr = Taro.getStorageSync('auth_user');
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr), isLoggedIn: true });
      }
    } catch {
      // storage unavailable
    }
  },
}));
