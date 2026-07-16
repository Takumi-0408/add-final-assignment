# Task 0: プロジェクト基盤構築 — 詳細設計

- **作成日**: 2026-07-16
- **依存**: なし
- **目標**: CI が通り、空のアプリが起動できる状態を作る
- **参照**: `spec.md §7`, `docs/plans/mvp_plans.md Task 0`

---

## 使用バージョン（確定）

| パッケージ | バージョン |
| --- | --- |
| Expo SDK | 57 |
| expo-router | 57.0.6 |
| React Native | 0.76.x（Expo 57 同梱） |
| TypeScript | 5.x（Expo 57 同梱） |
| Zustand | 5.0.x |
| react-native-maps | 1.29.0 |
| expo-location | 57.0.4 |
| firebase（JS SDK v9 modular） | 12.x |
| firebase-functions | 7.x |
| firebase-admin | 14.x |
| ESLint | 10.x |
| Prettier | 3.x |
| Jest | 29.x（Expo 57 同梱） |
| @testing-library/react-native | 14.x |

> **注**: Firebase は JS SDK（`firebase` パッケージ）を使用する。`@react-native-firebase` はネイティブモジュールが必要で Expo Go と相性が悪いため採用しない。

---

## サブタスク詳細

### 0-1: Expo + TypeScript プロジェクト初期化

**作業手順**:

1. `npx create-expo-app@latest . --template blank-typescript` でカレントディレクトリに生成
2. `tsconfig.json` を strict モードに変更:
   ```json
   {
     "extends": "expo/tsconfig.base",
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "strictNullChecks": true,
       "noUncheckedIndexedAccess": true
     }
   }
   ```
3. `app.config.ts` を作成（`app.json` を TypeScript 化）し、環境変数からの読み込み口を用意する
4. 不要ファイル（`App.tsx` など Expo Router 移行前の残骸）を削除

**確認**: `npx tsc --noEmit` がエラーなく通ること

---

### 0-2: ESLint / Prettier 設定

**採用ルールセット**:
- `eslint-config-expo`（Expo 推奨）をベースに使用
- `@typescript-eslint/no-explicit-any` を `error` に設定
- `prettier` をフォーマッタとして統合（`eslint-plugin-prettier`）

**ファイル**:

```
.eslintrc.js
.prettierrc
.eslintignore
```

`.eslintrc.js`:
```js
module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    'no-console': 'warn',
  },
};
```

`.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}
```

**確認**: `npx eslint .` がエラーなく通ること

---

### 0-3: Jest + React Native Testing Library 設定

**パッケージ**:
```
jest-expo  （Expo 57 同梱の preset）
@testing-library/react-native@14.x
@testing-library/jest-native（カスタムマッチャー）
```

**`jest.config.js`**:
```js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterFramework: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/services/**/*.ts',
    'src/utils/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: { lines: 70 },
  },
};
```

**サンプルテスト**: `src/utils/__tests__/sample.test.ts` にダミーテストを作成して通過確認

**確認**: `npx jest --coverage` が通ること

---

### 0-4: GitHub Actions CI 設定

**ファイル**: `.github/workflows/ci.yml`

**トリガー**: `push` (main) / `pull_request`

**ジョブ**:
```yaml
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx tsc --noEmit        # 型チェック
      - run: npx eslint .            # Lint
      - run: npx jest --coverage     # テスト + カバレッジ
```

---

### 0-5: Expo Router ルーティング雛形・タブ構成

**ディレクトリ構成**（`app/` 以下）:

```
app/
├── _layout.tsx              # ルートレイアウト（認証ガード・ErrorBoundary）
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx            # S-03 ログイン（スタブ）
│   └── signup.tsx           # S-04 サインアップ（スタブ）
├── (tabs)/
│   ├── _layout.tsx          # タブバー定義
│   ├── index.tsx            # S-05 ホーム（地図）スタブ
│   ├── favorites.tsx        # S-11 お気に入り一覧スタブ
│   └── mypage.tsx           # S-13 マイページスタブ
├── search.tsx               # S-06 目的地検索スタブ
├── route-options.tsx        # S-07 ルート検索条件スタブ
├── route-suggestions.tsx    # S-08 ルート提案スタブ
├── navigation.tsx           # S-09 ナビゲーションスタブ
├── summary.tsx              # S-10 散歩サマリースタブ
├── favorite/
│   └── [id].tsx             # S-12 お気に入り詳細スタブ
└── settings.tsx             # S-14 設定スタブ
```

