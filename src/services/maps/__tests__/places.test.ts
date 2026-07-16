/**
 * Places サービス層テスト
 * fetch をモックして API 呼び出しを検証する
 */

// global fetch をモック
import { searchPlaces, getPlaceDetail } from '../places';

const mockFetch = jest.fn();
(globalThis as typeof globalThis & { fetch: typeof fetch }).fetch = mockFetch;

const AUTOCOMPLETE_RESPONSE = {
  status: 'OK',
  predictions: [
    {
      place_id: 'place_1',
      description: '渋谷駅, 東京都渋谷区',
      structured_formatting: {
        main_text: '渋谷駅',
        secondary_text: '東京都渋谷区',
      },
    },
  ],
};

const DETAILS_RESPONSE = {
  status: 'OK',
  result: {
    place_id: 'place_1',
    name: '渋谷駅',
    formatted_address: '東京都渋谷区',
    geometry: { location: { lat: 35.658, lng: 139.7016 } },
  },
};

beforeEach(() => mockFetch.mockReset());

describe('searchPlaces', () => {
  it('空文字のとき fetch を呼ばず空配列を返す', async () => {
    const result = await searchPlaces('');
    expect(mockFetch).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('スペースのみのとき空配列を返す', async () => {
    const result = await searchPlaces('   ');
    expect(mockFetch).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('有効なキーワードで fetch を呼び PlacePrediction[] を返す', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => AUTOCOMPLETE_RESPONSE,
    });
    const result = await searchPlaces('渋谷');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      placeId: 'place_1',
      description: '渋谷駅, 東京都渋谷区',
      mainText: '渋谷駅',
      secondaryText: '東京都渋谷区',
    });
  });

  it('API が ZERO_RESULTS を返すとき空配列を返す', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ZERO_RESULTS', predictions: [] }),
    });
    const result = await searchPlaces('存在しない場所xyz');
    expect(result).toEqual([]);
  });

  it('fetch が失敗したとき AppError を throw する', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 400 });
    await expect(searchPlaces('渋谷')).rejects.toMatchObject({ code: 'places/http-error' });
  });

  it('API が REQUEST_DENIED を返すとき AppError を throw する', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'REQUEST_DENIED', predictions: [] }),
    });
    await expect(searchPlaces('渋谷')).rejects.toMatchObject({ code: 'places/request-denied' });
  });
});

describe('getPlaceDetail', () => {
  it('placeId から PlaceDetail を返す', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => DETAILS_RESPONSE,
    });
    const result = await getPlaceDetail('place_1');
    expect(result).toMatchObject({
      placeId: 'place_1',
      name: '渋谷駅',
      address: '東京都渋谷区',
      location: { latitude: 35.658, longitude: 139.7016 },
    });
  });

  it('NOT_FOUND のとき AppError を throw する', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'NOT_FOUND', result: null }),
    });
    await expect(getPlaceDetail('invalid')).rejects.toMatchObject({ code: 'places/not-found' });
  });
});
