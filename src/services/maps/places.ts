import type { PlacePrediction, PlaceDetail } from '../../types/places';
import type { AppError } from '../../utils/error';

const BASE_URL = 'https://maps.googleapis.com/maps/api/place';
const getApiKey = () => process.env.EXPO_PUBLIC_MAPS_API_KEY ?? '';

/** Places API エラーステータスを AppError に変換 */
function toPlacesError(status: string): AppError {
  switch (status) {
    case 'ZERO_RESULTS':
      return {
        code: 'places/zero-results',
        message: '該当する場所が見つかりませんでした',
        recoverable: true,
      };
    case 'NOT_FOUND':
      return {
        code: 'places/not-found',
        message: '場所の情報が取得できませんでした',
        recoverable: true,
      };
    case 'REQUEST_DENIED':
      return { code: 'places/request-denied', message: 'APIキーが無効です', recoverable: false };
    case 'OVER_QUERY_LIMIT':
      return {
        code: 'places/over-limit',
        message: 'しばらく時間をおいてから再試行してください',
        recoverable: true,
      };
    default:
      return {
        code: 'places/unknown',
        message: '場所の検索中にエラーが発生しました',
        recoverable: true,
      };
  }
}

/**
 * Places Autocomplete でキーワード検索する
 * - 空文字 / スペースのみのとき fetch せず [] を返す
 */
export async function searchPlaces(input: string): Promise<PlacePrediction[]> {
  if (!input.trim()) return [];

  const params = new URLSearchParams({
    input: input.trim(),
    language: 'ja',
    components: 'country:jp',
    key: getApiKey(),
  });

  const res = await fetch(`${BASE_URL}/autocomplete/json?${params.toString()}`);
  if (!res.ok) {
    throw {
      code: 'places/http-error',
      message: '検索リクエストに失敗しました',
      recoverable: true,
    } satisfies AppError;
  }

  const data = (await res.json()) as {
    status: string;
    predictions: {
      place_id: string;
      description: string;
      structured_formatting: { main_text: string; secondary_text: string };
    }[];
  };

  if (data.status === 'ZERO_RESULTS') return [];
  if (data.status !== 'OK') throw toPlacesError(data.status);

  return data.predictions.map((p) => ({
    placeId: p.place_id,
    description: p.description,
    mainText: p.structured_formatting.main_text,
    secondaryText: p.structured_formatting.secondary_text,
  }));
}

/**
 * Place Details で placeId から座標・名称を取得する
 */
export async function getPlaceDetail(placeId: string): Promise<PlaceDetail> {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: 'place_id,name,formatted_address,geometry',
    language: 'ja',
    key: getApiKey(),
  });

  const res = await fetch(`${BASE_URL}/details/json?${params.toString()}`);
  if (!res.ok) {
    throw {
      code: 'places/http-error',
      message: '場所の情報取得に失敗しました',
      recoverable: true,
    } satisfies AppError;
  }

  const data = (await res.json()) as {
    status: string;
    result: {
      place_id: string;
      name: string;
      formatted_address: string;
      geometry: { location: { lat: number; lng: number } };
    } | null;
  };

  if (data.status !== 'OK' || !data.result) throw toPlacesError(data.status);

  return {
    placeId: data.result.place_id,
    name: data.result.name,
    address: data.result.formatted_address,
    location: {
      latitude: data.result.geometry.location.lat,
      longitude: data.result.geometry.location.lng,
    },
  };
}