各スタブは `<View><Text>画面名</Text></View>` のみ。  
`src/` ディレクトリも作成し、`components/`, `hooks/`, `services/`, `stores/`, `types/`, `utils/`, `constants/` の空フォルダを用意する（`.gitkeep` を配置）。

**パスエイリアス**: `tsconfig.json` に `"paths": { "@/*": ["src/*"] }` を追加。

**確認**: `npx expo start` でアプリが起動し、タブ遷移が動作すること

---

### 0-6: Firebase SDK 導入

**採用**: Firebase JS SDK v9（modular）。`firebase` パッケージのみ使用。

**理由**: Expo Go との互換性。ネイティブモジュール不要。

**インストール**:
```
npm install firebase
```

**初期化ファイル**: `src/services/firebase/client.ts`

```ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;

export const auth = getAuth(app);
export const db = getFirestore(app);
```

**注**: Firebase プロジェクト自体の作成・コンソール操作は人間が行う前提。SDK 導入とコードのみ実装する。

---

### 0-7: Firestore セキュリティルール初期版

**ファイル**: `firestore.rules`

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /favorites/{favoriteId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
        // ルート名は最大50文字
        allow create: if request.resource.data.name.size() <= 50;
      }
      match /walkLogs/{walkLogId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    // routesCache はクライアントから直接アクセス不可（Functionsのみ）
    match /routesCache/{routeHash} {
      allow read, write: if false;
    }
  }
}
```

**注**: `firebase deploy --only firestore:rules` は Firebase プロジェクト設定完了後に実行。ファイルのみ作成する。

---

### 0-8: 環境変数テンプレート整備

**ファイル**: `.env.example`

```
# Firebase（クライアント用 - Expo Public）
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

# Google Maps Platform（クライアント用 - 地図描画・Autocomplete）
EXPO_PUBLIC_MAPS_API_KEY=

# Google Maps Platform（サーバー用 - Cloud Functions 環境変数として設定）
# MAPS_SERVER_API_KEY=  ← Cloud Functions の環境変数に設定。.env には書かない
```

`.gitignore` に `.env` を追加確認（`create-expo-app` のデフォルトに含まれる想定だが確認する）。

---

### 0-9: Cloud Functions プロジェクト初期化

**ディレクトリ**: `functions/`

**構成**:
```
functions/
├── src/
│   ├── index.ts           # Function エクスポート
│   └── searchWalkRoutes.ts  # スタブ（Task 4 で実装）
├── package.json
├── tsconfig.json
└── .eslintrc.js
```

**`functions/package.json`** の主要設定:
```json
{
  "engines": { "node": "20" },
  "main": "lib/index.js",
  "scripts": {
    "build": "npx tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
    "test": "npx jest"
  },
  "dependencies": {
    "firebase-admin": "^14.0.0",
    "firebase-functions": "^7.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "esbuild": "^0.28.0"
  }
}
```

`functions/src/index.ts` にはスタブの `searchWalkRoutes` をエクスポートするだけ。

**`firebase.json`** を作成し functions / firestore の設定を記載。

---

## TDD 方針

このタスクは「基盤構築」のため、テストコードより設定ファイルが主体になる。  
ただし以下はテストファースト（Red → Green）で進める:

| 対象 | テスト内容 |
| --- | --- |
| `src/utils/__tests__/sample.test.ts` | Jest + RNTL のセットアップ確認用ダミーテスト |
| `src/services/firebase/__tests__/client.test.ts` | `initializeApp` が二重初期化しないことのテスト |

---

## 完了条件

- [ ] `npx tsc --noEmit` が通る
- [ ] `npx eslint .` が通る
- [ ] `npx jest --coverage` が通る（lines 70% 以上）
- [ ] `npx expo start` でアプリが起動し、タブ遷移が動作する
- [ ] `functions/` の TypeScript が `npx tsc --noEmit` でエラーなし
- [ ] `.env.example` に全環境変数が記載されている
- [ ] `firestore.rules` が存在する
- [ ] `AGENTS.md` の手順（lint / typecheck / test）が全て通る

---

## 注意事項

- Firebase コンソール・Google Cloud コンソールの操作（プロジェクト作成・APIキー発行）は **人間が行う作業** のためスキップし、コードと設定ファイルのみ実装する
- `EXPO_PUBLIC_*` 変数が未設定の場合でも `npx tsc` / `npx jest` は通るよう、Firebase 初期化を条件分岐するか、テストでモックする
