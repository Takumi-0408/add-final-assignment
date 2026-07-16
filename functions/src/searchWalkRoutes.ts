import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { calculateWalkScore } from './scoring/scorer';
import type { Priority } from './scoring/scorer';

if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

// ─── 型定義 ─────────────────────────────────────────────────────────────────

interface LatLng { lat: number; lng: number }

interface SearchRequest {
  origin: LatLng;
  destination: LatLng;
  priorities: Priority[];
  maxDurationMinutes?: number;
}

interface RouteStep {
  instruction: string;
  distanceMeters: number;
  polyline: string;
  maneuver?: string;
}

interface WalkRouteResponse {
  routeId: string;
  polyline: string;
  distanceMeters: number;
  durationSeconds: number;
  walkScore: number;
  scoreDetail: Record<Priority, number>;
  steps: RouteStep[];
}

// ─── バリデーション ──────────────────────────────────────────────────────────

function validateRequest(data: unknown): SearchRequest {
  if (!data || typeof data !== 'object') throw new HttpsError('invalid-argument', '不正なリクエストです');
  const d = data as Record<string, unknown>;

  if (!d['origin'] || !d['destination']) throw new HttpsError('invalid-argument', '出発地・目的地が必要です');

  const origin = d['origin'] as Record<string, unknown>;
  const destination = d['destination'] as Record<string, unknown>;
  const oLat = origin['lat'];
  const oLng = origin['lng'];
  const dLat = destination['lat'];
  const dLng = destination['lng'];

  if (typeof oLat !== 'number' || typeof oLng !== 'number') {
    throw new HttpsError('invalid-argument', '出発地の座標が不正です');
  }
  if (typeof dLat !== 'number' || typeof dLng !== 'number') {
    throw new HttpsError('invalid-argument', '目的地の座標が不正です');
  }
  // 座標値域チェック
  if (oLat < -90 || oLat > 90 || oLng < -180 || oLng > 180) {
    throw new HttpsError('invalid-argument', '出発地の座標が範囲外です');
  }
  if (dLat < -90 || dLat > 90 || dLng < -180 || dLng > 180) {
    throw new HttpsError('invalid-argument', '目的地の座標が範囲外です');
  }

  const validPriorities: Priority[] = ['nature', 'park', 'river', 'quiet'];
  const priorities: Priority[] = Array.isArray(d['priorities'])
    ? (d['priorities'] as string[]).filter((p): p is Priority => validPriorities.includes(p as Priority))
    : [];

  const rawDuration = d['maxDurationMinutes'];
  const maxDurationMinutes =
    typeof rawDuration === 'number' && rawDuration > 0 && rawDuration <= 480
      ? rawDuration
      : undefined;

  return { origin: origin as unknown as LatLng, destination: destination as unknown as LatLng, priorities, maxDurationMinutes };
}

// ─── キャッシュ ──────────────────────────────────────────────────────────────

function makeCacheKey(req: SearchRequest): string {
  const str = JSON.stringify({
    o: req.origin,
    d: req.destination,
    p: [...req.priorities].sort(),
    m: req.maxDurationMinutes ?? null,
  });
  // 簡易ハッシュ（djb2）
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return Math.abs(hash).toString(16).slice(0, 16);
}

async function getCache(key: string): Promise<WalkRouteResponse[] | null> {
  try {
    const doc = await db.collection('routesCache').doc(key).get();
    if (!doc.exists) return null;
    const data = doc.data();
    if (!data) return null;
    const expiresAt = data['expiresAt'] as Timestamp;
    if (expiresAt.toMillis() < Date.now()) return null;
    return data['routes'] as WalkRouteResponse[];
  } catch {
    return null; // キャッシュ失敗は無視
  }
}

async function setCache(key: string, routes: WalkRouteResponse[]): Promise<void> {
  try {
    const expiresAt = Timestamp.fromMillis(Date.now() + 60 * 60 * 1000);
    await db.collection('routesCache').doc(key).set({
      routes,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt,
    });
  } catch {
    // キャッシュ保存失敗は無視
  }
}

// ─── Directions API ──────────────────────────────────────────────────────────

interface DirectionsRoute {
  overview_polyline: { points: string };
  legs: {
    distance: { value: number };
    duration: { value: number };
    steps: {
      html_instructions: string;
      distance: { value: number };
      polyline: { points: string };
      maneuver?: string;
    }[];
  }[];
}

