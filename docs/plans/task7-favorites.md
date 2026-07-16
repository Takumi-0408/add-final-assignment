# Task 7: 散歩サマリー & お気に入り保存 — 詳細設計

- **作成日**: 2026-07-16
- **依存**: Task 2（認証）/ Task 6（ナビゲーション）完了
- **目標**: ナビ終了後にサマリーを表示し、ルートをお気に入りとして保存・一覧・削除できる（F-07）
- **参照**: `spec.md §4.2(F-07), §10, §11.3`

---

## 型定義（`src/types/favorites.ts`）

```ts
type Favorite = {
  favoriteId: string;
  name: string;
  origin: { latitude: number; longitude: number };
  originName: string;
  destination: { latitude: number; longitude: number };
  destinationName: string;
  polyline: string;
  distanceMeters: number;
  durationSeconds: number;
  priorities: Priority[];
  createdAt: Date;
};
```

## Firestore サービス層（`src/services/firebase/firestore.ts`）

| 関数 | 説明 |
|---|---|
| `saveFavorite(uid, data)` | `users/{uid}/favorites` に addDoc |
| `getFavorites(uid)` | createdAt DESC で取得 |
| `deleteFavorite(uid, favoriteId)` | deleteDoc |

エラーは `AppError` に変換。

## favoritesStore（`src/stores/favoritesStore.ts`）

```ts
type FavoritesState = {
  favorites: Favorite[];
  isLoading: boolean;
  error: AppError | null;
  fetchFavorites: (uid: string) => Promise<void>;
  saveFavorite: (uid: string, data: Omit<Favorite, 'favoriteId' | 'createdAt'>) => Promise<void>;
  deleteFavorite: (uid: string, favoriteId: string) => Promise<void>;
  clearError: () => void;
};
```

---

## TDD テストケース

### `src/services/firebase/__tests__/firestore.test.ts`

| # | テストケース |
|---|---|
| 1 | `saveFavorite` が addDoc を呼ぶ |
| 2 | `getFavorites` が getDocs を呼び Favorite[] を返す |
| 3 | `deleteFavorite` が deleteDoc を呼ぶ |
| 4 | Firestore エラーが AppError に変換される |

### `src/stores/__tests__/favoritesStore.test.ts`

| # | テストケース |
|---|---|
| 1 | 初期状態 `favorites: [], isLoading: false` |
| 2 | `fetchFavorites` 中 `isLoading: true`、成功後 `favorites` セット |
| 3 | `saveFavorite` 成功後リスト再取得 |
| 4 | `deleteFavorite` 成功後リストから削除 |
| 5 | 失敗時 `error` セット |
