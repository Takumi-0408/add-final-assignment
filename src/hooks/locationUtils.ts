import { DEFAULT_LOCATION } from '../constants/location';

export type LatLng = {
  latitude: number;
  longitude: number;
};

export type LocationResult = {
  hasPermission: boolean;
  location: LatLng;
};

/**
 * 権限状態と取得済み座標からロケーション結果を解決する純粋関数
 * テスト可能な中核ロジックをフックから分離
 */
export function resolveLocationOrDefault(
  hasPermission: boolean,
  coords: LatLng | null,
): LocationResult {
  if (!hasPermission || coords === null) {
    return { hasPermission, location: { ...DEFAULT_LOCATION } };
  }
  return { hasPermission: true, location: coords };
}