async function fetchDirections(req: SearchRequest): Promise<DirectionsRoute[]> {
  const apiKey = process.env['MAPS_SERVER_API_KEY'] ?? '';
  const params = new URLSearchParams({
    origin: `${req.origin.lat},${req.origin.lng}`,
    destination: `${req.destination.lat},${req.destination.lng}`,
    mode: 'walking',
    alternatives: 'true',
    language: 'ja',
    key: apiKey,
  });

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`,
  );
  if (!res.ok) throw new HttpsError('internal', 'Directions API 呼び出しに失敗しました');

  const data = (await res.json()) as { status: string; routes: DirectionsRoute[] };
  if (data.status === 'ZERO_RESULTS') throw new HttpsError('not-found', '徒歩ルートが見つかりませんでした');
  if (data.status !== 'OK') throw new HttpsError('internal', `Directions API エラー: ${data.status}`);

  return data.routes;
}

// ─── POI スコアリング ────────────────────────────────────────────────────────

interface NearbyResult { place_id: string }

async function fetchNearbyPoi(
  lat: number,
  lng: number,
  type: string,
  radius = 500,
): Promise<number> {
  try {
    const apiKey = process.env['MAPS_SERVER_API_KEY'] ?? '';
    const params = new URLSearchParams({
      location: `${lat},${lng}`,
      radius: String(radius),
      type,
      key: apiKey,
    });
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`,
    );
    if (!res.ok) return 0;
    const data = (await res.json()) as { results: NearbyResult[] };
    return data.results.length;
  } catch {
    return 0;
  }
}


async function scoreRoute(
  route: DirectionsRoute,
  priorities: Priority[],
  midLat: number,
  midLng: number,
): Promise<WalkRouteResponse> {
  const leg = route.legs[0];
  if (!leg) throw new HttpsError('internal', 'ルートデータが不正です');

  // POI 取得（並列）
  const [natureCount, parkCount, riverCount] = await Promise.all([
    fetchNearbyPoi(midLat, midLng, 'natural_feature'),
    fetchNearbyPoi(midLat, midLng, 'park'),
    fetchNearbyPoi(midLat, midLng, 'river'),
  ]);

  // 幹線道路割合（steps の maneuver に 'turn' 系が少ない = 直線 = 幹線道路の可能性）
  const arterialRoadRatio = leg.steps.filter(
    (s) => !s.maneuver || s.maneuver === 'straight',
  ).length / Math.max(leg.steps.length, 1);

  const scoreDetail = {
    nature: Math.min(natureCount * 10, 100),
    park: Math.min(parkCount * 10, 100),
    river: Math.min(riverCount * 10, 100),
    quiet: Math.round((1 - arterialRoadRatio) * 100),
  };

  const walkScore = calculateWalkScore({
    naturePoiCount: natureCount,
    parkPoiCount: parkCount,
    riverPoiCount: riverCount,
    arterialRoadRatio,
    priorities,
  });

  const steps: RouteStep[] = leg.steps.map((s, i) => ({
    instruction: s.html_instructions.replace(/<[^>]+>/g, ''),
    distanceMeters: s.distance.value,
    polyline: s.polyline.points,
    maneuver: s.maneuver,
  }));

  return {
    routeId: `r_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    polyline: route.overview_polyline.points,
    distanceMeters: leg.distance.value,
    durationSeconds: leg.duration.value,
    walkScore,
    scoreDetail,
    steps,
  };
}

// ─── メイン Function ─────────────────────────────────────────────────────────

export const searchWalkRoutes = onCall<SearchRequest>(
  { region: 'asia-northeast1' },
  async (request) => {
    const req = validateRequest(request.data);

    // キャッシュ確認
    const cacheKey = makeCacheKey(req);
    const cached = await getCache(cacheKey);
    if (cached) return { routes: cached };

    // Directions API
    const directions = await fetchDirections(req);

    // 最大 3 候補をスコアリング
    const candidates = directions.slice(0, 3);

    // 各ルートの中間点を出発地・目的地の中点で近似
    const midLat = (req.origin.lat + req.destination.lat) / 2;
    const midLng = (req.origin.lng + req.destination.lng) / 2;

    const routes = await Promise.all(
      candidates.map((r) => scoreRoute(r, req.priorities, midLat, midLng)),
    );

    // walkScore 降順にソート
    routes.sort((a, b) => b.walkScore - a.walkScore);

    // maxDurationMinutes でフィルタ
    const maxSec = req.maxDurationMinutes ? req.maxDurationMinutes * 60 : Infinity;
    const filtered = routes.filter((r) => r.durationSeconds <= maxSec);
    const result = filtered.length > 0 ? filtered : routes;

    await setCache(cacheKey, result);
    return { routes: result };
  },
);
