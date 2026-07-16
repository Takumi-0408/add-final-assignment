import { useNavigationStore } from '../navigationStore';
import type { WalkRoute } from '../../types/routes';

jest.mock('../../services/maps/directions');
jest.mock('../../services/firebase/client', () => ({ auth: {}, db: {} }));
jest.mock('firebase/app');
jest.mock('firebase/functions');

const dummyRoute: WalkRoute = {
  routeId: 'r1',
  polyline: '_p~iF~ps|U_ulLnnqC_mqNvxq`@',
  distanceMeters: 2000,
  durationSeconds: 1800,
  walkScore: 75,
  scoreDetail: { nature: 80, park: 70, river: 60, quiet: 90 },
  steps: [
    { instruction: '北へ進む', distanceMeters: 100, polyline: '_p~iF~ps|U' },
    { instruction: '左折', distanceMeters: 200, polyline: '_p~iF~ps|U' },
  ],
};

const startLocation = { latitude: 38.5, longitude: -120.2 };

beforeEach(() => {
  useNavigationStore.setState({
    isNavigating: false,
    currentRoute: null,
    currentStepIndex: 0,
    isDeviated: false,
    isRerouting: false,
    elapsedSeconds: 0,
    walkedMeters: 0,
  });
});

describe('navigationStore 初期状態', () => {
  it('isNavigating: false, currentRoute: null', () => {
    const s = useNavigationStore.getState();
    expect(s.isNavigating).toBe(false);
    expect(s.currentRoute).toBeNull();
  });
});

describe('startNavigation', () => {
  it('ルートと開始位置をセットし isNavigating: true になる', () => {
    useNavigationStore.getState().startNavigation(dummyRoute, startLocation);
    const s = useNavigationStore.getState();
    expect(s.isNavigating).toBe(true);
    expect(s.currentRoute).toEqual(dummyRoute);
    expect(s.currentStepIndex).toBe(0);
  });
});

describe('updateLocation', () => {
  it('ルートに近い位置では isDeviated: false', () => {
    useNavigationStore.getState().startNavigation(dummyRoute, startLocation);
    // startLocation はルートの先頭点に近い
    useNavigationStore.getState().updateLocation(startLocation);
    expect(useNavigationStore.getState().isDeviated).toBe(false);
  });
});

describe('stopNavigation', () => {
  it('isNavigating: false, currentRoute: null になる', () => {
    useNavigationStore.getState().startNavigation(dummyRoute, startLocation);
    useNavigationStore.getState().stopNavigation();
    expect(useNavigationStore.getState().isNavigating).toBe(false);
    expect(useNavigationStore.getState().currentRoute).toBeNull();
  });
});
