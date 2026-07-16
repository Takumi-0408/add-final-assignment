import { isDeviated, findCurrentStep, distanceBetween } from '../navigation';
import type { RouteStep } from '../../types/routes';
import type { LatLng } from '../../hooks/locationUtils';

// 簡易ポリライン（東京駅周辺の1点）
const TOKYO_STATION: LatLng = { latitude: 35.6812, longitude: 139.7671 };
const NEARBY: LatLng = { latitude: 35.6815, longitude: 139.7675 }; // 約40m先
const FAR: LatLng = { latitude: 35.7, longitude: 139.8 }; // 約3.5km先

describe('distanceBetween', () => {
  it('同じ座標のとき 0 を返す', () => {
    expect(distanceBetween(TOKYO_STATION, TOKYO_STATION)).toBe(0);
  });

  it('近い2点の距離が正の値を返す', () => {
    const d = distanceBetween(TOKYO_STATION, NEARBY);
    expect(d).toBeGreaterThan(0);
    expect(d).toBeLessThan(100);
  });

  it('東京〜大阪の距離がおよそ 400km', () => {
    const osaka = { latitude: 34.6937, longitude: 135.5023 };
    const d = distanceBetween(TOKYO_STATION, osaka);
    expect(d).toBeGreaterThan(350_000);
    expect(d).toBeLessThan(450_000);
  });
});

describe('isDeviated', () => {
  it('ルート上（30m 以内）のとき false', () => {
    // ルートが東京駅の1点のみ → 現在地も東京駅
    expect(isDeviated(TOKYO_STATION, [TOKYO_STATION], 30)).toBe(false);
  });

  it('ルートから 30m 以上離れたとき true', () => {
    expect(isDeviated(FAR, [TOKYO_STATION], 30)).toBe(true);
  });

  it('ルートが空のとき false を返す（安全側）', () => {
    expect(isDeviated(TOKYO_STATION, [], 30)).toBe(false);
  });
});

describe('findCurrentStep', () => {
  const steps: RouteStep[] = [
    { instruction: '北へ進む', distanceMeters: 100, polyline: '_p~iF~ps|U' },
    { instruction: '左折', distanceMeters: 200, polyline: '_p~iF~ps|U_ulLnnqC' },
  ];

  it('steps が空のとき null を返す', () => {
    expect(findCurrentStep(TOKYO_STATION, [])).toBeNull();
  });

  it('最初のステップを返す（シンプルケース）', () => {
    const result = findCurrentStep(TOKYO_STATION, steps);
    expect(result).not.toBeNull();
    expect(result!.index).toBeGreaterThanOrEqual(0);
  });
});
