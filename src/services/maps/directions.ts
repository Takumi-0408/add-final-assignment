import { getFunctions, httpsCallable } from 'firebase/functions';
import type { WalkRoute } from '../../types/routes';
import type { Priority } from '../../types/places';
import type { LatLng } from '../../hooks/locationUtils';
import type { AppError } from '../../utils/error';
import { withRetry } from '../../utils/retry';

type SearchWalkRoutesRequest = {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  priorities: Priority[];
  maxDurationMinutes?: number;
};

type SearchWalkRoutesResponse = {
  routes: WalkRoute[];
};

/**
 * Cloud Function `searchWalkRoutes` を呼び出して散歩ルート候補を取得する
 */
export async function searchWalkRoutes(
  origin: LatLng,
  destination: LatLng,
  priorities: Priority[],
  maxDurationMinutes?: number,
): Promise<WalkRoute[]> {
  const functions = getFunctions(undefined, 'asia-northeast1');
  const callable = httpsCallable<SearchWalkRoutesRequest, SearchWalkRoutesResponse>(
    functions,
    'searchWalkRoutes',
  );

  return withRetry(
    async () => {
      try {
        const result = await callable({
          origin: { lat: origin.latitude, lng: origin.longitude },
          destination: { lat: destination.latitude, lng: destination.longitude },
          priorities,
          maxDurationMinutes,
        });
        return result.data.routes;
      } catch (e) {
        // Firebase HttpsError → AppError に変換
        const err = e as { code?: string; message?: string };
        throw {
          code: `functions/${err.code ?? 'unknown'}`,
          message: toUserMessage(err.code),
          recoverable: isRecoverable(err.code),
        } satisfies AppError;
      }
    },
    { maxAttempts: 2, baseDelayMs: 1000 },
  );
}

function toUserMessage(code?: string): string {
  switch (code) {
    case 'not-found':
      return 'ルートが見つかりませんでした。条件を変えてお試しください';
    case 'resource-exhausted':
      return '混み合っています。しばらくしてからお試しください';
    case 'invalid-argument':
      return '検索条件が正しくありません';
    default:
      return 'ルート検索中にエラーが発生しました';
  }
}

function isRecoverable(code?: string): boolean {
  return code !== 'invalid-argument';
}
