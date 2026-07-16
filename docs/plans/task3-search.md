# Task 3: 目的地検索 — 詳細設計

- **作成日**: 2026-07-16
- **依存**: Task 1 完了
- **目標**: キーワードで目的地を検索し、地図上に表示できる（F-03）
- **参照**: `spec.md §4.2(F-03), §11.2`

---

## 実装方針

### Places Autocomplete サービス（`src/services/maps/places.ts`）

- Google Places API の Autocomplete エンドポイントを REST で直接呼ぶ
  - `https://maps.googleapis.com/maps/api/place/autocomplete/json`
- `EXPO_PUBLIC_MAPS_API_KEY` を使用（クライアントサイドキー）
- デバウンス 300ms は呼び出し側（フック）で実施
- エラーは `AppError` に変換して throw

```ts
// 返却型
type PlacePrediction = {
  placeId: string;
  description: string;   // "渋谷駅, 東京都渋谷区..."
  mainText: string;      // "渋谷駅"
  secondaryText: string; // "東京都渋谷区..."
};

// Place Details で座標取得
type PlaceDetail = {
  placeId: string;
  name: string;
  address: string;
  location: { latitude: number; longitude: number };
};
```

### routeStore（`src/stores/routeStore.ts`）

目的地・優先条件・ルート候補を管理するストア。

```ts
type RouteState = {
  destination: PlaceDetail | null;
  priorities: Priority[];
  maxDurationMinutes: number | null;
  // actions
  setDestination: (place: PlaceDetail) => void;
  clearDestination: () => void;
  setPriorities: (p: Priority[]) => void;
  setMaxDuration: (min: number | null) => void;
};

type Priority = 'nature' | 'park' | 'river' | 'quiet';
```

### 目的地検索画面（S-06）

- `TextInput` に入力 → 300ms デバウンス → `searchPlaces()` 呼び出し
- 候補リスト表示（`FlatList`）
- 候補タップ → `getPlaceDetail()` で座標取得 → `routeStore.setDestination()` → `router.push('/route-options')`

---

## TDD テストケース

### `src/services/maps/__tests__/places.test.ts`

| # | テストケース |
|---|---|
| 1 | `searchPlaces('')` は空配列を返す（API を叩かない） |
| 2 | `searchPlaces('渋谷')` が fetch を呼び出し PlacePrediction[] を返す |
| 3 | API がエラーを返したとき AppError を throw する |
| 4 | `getPlaceDetail('place_id')` が PlaceDetail を返す |
| 5 | 取得失敗時に AppError を throw する |

### `src/stores/__tests__/routeStore.test.ts`

| # | テストケース |
|---|---|
| 1 | 初期状態が `destination: null, priorities: []` |
| 2 | `setDestination` で destination がセットされる |
| 3 | `clearDestination` で destination が null になる |
| 4 | `setPriorities` で優先条件が更新される |

---

## ファイル一覧

```
src/
  types/
    places.ts          # PlacePrediction / PlaceDetail / Priority 型
  services/maps/
    places.ts
    __tests__/
      places.test.ts
  stores/
    routeStore.ts
    __tests__/
      routeStore.test.ts
app/
  search.tsx           # 既存スタブを実装（S-06）
  route-options.tsx    # Task 4 で実装（S-07）
```
