import { searchWalkRoutes } from '../../services/maps/directions';
import { useRouteStore } from '../routeStore';
import type { PlaceDetail } from '../../types/places';
import type { WalkRoute } from '../../types/routes';

jest.mock('../../services/maps/directions');
jest.mock('../../services/firebase/client', () => ({ auth: {}, db: {} }));
jest.mock('firebase/app');
jest.mock('firebase/functions');

const mockSearch = searchWalkRoutes as jest.MockedFunction<typeof searchWalkRoutes>;

const dummyDestination: PlaceDetail = {
  placeId: 'p1',
  name: '渋谷駅',
  address: '東京都渋谷区',
  location: { latitude: 35.658, longitude: 139.7016 },
};

const dummyRoute: WalkRoute = {
  routeId: 'r1',
  polyline: 'abc123',
  distanceMeters: 2000,
  durationSeconds: 1800,
  walkScore: 75,
  scoreDetail: { nature: 80, park: 70, river: 60, quiet: 90 },
  steps: [],
};

beforeEach(() => {
  jest.clearAllMocks();
  useRouteStore.setState({
    destination: null,
    priorities: [],
    maxDurationMinutes: null,
    routes: [],
    selectedRoute: null,
    isSearching: false,
    searchError: null,
  });
});

describe('routeStore 初期状態', () => {
  it('destination: null, priorities: [], routes: []', () => {
    const s = useRouteStore.getState();
    expect(s.destination).toBeNull();
    expect(s.priorities).toEqual([]);
    expect(s.routes).toEqual([]);
  });
});

describe('setDestination / clearDestination', () => {
  it('setDestination で destination がセットされる', () => {
    useRouteStore.getState().setDestination(dummyDestination);
    expect(useRouteStore.getState().destination).toEqual(dummyDestination);
  });

  it('clearDestination で destination が null / routes が空になる', () => {
    useRouteStore.setState({ destination: dummyDestination, routes: [dummyRoute] });
    useRouteStore.getState().clearDestination();
    expect(useRouteStore.getState().destination).toBeNull();
    expect(useRouteStore.getState().routes).toEqual([]);
  });
});

describe('setPriorities / setMaxDuration', () => {
  it('setPriorities で優先条件が更新される', () => {
    useRouteStore.getState().setPriorities(['nature', 'park']);
    expect(useRouteStore.getState().priorities).toEqual(['nature', 'park']);
  });

  it('setMaxDuration で maxDurationMinutes が更新される', () => {
    useRouteStore.getState().setMaxDuration(30);
    expect(useRouteStore.getState().maxDurationMinutes).toBe(30);
  });
});

describe('searchRoutes アクション', () => {
  const origin = { latitude: 35.6812, longitude: 139.7671 };

  it('呼び出し中は isSearching: true', async () => {
    let resolve!: (v: WalkRoute[]) => void;
    mockSearch.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    useRouteStore.setState({ destination: dummyDestination });

    const p = useRouteStore.getState().searchRoutes(origin);
    expect(useRouteStore.getState().isSearching).toBe(true);
    resolve([dummyRoute]);
    await p;
  });

  it('成功後 routes がセットされ isSearching: false', async () => {
    mockSearch.mockResolvedValue([dummyRoute]);
    useRouteStore.setState({ destination: dummyDestination });
    await useRouteStore.getState().searchRoutes(origin);
    expect(useRouteStore.getState().routes).toEqual([dummyRoute]);
    expect(useRouteStore.getState().isSearching).toBe(false);
  });

  it('destination が null のとき何もしない', async () => {
    await useRouteStore.getState().searchRoutes(origin);
    expect(mockSearch).not.toHaveBeenCalled();
  });

  it('失敗時 searchError がセットされる', async () => {
    const err = { code: 'routes/not-found', message: 'ルートが見つかりません', recoverable: true };
    mockSearch.mockRejectedValue(err);
    useRouteStore.setState({ destination: dummyDestination });
    await useRouteStore.getState().searchRoutes(origin);
    expect(useRouteStore.getState().searchError).toMatchObject({ code: 'routes/not-found' });
  });
});

describe('selectRoute', () => {
  it('selectRoute で selectedRoute がセットされる', () => {
    useRouteStore.getState().selectRoute(dummyRoute);
    expect(useRouteStore.getState().selectedRoute).toEqual(dummyRoute);
  });
});
