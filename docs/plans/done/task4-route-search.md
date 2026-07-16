# Task 4: 散歩ルート検索 & スコアリング — 詳細設計

- **作成日**: 2026-07-16
- **依存**: Task 0（Cloud Functions）/ Task 3 完了
- **目標**: Cloud Functions が散歩に適したルートを返しクライアントが受け取れる（F-04）
- **参照**: `spec.md §4.2(F-04), §11.1`

---

## Cloud Functions 側

### `searchWalkRoutes`（`functions/src/searchWalkRoutes.ts`）

1. リクエストバリデーション（`zod` 不使用、手動チェック）
2. キャッシュ確認（`routesCache` コレクション）
3. Directions API 呼び出し（`mode=walking&alternatives=true`）
4. 各ルートにスコアリング実施
5. スコア降順にソートして返す

### スコアリング（`functions/src/scoring/`）

```
walkScore = Σ(サブスコア × 重み)
```

| サブスコア | 評価方法 | 重み |
|---|---|---|
| nature | ルート沿いの緑地 POI 密度（Parks Nearby Search） | 30% |
| park | 公園 POI の数 | 30% |
| river | 水辺 POI の数 | 20% |
| quiet | 幹線道路経由割合の逆数 | 20% |

MVP では Places API Nearby Search を使い、ルートの中間点半径 500m 以内の POI を取得。

### ルートキャッシュ（`routesCache`）

- キー: `sha256(origin+destination+priorities+maxDuration)` の先頭 16 文字
- TTL: 60 分（Cloud Functions が `expiresAt` で管理、クライアントは考慮不要）

---

## クライアント側

### `directions` サービス（`src/services/maps/directions.ts`）

- `getFunctions` + `httpsCallable` で Cloud Function を呼び出す
- レスポンスを `WalkRoute[]` 型に変換

```ts
type WalkRoute = {
  routeId: string;
  polyline: string;           // Encoded Polyline
  distanceMeters: number;
  durationSeconds: number;
  walkScore: number;
  scoreDetail: ScoreDetail;
  steps: RouteStep[];
};
type RouteStep = {
  instruction: string;
  distanceMeters: number;
  polyline: string;
  maneuver?: string;
};
```

### routeStore への追加

`Task 3` の routeStore に以下を追加:

```ts
routes: WalkRoute[];
selectedRoute: WalkRoute | null;
isSearching: boolean;
searchError: AppError | null;
searchRoutes: (origin: LatLng) => Promise<void>;
selectRoute: (route: WalkRoute) => void;
```

---

## TDD テストケース

### `functions/src/scoring/__tests__/scorer.test.ts`（Functions 側）

| # | テストケース |
|---|---|
| 1 | POI が多い結果は nature/park スコアが高い |
| 2 | 幹線道路割合が高いルートは quiet スコアが低い |
| 3 | walkScore が 0〜100 の範囲に収まる |
| 4 | priorities に応じて重み付けが変わる |

### `src/services/maps/__tests__/directions.test.ts`（クライアント側）

| # | テストケース |
|---|---|
| 1 | `searchWalkRoutes` を httpsCallable で呼び出す |
| 2 | レスポンスが WalkRoute[] に変換される |
| 3 | 呼び出しに失敗したとき AppError を throw |

### `src/stores/__tests__/routeStore.test.ts`（追加分）

| # | テストケース |
|---|---|
| 1 | `searchRoutes` 呼び出し中 `isSearching: true` |
| 2 | 成功後 `routes` がセット、`isSearching: false` |
| 3 | 失敗時 `searchError` がセット |
| 4 | `selectRoute` で `selectedRoute` がセット |

---

## ファイル一覧

```
functions/src/
  scoring/
    scorer.ts
    __tests__/
      scorer.test.ts
  searchWalkRoutes.ts   # スタブ → 実装
src/
  types/
    routes.ts           # WalkRoute / RouteStep 型
  services/maps/
    directions.ts
    __tests__/
      directions.test.ts
  stores/
    routeStore.ts       # Task 3 で作成 → 追加
app/
  route-options.tsx     # S-07 ルート検索条件画面（実装）
```
