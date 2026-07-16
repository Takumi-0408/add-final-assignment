import type { LatLng } from '../hooks/locationUtils';
import type { RouteStep } from '../types/routes';
import { decodePolyline } from './polyline';

/** Haversine 公式で2点間の距離（メートル）を返す */
export function distanceBetween(a: LatLng, b: LatLng): number {
  const R = 6_371_000; // 地球半径 (m)
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const c =
    sinDLat * sinDLat +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * sinDLng * sinDLng;
  return R * 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * 現在地がルート（座標列）から thresholdMeters 以上離れているか判定する
 * @param current 現在地
 * @param routePoints ルートの座標列
 * @param thresholdMeters 逸脱とみなす距離（デフォルト 30m）
 */
export function isDeviated(current: LatLng, routePoints: LatLng[], thresholdMeters = 30): boolean {
  if (routePoints.length === 0) return false;

  const minDistance = routePoints.reduce((min, point) => {
    const d = distanceBetween(current, point);
    return d < min ? d : min;
  }, Infinity);

  return minDistance > thresholdMeters;
}

export type StepResult = {
  index: number;
  step: RouteStep;
  distanceToNext: number;
};

/**
 * 現在地から次に案内すべきステップを返す
 * - 各ステップの最初の点と現在地の距離で判定
 */
export function findCurrentStep(current: LatLng, steps: RouteStep[]): StepResult | null {
  if (steps.length === 0) return null;

  let bestIndex = 0;
  let bestDistance = Infinity;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    const points = decodePolyline(step.polyline);
    if (points.length === 0) continue;
    const firstPoint = points[0]!;
    const d = distanceBetween(current, firstPoint);
    if (d < bestDistance) {
      bestDistance = d;
      bestIndex = i;
    }
  }

  const step = steps[bestIndex]!;
  return { index: bestIndex, step, distanceToNext: bestDistance };
}
