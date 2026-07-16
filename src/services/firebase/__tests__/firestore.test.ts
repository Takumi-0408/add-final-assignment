import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { saveFavorite, getFavorites, deleteFavorite } from '../firestore';
import type { FavoriteInput } from '../../../types/favorites';

jest.mock('firebase/firestore');
jest.mock('../client', () => ({ auth: {}, db: {} }));
jest.mock('firebase/app');

const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;

const UID = 'user-1';
const FAV_ID = 'fav-1';

const dummyInput: FavoriteInput = {
  name: '多摩川ルート',
  origin: { latitude: 35.56, longitude: 139.71 },
  originName: '自宅',
  destination: { latitude: 35.59, longitude: 139.72 },
  destinationName: '○○公園',
  polyline: 'abc123',
  distanceMeters: 3200,
  durationSeconds: 2700,
  priorities: ['river', 'quiet'],
};

beforeEach(() => jest.clearAllMocks());

describe('saveFavorite', () => {
  it('addDoc を正しい引数で呼び出す', async () => {
    const mockRef = { id: FAV_ID };
    mockCollection.mockReturnValue({} as ReturnType<typeof collection>);
    mockAddDoc.mockResolvedValue(mockRef as never);

    const id = await saveFavorite(UID, dummyInput);

    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    expect(id).toBe(FAV_ID);
  });

  it('Firestore エラーを AppError に変換する', async () => {
    mockCollection.mockReturnValue({} as ReturnType<typeof collection>);
    const fsError = Object.assign(new Error('Permission denied'), { code: 'permission-denied' });
    mockAddDoc.mockRejectedValue(fsError);

    await expect(saveFavorite(UID, dummyInput)).rejects.toMatchObject({
      code: 'firestore/permission-denied',
    });
  });
});

describe('getFavorites', () => {
  it('getDocs を呼び Favorite[] を返す', async () => {
    const mockSnap = {
      docs: [
        {
          id: FAV_ID,
          data: () => ({
            name: '多摩川ルート',
            origin: { latitude: 35.56, longitude: 139.71 },
            originName: '自宅',
            destination: { latitude: 35.59, longitude: 139.72 },
            destinationName: '○○公園',
            polyline: 'abc123',
            distanceMeters: 3200,
            durationSeconds: 2700,
            priorities: ['river', 'quiet'],
            createdAt: { toDate: () => new Date('2026-07-16') },
          }),
        },
      ],
    };
    mockCollection.mockReturnValue({} as ReturnType<typeof collection>);
    mockQuery.mockReturnValue({} as ReturnType<typeof query>);
    mockOrderBy.mockReturnValue({} as ReturnType<typeof orderBy>);
    mockGetDocs.mockResolvedValue(mockSnap as never);

    const result = await getFavorites(UID);

    expect(mockGetDocs).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ favoriteId: FAV_ID, name: '多摩川ルート' });
  });

  it('Firestore エラーを AppError に変換する', async () => {
    mockCollection.mockReturnValue({} as ReturnType<typeof collection>);
    mockQuery.mockReturnValue({} as ReturnType<typeof query>);
    mockOrderBy.mockReturnValue({} as ReturnType<typeof orderBy>);
    const fsError = Object.assign(new Error('unavailable'), { code: 'unavailable' });
    mockGetDocs.mockRejectedValue(fsError);

    await expect(getFavorites(UID)).rejects.toMatchObject({ code: 'firestore/unavailable' });
  });
});

describe('deleteFavorite', () => {
  it('deleteDoc を正しい引数で呼び出す', async () => {
    mockDoc.mockReturnValue({} as ReturnType<typeof doc>);
    mockDeleteDoc.mockResolvedValue(undefined);

    await deleteFavorite(UID, FAV_ID);

    expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
  });
});
