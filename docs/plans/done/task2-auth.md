# Task 2: ユーザー認証 — 詳細設計

- **作成日**: 2026-07-16
- **依存**: Task 0 完了
- **目標**: メール/パスワード・匿名認証でサインイン/サインアップできる（F-08）
- **参照**: `spec.md §4.1, §11, §17`

---

## 実装方針

### `AppError` 型（`src/utils/error.ts`）
全サービス層が共通で使うエラー型。Task 9 で拡充するが、Auth で先行して使う。
```ts
export type AppError = {
  code: string;
  message: string;      // ユーザー向け日本語メッセージ
  recoverable: boolean;
};
```

### Auth サービス層（`src/services/firebase/auth.ts`）

| 関数 | 説明 |
|---|---|
| `signInAnonymous()` | 匿名認証 |
| `signInWithEmail(email, password)` | メール/パスワード認証 |
| `signUpWithEmail(email, password)` | 新規登録 |
| `signOut()` | サインアウト |
| `linkEmailToAnonymous(email, password)` | 匿名→メール昇格 |
| `subscribeAuthState(callback)` | `onAuthStateChanged` ラッパー |

Firebase Auth エラーコードを `AppError` に変換するマッピング:

| Firebase code | message |
|---|---|
| `auth/email-already-in-use` | このメールアドレスはすでに使用されています |
| `auth/invalid-email` | 有効なメールアドレスを入力してください |
| `auth/wrong-password` | パスワードが正しくありません |
| `auth/user-not-found` | アカウントが見つかりませんでした |
| `auth/weak-password` | パスワードは6文字以上で入力してください |
| `auth/network-request-failed` | ネットワークエラーが発生しました。再試行してください |
| その他 | 認証エラーが発生しました |

### `authStore`（`src/stores/authStore.ts`）

```ts
type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: AppError | null;
  isAnonymous: boolean;
  // actions
  initialize: () => void;   // onAuthStateChanged を購読
  signInAnonymous: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  linkEmail: (email: string, password: string) => Promise<void>;
  clearError: () => void;
};
```

### 画面実装方針

**ログイン画面（S-03）**:
- メール / パスワード入力 + ログインボタン
- Google ログインボタン（MVP では UI のみ、実機接続は後回し）
- 「アカウントをお持ちでない方」→ サインアップ画面へ
- エラー時はフォーム下にメッセージ表示

**サインアップ画面（S-04）**:
- メール / パスワード / パスワード確認入力
- 登録ボタン
- 「すでにアカウントをお持ちの方」→ ログイン画面へ

**認証ガード（`app/_layout.tsx`）**:
- `authStore.user` が null でも基本 OK（ゲスト利用可）
- お気に入り・マイページへのアクセス時に認証を要求（Task 7/8 で実装）

---

## TDD テストケース

### `src/utils/__tests__/error.test.ts`

| # | テストケース |
|---|---|
| 1 | `toAppError('auth/email-already-in-use')` が正しい日本語メッセージを返す |
| 2 | 未知コードのとき fallback メッセージを返す |
| 3 | `recoverable: true / false` が適切に設定される |

### `src/services/firebase/__tests__/auth.test.ts`

| # | テストケース |
|---|---|
| 1 | `signInAnonymous` が `signInAnonymously` を呼ぶ |
| 2 | `signInWithEmail` が `signInWithEmailAndPassword` を呼ぶ |
| 3 | `signUpWithEmail` が `createUserWithEmailAndPassword` を呼ぶ |
| 4 | Firebase エラーが `AppError` に変換される |
| 5 | `signOut` が `signOut` を呼ぶ |
| 6 | `linkEmailToAnonymous` が `linkWithCredential` を呼ぶ |

### `src/stores/__tests__/authStore.test.ts`

| # | テストケース |
|---|---|
| 1 | 初期状態が `user: null, isLoading: false` |
| 2 | `signInAnonymous` 呼び出し中 `isLoading: true`、成功後 `user` がセット |
| 3 | 失敗時 `error` がセットされ `isLoading: false` |
| 4 | `clearError` で `error` が null になる |

---

## ファイル一覧

```
src/
  utils/
    error.ts
    __tests__/
      error.test.ts
  services/firebase/
    auth.ts
    __tests__/
      auth.test.ts
  stores/
    authStore.ts
    __tests__/
      authStore.test.ts
app/
  (auth)/
    login.tsx    # 既存スタブを実装
    signup.tsx   # 既存スタブを実装
  _layout.tsx    # 認証状態の初期化を追加
```
