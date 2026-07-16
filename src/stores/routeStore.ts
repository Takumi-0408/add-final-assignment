import { create } from 'zustand';
import type { PlaceDetail, Priority } from '../types/places';
import type { WalkRoute } from '../types/routes';
import type { LatLng } from '../hooks/locationUtils';
import type { AppError } from '../utils/error';
import { searchWalkRoutes } from '../services/maps/directions';

type RouteState = {
  destination: PlaceDetail | null;
  priorities: Priority[];
  maxDurationMinutes: number | null;
  routes: WalkRoute[];
  selectedRoute: WalkRoute | null;
  isSearching: boolean;
  searchError: AppError | null;
};

type RouteActions = {
  setDestination: (place: PlaceDetail) => void;
  clearDestination: () => void;
  setPriorities: (p: Priority[]) => void;
  setMaxDuration: (min: number | null) => void;
  searchRoutes: (origin: LatLng) => Promise<void>;
  selectRoute: (route: WalkRoute) => void;
  clearRoutes: () => void;
};

const initialState: RouteState = {
  destination: null,
  priorities: [],
  maxDurationMinutes: null,
  routes: [],
  selectedRoute: null,
  isSearching: false,
  searchError: null,
};

export const useRouteStore = create<RouteState & RouteActions>((set, get) => ({
  ...initialState,

  setDestination: (place) => set({ destination: place }),

  clearDestination: () =>
    set({ destination: null, routes: [], selectedRoute: null, searchError: null }),

  setPriorities: (p) => set({ priorities: p }),

  setMaxDuration: (min) => set({ maxDurationMinutes: min }),

  searchRoutes: async (origin) => {
    const { destination, priorities, maxDurationMinutes } = get();
    if (!destination) return;

    set({ isSearching: true, searchError: null });
    try {
      const routes = await searchWalkRoutes(
        origin,
        destination.location,
        priorities,
        maxDurationMinutes ?? undefined,
      );
      set({ routes, isSearching: false });
    } catch (e) {
      set({ searchError: e as AppError, isSearching: false });
    }
  },

  selectRoute: (route) => set({ selectedRoute: route }),

  clearRoutes: () => set({ routes: [], selectedRoute: null, searchError: null }),
}));
