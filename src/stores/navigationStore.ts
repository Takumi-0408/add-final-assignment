import { create } from 'zustand';
import type { WalkRoute } from '../types/routes';
import type { LatLng } from '../hooks/locationUtils';
import { isDeviated as checkDeviated, findCurrentStep } from '../utils/navigation';
import { decodePolyline } from '../utils/polyline';

const DEVIATION_THRESHOLD_M = 30;

type NavigationState = {
  isNavigating: boolean;
  currentRoute: WalkRoute | null;
  currentStepIndex: number;
  isDeviated: boolean;
  isRerouting: boolean;
  elapsedSeconds: number;
  walkedMeters: number;
};

type NavigationActions = {
  startNavigation: (route: WalkRoute, startLocation: LatLng) => void;
  stopNavigation: () => void;
  updateLocation: (location: LatLng) => void;
  setRerouting: (rerouting: boolean) => void;
  tick: () => void; // 1秒ごとに呼ぶ
};

const initialState: NavigationState = {
  isNavigating: false,
  currentRoute: null,
  currentStepIndex: 0,
  isDeviated: false,
  isRerouting: false,
  elapsedSeconds: 0,
  walkedMeters: 0,
};

export const useNavigationStore = create<NavigationState & NavigationActions>((set, get) => ({
  ...initialState,

  startNavigation: (route, _startLocation) => {
    set({
      isNavigating: true,
      currentRoute: route,
      currentStepIndex: 0,
      isDeviated: false,
      isRerouting: false,
      elapsedSeconds: 0,
      walkedMeters: 0,
    });
  },

  stopNavigation: () => set({ ...initialState }),

  updateLocation: (location) => {
    const { currentRoute, currentStepIndex } = get();
    if (!currentRoute) return;

    // ルート全体のポリライン座標
    const routePoints = decodePolyline(currentRoute.polyline);
    const deviated = checkDeviated(location, routePoints, DEVIATION_THRESHOLD_M);

    // 現在ステップを更新
    const stepResult = findCurrentStep(location, currentRoute.steps.slice(currentStepIndex));
    const newStepIndex = stepResult ? currentStepIndex + stepResult.index : currentStepIndex;

    set({ isDeviated: deviated, currentStepIndex: newStepIndex });
  },

  setRerouting: (rerouting) => set({ isRerouting: rerouting }),

  tick: () => set((s) => ({ elapsedSeconds: s.elapsedSeconds + 1 })),
}));
