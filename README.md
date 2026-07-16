# 散歩ナビ

景色・自然・公園・川沿いなど「歩くこと自体を楽しめるルート」を提案する散歩専用ナビゲーションアプリ。

- **仕様書**: [`spec.md`](./spec.md)
- **実装計画**: [`docs/plans/mvp_plans.md`](./docs/plans/mvp_plans.md)

---

## 技術スタック

| 分類 | 技術 |
| --- | --- |
| アプリ | React Native（Expo SDK 57）+ TypeScript strict |
| 画面遷移 | Expo Router |
| 状態管理 | Zustand |
| 地図 | react-native-maps（Google Maps SDK） |
| BaaS | Firebase Auth / Firestore |
| サーバー | Cloud Functions Gen 2（Node.js 20） |
| テスト | Jest + React Native Testing Library |

---

## セットアップ

### 必要なもの

- Node.js 20 以上
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Firebase プロジェクト
- Google Maps Platform API キー

### 手順

```bash
# 依存パッケージのインストール
npm install --legacy-peer-deps

# 環境変数の設定
cp .env.example .env
# .env を編集して各種 API キーを設定する

# 開発サーバー起動
npm start
```

### Cloud Functions のセットアップ

```bash
cd functions
npm install --legacy-peer-deps

# Firebase プロジェクトにデプロイ
npx firebase deploy --only functions,firestore:rules
```

---

## 環境変数

`.env.example` を `.env` にコピーして設定します。

| 変数名 | 説明 |
| --- | --- |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase Web API キー |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth ドメイン |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Firebase プロジェクト ID |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage バケット |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Firebase App ID |
| `EXPO_PUBLIC_MAPS_API_KEY` | Google Maps SDK / Places Autocomplete 用キー（クライアント制限設定済み） |
| `EAS_PROJECT_ID` | EAS Build プロジェクト ID（ビルド時のみ） |

> **注意**: Cloud Functions で使用する Maps Server API キー（`MAPS_SERVER_API_KEY`）は  
> Firebase Functions の環境変数として設定します。`.env` には含めません。

---

## 開発コマンド

```bash
# テスト実行
npm test

# カバレッジ計測
npm run test:coverage

# 型チェック
npm run typecheck

# Lint
npm run lint
```

---

## ディレクトリ構成（抜粋）

```
.
├── app/                    # 画面（Expo Router）
│   ├── (auth)/             # ログイン・サインアップ
│   ├── (tabs)/             # ホーム・お気に入り・マイページ
│   ├── navigation.tsx      # ナビゲーション
│   └── ...
├── src/
│   ├── components/ui/      # 共通 UI コンポーネント
│   ├── constants/          # 定数
│   ├── hooks/              # カスタムフック
│   ├── services/           # 外部サービス連携
│   │   ├── firebase/       # Auth / Firestore
│   │   └── maps/           # Places / Directions
│   ├── stores/             # Zustand ストア
│   ├── types/              # 型定義
│   └── utils/              # ユーティリティ
├── functions/              # Cloud Functions（Node.js 20）
│   └── src/
│       ├── scoring/        # 散歩スコアリングロジック
│       └── searchWalkRoutes.ts
├── firestore.rules         # Firestore セキュリティルール
├── eas.json                # EAS Build 設定
└── app.config.ts           # Expo 設定
```
