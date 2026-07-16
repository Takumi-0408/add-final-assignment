# Task 1: 位置情報 & 地図表示 — 詳細設計

- **作成日**: 2026-07-16
- **依存**: Task 0 完了
- **目標**: 地図が表示され、現在地が取得・追従できる（F-01 / F-02）
- **参照**: `spec.md §4.1, §4.2(F-01/F-02), §8(S-01/S-02/S-05)`

---

## 実装方針

### 定数（`src/constants/location.ts`）
```ts
export const DEFAULT_LOCATION = { latitude: 35.6812, longitude: 139.7671 }; // 東京駅
export const LOCATION_UPDATE_INTERVAL_MS = 1000;
export const LOCATION_DISTANCE_FILTER_M = 5;
export const DEFAULT_MAP_DELTA = { latitudeDelta: 0.01, longitudeDelta: 0.01 };
```

### `useCurrentLocation` フック（`src/hooks/useCurrentLocation.ts`）
- 権限リクエスト → 許可済み: `watchPositionAsync`、拒否: `DEFAULT_LOCATION` を返す
- 戻り値: `{ location, hasPermission, isLoading, error }`
- ナビゲーション中以外はウォッチを停止（`useEffect` cleanup）

### ホーム画面（`app/(tabs)/index.tsx`）
- `MapView` + `Marker`（現在地）
- 権限拒否時: バナーで再許可導線（`Linking.openSettings()`）
- 検索バーは Task 3 で実装するため、タップ時は `router.push('/search')` のスタブのみ

### オンボーディング（`app/(onboarding).tsx` or ルート直下）
- AsyncStorage で `onboardingCompleted` フラグを管理
- 初回起動時のみ表示。`expo-location` の権限リクエスト UI

### スプラッシュ（`app/index.tsx` — ルートにリダイレクトロジック）
- `onAuthStateChanged` で認証状態確認
- `AsyncStorage` で初回起動確認 → オンボーディング or ホームへ

---

## TDD テストケース

### `useCurrentLocation` のテスト（`src/hooks/__tests__/useCurrentLocation.test.ts`）

| # | テストケース | 期待結果 |
|---|---|---|
| 1 | 権限が許可済みのとき | `hasPermission: true`、`location` が DEFAULT 以外の値を返す |
| 2 | 権限が拒否されたとき | `hasPermission: false`、`location` が `DEFAULT_LOCATION` を返す |
| 3 | 権限リクエスト中 | `isLoading: true` |
| 4 | GPS 取得失敗時 | `error` が設定される |

### `src/constants/location.ts` のテスト

| # | テストケース |
|---|---|
| 1 | `DEFAULT_LOCATION` が東京駅の座標であること |
| 2 | 各定数が期待する型・値であること |

---

## ファイル一覧

```
src/
  constants/
    location.ts
  hooks/
    useCurrentLocation.ts
    __tests__/
      useCurrentLocation.test.ts
  constants/__tests__/
    location.test.ts
app/
  index.tsx          # スプラッシュ兼ルートリダイレクト (S-01)
  onboarding.tsx     # オンボーディング (S-02)
  (tabs)/
    index.tsx        # ホーム地図画面 (S-05) — 既存スタブを実装
```

---

## 注意事項

- `react-native-maps` はシミュレータでも動作するが、実機テストが望ましい
- テスト環境では `expo-location` をモック（ネイティブモジュール）
- `AsyncStorage` もテスト環境でモック（`@react-native-async-storage/async-storage/jest/async-storage-mock`）
