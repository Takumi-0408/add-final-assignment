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
  // テスト用に既知のデコード座標を使う
  // "_p~iF~ps|U" → {lat: 38.5, lng: -120.2}（Google 例の単一点）
  // "_p~iF~ps|U_ulLnnqC" → 2点: (38.5, -120.2) と (40.7, -120.95)
  const STEP0_COORD: LatLng = { latitude: 38.5, longitude: -120.2 };

  const steps: RouteStep[] = [
    // step0: 38.5, -120.2（"_p~iF~ps|U" の単一点）
    { instruction: '北へ進む', distanceMeters: 100, polyline: '_p~iF~ps|U' },
    // step1: 先頭が 38.5, -120.2 で2点目が 40.7, -120.95 → 全点判定なら最近傍は step1 の2点目付近
    { instruction: '左折', distanceMeters: 200, polyline: '_p~iF~ps|U_ulLnnqC' },
  ];

  it('steps が空のとき null を返す', () => {
    expect(findCurrentStep(TOKYO_STATION, [])).toBeNull();
  });

  it('現在地が step0 の点に近いとき有効な result を返す', () => {
    const result = findCurrentStep(STEP0_COORD, steps);
    expect(result).not.toBeNull();
    expect(result!.index).toBeGreaterThanOrEqual(0);
  });

  it('現在地が step1 の末尾点（40.7, -120.95）に最も近いとき index: 1 を返す', () => {
    // 40.7, -120.95 は step1 の2点目 → step1 のみが近い
    // step0（38.5, -120.2）との距離 > step1 2点目との距離
    const nearStep1End: LatLng = { latitude: 40.7, longitude: -120.95 };
    const result = findCurrentStep(nearStep1End, steps);
    expect(result).not.toBeNull();
    expect(result!.index).toBe(1);
  });

  it('polyline が空のステップはスキップして有効なステップを返す', () => {
    const stepsWithEmpty: RouteStep[] = [
      { instruction: '空', distanceMeters: 0, polyline: '' },
      { instruction: '北へ進む', distanceMeters: 100, polyline: '_p~iF~ps|U' },
    ];
    const result = findCurrentStep(STEP0_COORD, stepsWithEmpty);
    expect(result).not.toBeNull();
    // 空ポリラインをスキップして index:1 が最近傍
    expect(result!.index).toBe(1);
  });
});
