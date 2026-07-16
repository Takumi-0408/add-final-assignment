import { getFunctions, httpsCallable } from 'firebase/functions';
import { searchWalkRoutes } from '../directions';
import type { WalkRoute } from '../../../types/routes';

jest.mock('firebase/functions');
jest.mock('../../firebase/client', () => ({ auth: {}, db: {} }));
jest.mock('firebase/app');

const mockGetFunctions = getFunctions as jest.MockedFunction<typeof getFunctions>;
const mockHttpsCallable = httpsCallable as jest.MockedFunction<typeof httpsCallable>;

const dummyRoute: WalkRoute = {
  routeId: 'r1',
  polyline: 'abc',
  distanceMeters: 2000,
  durationSeconds: 1800,
  walkScore: 75,
  scoreDetail: { nature: 80, park: 70, river: 60, quiet: 90 },
  steps: [],
};

beforeEach(() => jest.clearAllMocks());

describe('searchWalkRoutes', () => {
  const origin = { latitude: 35.6812, longitude: 139.7671 };
  const dest = { latitude: 35.658, longitude: 139.7016 };

  it('httpsCallable を正しい引数で呼び出す', async () => {
    const mockCallable = jest.fn().mockResolvedValue({ data: { routes: [dummyRoute] } });
    mockGetFunctions.mockReturnValue({} as ReturnType<typeof getFunctions>);
    mockHttpsCallable.mockReturnValue(mockCallable as never);

    await searchWalkRoutes(origin, dest, ['nature'], 30);

    expect(mockHttpsCallable).toHaveBeenCalledWith(expect.anything(), 'searchWalkRoutes');
    expect(mockCallable).toHaveBeenCalledWith({
      origin: { lat: 35.6812, lng: 139.7671 },
      destination: { lat: 35.658, lng: 139.7016 },
      priorities: ['nature'],
      maxDurationMinutes: 30,
    });
  });

  it('レスポンスが WalkRoute[] で返ってくる', async () => {
    const mockCallable = jest.fn().mockResolvedValue({ data: { routes: [dummyRoute] } });
    mockGetFunctions.mockReturnValue({} as ReturnType<typeof getFunctions>);
    mockHttpsCallable.mockReturnValue(mockCallable as never);

    const result = await searchWalkRoutes(origin, dest, []);
    expect(result).toEqual([dummyRoute]);
  });

  it('呼び出し失敗時に AppError を throw する', async () => {
    const mockCallable = jest.fn().mockRejectedValue({ code: 'not-found', message: 'no route' });
    mockGetFunctions.mockReturnValue({} as ReturnType<typeof getFunctions>);
    mockHttpsCallable.mockReturnValue(mockCallable as never);

    await expect(searchWalkRoutes(origin, dest, [])).rejects.toMatchObject({
      code: 'functions/not-found',
    });
  });
});
