import {
  saveFavorite as fsSave,
  getFavorites as fsGet,
  deleteFavorite as fsDel,
} from '../../services/firebase/firestore';
import { useFavoritesStore } from '../favoritesStore';
import type { Favorite } from '../../types/favorites';

jest.mock('../../services/firebase/firestore');
jest.mock('../../services/firebase/client', () => ({ auth: {}, db: {} }));
jest.mock('firebase/app');
jest.mock('firebase/firestore');

const mockSave = fsSave as jest.MockedFunction<typeof fsSave>;
const mockGet = fsGet as jest.MockedFunction<typeof fsGet>;
const mockDel = fsDel as jest.MockedFunction<typeof fsDel>;

const UID = 'user-1';

const dummyFav: Favorite = {
  favoriteId: 'fav-1',
  name: '多摩川ルート',
  origin: { latitude: 35.56, longitude: 139.71 },
  originName: '自宅',
  destination: { latitude: 35.59, longitude: 139.72 },
  destinationName: '○○公園',
  polyline: 'abc123',
  distanceMeters: 3200,
  durationSeconds: 2700,
  priorities: ['river'],
  createdAt: new Date('2026-07-16'),
};

beforeEach(() => {
  jest.clearAllMocks();
  useFavoritesStore.setState({ favorites: [], isLoading: false, error: null });
});

describe('favoritesStore 初期状態', () => {
  it('favorites: [], isLoading: false, error: null', () => {
    const s = useFavoritesStore.getState();
    expect(s.favorites).toEqual([]);
    expect(s.isLoading).toBe(false);
    expect(s.error).toBeNull();
  });
});

describe('fetchFavorites', () => {
  it('呼び出し中は isLoading: true', async () => {
    let resolve!: (v: Favorite[]) => void;
    mockGet.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );

    const p = useFavoritesStore.getState().fetchFavorites(UID);
    expect(useFavoritesStore.getState().isLoading).toBe(true);
    resolve([dummyFav]);
    await p;
  });

  it('成功後 favorites がセットされ isLoading: false', async () => {
    mockGet.mockResolvedValue([dummyFav]);
    await useFavoritesStore.getState().fetchFavorites(UID);
    expect(useFavoritesStore.getState().favorites).toEqual([dummyFav]);
    expect(useFavoritesStore.getState().isLoading).toBe(false);
  });

  it('失敗時 error がセットされ favorites は変わらない', async () => {
    const err = { code: 'firestore/unavailable', message: 'エラー', recoverable: true };
    mockGet.mockRejectedValue(err);
    await useFavoritesStore.getState().fetchFavorites(UID);
    expect(useFavoritesStore.getState().error).toMatchObject({ code: 'firestore/unavailable' });
  });
});

describe('saveFavorite', () => {
  it('保存後に fetchFavorites が呼ばれてリストが更新される', async () => {
    mockSave.mockResolvedValue('fav-2');
    mockGet.mockResolvedValue([dummyFav]);

    const { name, ...rest } = dummyFav;
    await useFavoritesStore.getState().saveFavorite(UID, { ...rest, name: '新ルート' });

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(useFavoritesStore.getState().favorites).toEqual([dummyFav]);
  });

  it('保存失敗時 error がセットされる', async () => {
    const err = { code: 'firestore/permission-denied', message: 'エラー', recoverable: false };
    mockSave.mockRejectedValue(err);

    const { name, favoriteId, createdAt, ...rest } = dummyFav;
    await useFavoritesStore.getState().saveFavorite(UID, { ...rest, name: '新ルート' });
    expect(useFavoritesStore.getState().error).toMatchObject({
      code: 'firestore/permission-denied',
    });
  });
});

describe('deleteFavorite', () => {
  it('削除後に favorites からアイテムが除かれる', async () => {
    useFavoritesStore.setState({ favorites: [dummyFav] });
    mockDel.mockResolvedValue(undefined);
    mockGet.mockResolvedValue([]);

    await useFavoritesStore.getState().deleteFavorite(UID, 'fav-1');

    expect(mockDel).toHaveBeenCalledWith(UID, 'fav-1');
    expect(useFavoritesStore.getState().favorites).toEqual([]);
  });
});

describe('clearError', () => {
  it('error が null になる', () => {
    useFavoritesStore.setState({ error: { code: 'test', message: 'e', recoverable: false } });
    useFavoritesStore.getState().clearError();
    expect(useFavoritesStore.getState().error).toBeNull();
  });
});
