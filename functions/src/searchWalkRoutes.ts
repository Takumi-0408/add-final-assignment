// TODO: Task 4 で実装する
import { onCall, HttpsError } from 'firebase-functions/v2/https';

// リクエスト型
interface SearchWalkRoutesRequest {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  priorities: ('nature' | 'park' | 'river' | 'quiet')[];
  maxDurationMinutes?: number;
}

export const searchWalkRoutes = onCall<SearchWalkRoutesRequest>(
  { region: 'asia-northeast1' },
  async (_request) => {
    // Task 4 で実装
    throw new HttpsError('unimplemented', 'searchWalkRoutes は未実装です');
  },
);
