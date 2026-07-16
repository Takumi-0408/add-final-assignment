import { create } from 'zustand';
import type { Favorite, FavoriteInput } from '../types/favorites';
import type { AppError } from '../utils/error';
import {
  saveFavorite as fsSave,
  getFavorites as fsGet,
  deleteFavorite as fsDel,
} from '../services/firebase/firestore';

type FavoritesState = {
  favorites: Favorite[];
  isLoading: boolean;
  error: AppError | null;
};

type FavoritesActions = {
  fetchFavorites: (uid: string) => Promise<void>;
  saveFavorite: (uid: string, data: FavoriteInput) => Promise<void>;
  deleteFavorite: (uid: string, favoriteId: string) => Promise<void>;
  clearError: () => void;
};

export const useFavoritesStore = create<FavoritesState & FavoritesActions>((set) => ({
  favorites: [],
  isLoading: false,
  error: null,

  fetchFavorites: async (uid) => {
    set({ isLoading: true, error: null });
    try {
      const favorites = await fsGet(uid);
      set({ favorites, isLoading: false });
    } catch (e) {
      set({ error: e as AppError, isLoading: false });
    }
  },

  saveFavorite: async (uid, data) => {
    set({ isLoading: true, error: null });
    try {
      await fsSave(uid, data);
      const favorites = await fsGet(uid);
      set({ favorites, isLoading: false });
    } catch (e) {
      set({ error: e as AppError, isLoading: false });
    }
  },

  deleteFavorite: async (uid, favoriteId) => {
    set({ isLoading: true, error: null });
    try {
      await fsDel(uid, favoriteId);
      const favorites = await fsGet(uid);
      set({ favorites, isLoading: false });
    } catch (e) {
      set({ error: e as AppError, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
