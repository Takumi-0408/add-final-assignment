/**
 * useCurrentLocation の中核ロジックテスト
 * React フックの依存を避け、権限分岐・フォールバック・エラー処理を純粋関数として検証する
 */

import { DEFAULT_LOCATION } from '../../constants/location';
import { resolveLocationOrDefault, type LocationResult } from '../locationUtils';

describe('resolveLocationOrDefault', () => {
  it('権限が許可されているとき取得した座標を返す', () => {
    const result: LocationResult = resolveLocationOrDefault(true, {
      latitude: 35.6895,
      longitude: 139.6917,
    });
    expect(result.hasPermission).toBe(true);
    expect(result.location.latitude).toBe(35.6895);
    expect(result.location.longitude).toBe(139.6917);
  });

  it('権限が拒否されているとき DEFAULT_LOCATION を返す', () => {
    const result: LocationResult = resolveLocationOrDefault(false, null);
    expect(result.hasPermission).toBe(false);
    expect(result.location).toEqual(DEFAULT_LOCATION);
  });

  it('権限は許可だが座標が null のとき DEFAULT_LOCATION を返す', () => {
    const result: LocationResult = resolveLocationOrDefault(true, null);
    expect(result.hasPermission).toBe(true);
    expect(result.location).toEqual(DEFAULT_LOCATION);
  });
});
