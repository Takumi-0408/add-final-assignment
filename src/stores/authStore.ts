import { create } from 'zustand';
import type { User } from 'firebase/auth';
import {
  signInAnonymous as authSignInAnonymous,
  signInWithEmail as authSignInWithEmail,
  signUpWithEmail as authSignUpWithEmail,
  signOut as authSignOut,
  linkEmailToAnonymous as authLinkEmail,
  subscribeAuthState,
} from '../services/firebase/auth';
import type { AppError } from '../utils/error';

type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: AppError | null;
};

type AuthActions = {
  initialize: () => () => void; // onAuthStateChanged の unsubscribe を返す
  signInAnonymous: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  linkEmail: (email: string, password: string) => Promise<void>;
  clearError: () => void;
};

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

/** Firebase Auth 操作の共通ラッパー */
async function withLoading(
  set: (partial: Partial<AuthState>) => void,
  fn: () => Promise<void>,
): Promise<void> {
  set({ isLoading: true, error: null });
  try {
    await fn();
    set({ isLoading: false });
  } catch (e) {
    // auth サービス層で AppError に変換済み
    set({ isLoading: false, error: e as AppError });
  }
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  ...initialState,

  initialize: () => {
    return subscribeAuthState((user) => {
      set({ user });
    });
  },

  signInAnonymous: async () => {
    await withLoading(set, () => authSignInAnonymous());
  },

  signInWithEmail: async (email, password) => {
    await withLoading(set, () => authSignInWithEmail(email, password));
  },

  signUpWithEmail: async (email, password) => {
    await withLoading(set, () => authSignUpWithEmail(email, password));
  },

  signOut: async () => {
    await withLoading(set, () => authSignOut());
    set({ user: null });
  },

  linkEmail: async (email, password) => {
    const { user } = get();
    if (!user) {
      set({ error: { code: 'auth/no-user', message: 'ログインが必要です', recoverable: true } });
      return;
    }
    await withLoading(set, () => authLinkEmail(user, email, password));
  },

  clearError: () => set({ error: null }),
}));
