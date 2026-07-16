# 散歩ナビ MVP 実装計画

- **作成日**: 2026-07-16
- **対象バージョン**: spec.md v1.2.0
- **開発スタイル**: t_wada 式 TDD（Red → Green → Refactor）
- **実装主体**: AI エージェント（各タスクは grilling で詳細計画を立ててから着手）

---

## 確定技術スタック

| 分類 | 技術 |
| --- | --- |
| フレームワーク | React Native（Expo SDK） + TypeScript（strict） |
| ナビゲーション | Expo Router |
| 状態管理 | Zustand（クライアント・サーバー状態を一元管理） |
| 地図 | react-native-maps（Google Maps SDK） |
| 場所検索 | Google Places API（Autocomplete） |
| 経路検索 | Google Directions API（Cloud Functions 経由） |
| ターンバイターン | Directions API steps を自前処理 |
| 位置情報 | expo-location |
| BaaS | Firebase Authentication / Firestore |
| サーバーロジック | Cloud Functions for Firebase（Gen 2 / Node.js 20 + esbuild） |
| テスト | Jest + React Native Testing Library |
| Lint / Format | ESLint / Prettier |
| CI/CD | GitHub Actions / EAS Build |

---

## タスク一覧

> 各タスクは 1 セッションで完結する粒度を目安とする。  
> 着手前に `grilling` で詳細設計を行い、t_wada 式 TDD（テストを先に書く）で実装する。  
> チェックが入ったタスクは実装完了を意味する。

---

### Task 0: プロジェクト基盤構築

**依存**: なし  
**目標**: CI が通り、空のアプリが起動できる状態を作る

- [x] **0-1** Expo + TypeScript プロジェクト初期化（`npx create-expo-app` / strict モード有効化）
- [x] **0-2** ESLint / Prettier 設定（ルール定義・`eslint.config.js` / `.prettierrc`）
- [x] **0-3** Jest + React Native Testing Library 設定（`jest.config.js` / サンプルテスト通過確認）
- [x] **0-4** GitHub Actions CI 設定（lint / typecheck / test を push/PR ごとに自動実行）
- [x] **0-5** Expo Router によるルーティング雛形・タブ構成（`(tabs)/`, `(auth)/` グループ）
- [x] **0-6** Firebase JS SDK 導入（Auth / Firestore / `src/services/firebase/client.ts`）
- [x] **0-7** Firestore セキュリティルール初期版の実装（`firestore.rules`）※デプロイは手動
- [x] **0-8** Google Maps Platform 設定準備・`.env.example` 整備（APIキー発行は手動）
- [x] **0-9** Cloud Functions プロジェクト初期化（Gen 2 / Node.js 20 / TypeScript スタブ）

---

### Task 1: 位置情報 & 地図表示（F-01 / F-02）

**依存**: Task 0  
**目標**: 地図が表示され、現在地が取得・追従できる

- [x] **1-1** `useCurrentLocation` フックの実装と単体テスト
  - expo-location による権限リクエスト
  - 許可済み: 位置情報を継続取得（更新間隔 1 秒 / 距離フィルタ 5m）
  - 拒否時: デフォルト地点（東京駅）を返す
- [x] **1-2** ホーム画面（S-05）の実装
  - react-native-maps による地図表示
  - 現在地マーカー・地図追従
  - 権限拒否時のフォールバック UI（設定アプリへの導線）
- [x] **1-3** オンボーディング画面（S-02）の実装
  - 初回起動判定（AsyncStorage）
  - 位置情報許可のリクエスト導線
- [x] **1-4** スプラッシュ画面（S-01）の実装
  - 認証状態確認・遷移先判定ロジックのテスト

---

### Task 2: ユーザー認証（F-08）

**依存**: Task 0  
**目標**: メール/パスワード・Google 認証でログイン/サインアップできる

- [x] **2-1** Firebase Auth サービス層の実装と単体テスト（`src/services/firebase/auth.ts`）
  - 匿名認証・メール/パスワード認証
  - エラーコードを `AppError` に変換するロジック（`src/utils/error.ts`）
- [x] **2-2** 認証状態を管理する Zustand ストアの実装とテスト（`src/stores/authStore.ts`）
- [x] **2-3** ログイン画面（S-03）の実装
- [x] **2-4** サインアップ画面（S-04）の実装
- [x] **2-5** 匿名→本登録のアカウントリンク処理（`authStore.linkEmail` 実装済み。UI は Task 8 で追加）

---

### Task 3: 目的地検索（F-03）

**依存**: Task 1  
**目標**: キーワードで目的地を検索し、地図上に表示できる

- [ ] **3-1** Places Autocomplete サービス層の実装と単体テスト（`src/services/maps/places.ts`）
  - 入力デバウンス 300ms
  - `AppError` へのエラー変換
- [ ] **3-2** 目的地を管理する Zustand ストアの実装とテスト（`src/stores/routeStore.ts` の一部）
- [ ] **3-3** 目的地検索画面（S-06）の実装と UI テスト
  - 候補リスト表示・選択
  - 選択後にホーム画面の地図へ反映

---

### Task 4: 散歩ルート検索 & スコアリング（F-04）

**依存**: Task 0（Cloud Functions）, Task 3  
**目標**: Cloud Functions が散歩に適したルートを返し、クライアントで受け取れる

- [ ] **4-1** `searchWalkRoutes` Cloud Function の骨格実装とテスト
  - リクエストバリデーション（座標範囲・priorities・maxDurationMinutes）
  - Directions API 呼び出し（`mode=walking&alternatives=true`）
- [ ] **4-2** 散歩スコアリングロジックの実装と単体テスト（`functions/src/scoring/`）
  - Places API（Nearby Search）でルート周辺 POI 密度評価
  - 幹線道路経由割合の低評価
  - priority ごとのサブスコア算出
- [ ] **4-3** ルートキャッシュ処理の実装とテスト（`routesCache` コレクション）
  - ルートハッシュ生成・TTL 管理
- [ ] **4-4** クライアント側ルート検索サービスの実装とテスト（`src/services/maps/directions.ts`）
  - Cloud Function 呼び出し・レスポンス型変換
- [ ] **4-5** ルート検索条件画面（S-07）の実装と UI テスト
  - 優先条件チェックボックス（自然 / 公園 / 川沿い / 静かさ）
  - 距離 / 時間指定

---

### Task 5: ルート提案表示（F-05）

**依存**: Task 4  
**目標**: 複数ルート候補を地図上に表示し、比較・選択できる

- [ ] **5-1** ポリラインデコードユーティリティの実装と単体テスト（`src/utils/polyline.ts`）
- [ ] **5-2** 距離・時間フォーマットユーティリティの実装と単体テスト（`src/utils/format.ts`）
- [ ] **5-3** `RoutePolyline` / `RouteMap` コンポーネントの実装と UI テスト（`src/components/map/`）
- [ ] **5-4** ルート提案画面（S-08）の実装と UI テスト
  - 複数候補のポリライン表示（未選択：グレー / 選択中：カラー）
  - 距離・所要時間・walkScore の表示
  - ルート選択操作

---

### Task 6: ナビゲーション（F-06）

**依存**: Task 5  
**目標**: 選択したルートに沿ったターンバイターン案内ができる

- [ ] **6-1** ルート逸脱検知ロジックの実装と単体テスト（`src/utils/navigation.ts`）
  - 現在地からルートまでの最短距離計算（30m 閾値）
- [ ] **6-2** 次の案内ステップ判定ロジックの実装と単体テスト
  - steps の中から次の曲がり角を特定し、方向・残距離を返す
- [ ] **6-3** ナビゲーション状態を管理する Zustand ストアの実装とテスト（`src/stores/navigationStore.ts`）
  - 現在ステップ・残距離・逸脱フラグ・リルート状態
- [ ] **6-4** ナビゲーション画面（S-09）の実装と UI テスト
  - 地図・現在地追従・ポリライン表示
  - 次の曲がり角案内パネル（方向アイコン・距離・道路名）
  - リルート中のローディング表示
- [ ] **6-5** 自動リルート処理の実装とテスト
  - 逸脱検知時に `searchWalkRoutes` を再呼び出し
  - 指数バックオフによる再試行（最大 2 回）

---

### Task 7: 散歩サマリー & お気に入り保存（F-07）

**依存**: Task 6, Task 2  
**目標**: ナビ終了後にサマリーを表示し、ルートをお気に入りに保存できる

- [ ] **7-1** Firestore お気に入りサービスの実装と単体テスト（`src/services/firebase/firestore.ts`）
  - 保存 / 一覧取得 / 削除操作
  - `AppError` へのエラー変換
- [ ] **7-2** お気に入りを管理する Zustand ストアの実装とテスト（`src/stores/favoritesStore.ts`）
- [ ] **7-3** 散歩サマリー画面（S-10）の実装と UI テスト
  - 歩行距離・所要時間の表示
  - ルート名入力 → お気に入り保存ボタン
  - 未ログイン時にログイン画面へ誘導
- [ ] **7-4** お気に入り一覧画面（S-11）の実装と UI テスト
  - 新着順リスト表示・削除
  - 未ログイン時のガード処理
- [ ] **7-5** お気に入り詳細画面（S-12）の実装と UI テスト
  - 保存ルートの地図表示
  - ナビ再開ボタン（S-09 へ遷移）

---

### Task 8: マイページ & 設定（F-08 付随 UI）

**依存**: Task 2  
**目標**: プロフィール確認・ログアウト・アカウント削除ができる

- [ ] **8-1** アカウント削除 Cloud Function の実装とテスト
  - Auth ユーザー削除 + Firestore 配下データ削除（Firestore トリガー）
- [ ] **8-2** マイページ画面（S-13）の実装と UI テスト
  - 表示名・メールアドレス表示
  - 設定画面への導線
- [ ] **8-3** 設定画面（S-14）の実装と UI テスト
  - 位置情報設定アプリへの導線
  - ログアウト処理
  - アカウント削除処理（確認ダイアログ付き）

---

### Task 9: エラーハンドリング & 品質整備

**依存**: Task 1〜8  
**目標**: 仕様書 §16 に定義された全エラーケースが正しく処理される

- [ ] **9-1** `AppError` 型と共通エラー変換ロジックの実装とテスト（`src/utils/error.ts`）
- [ ] **9-2** ErrorBoundary コンポーネントの実装とテスト
- [ ] **9-3** ネットワーク切断・オフライン時の挙動テストと修正
- [ ] **9-4** 各サービス層の指数バックオフ再試行ロジックの実装とテスト
- [ ] **9-5** カバレッジ計測と不足テストの追補（目標: services / utils で 70% 以上）

---

### Task 10: CI/CD & リリース準備

**依存**: Task 0〜9  
**目標**: EAS Build でストア提出用バイナリが生成できる

- [ ] **10-1** EAS Build 設定（`eas.json` / iOS・Android プロファイル）
- [ ] **10-2** GitHub Actions に EAS Build ジョブ追加（main マージ時に自動ビルド）
- [ ] **10-3** プライバシーポリシー・利用規約の整備（アプリ内表示 + URL）
- [ ] **10-4** App Store / Google Play 申請用メタデータ整備（スクリーンショット・説明文）
- [ ] **10-5** パフォーマンス最終確認（ルート検索 5 秒以内 / 地図 60fps）

---

## タスク依存関係

```
Task 0（基盤）
├── Task 1（地図・位置情報）
│   └── Task 3（目的地検索）
│       └── Task 4（ルート検索・スコアリング）
│           └── Task 5（ルート表示）
│               └── Task 6（ナビゲーション）
│                   └── Task 7（サマリー・お気に入り）
├── Task 2（認証）
│   ├── Task 7（サマリー・お気に入り）※認証が前提
│   └── Task 8（マイページ・設定）
└── Task 4（Cloud Functions）
        └── Task 6（ナビゲーション）

Task 9（品質整備）← Task 1〜8 完了後
Task 10（リリース準備）← Task 0〜9 完了後
```

---

## 各タスクの進め方（TDD）

1. **grilling で詳細計画を立てる** — インターフェース・テストケース・実装方針を確定
2. **テストを先に書く（Red）** — 失敗するテストを確認
3. **最小実装でテストを通す（Green）**
4. **リファクタリング（Refactor）** — コード品質を高め、CI が通ることを確認
5. **PR を作成してマージ** — lint / typecheck / test すべて通過を確認

---

## 改訂履歴

| 日付 | 内容 |
| --- | --- |
| 2026-07-16 | 初版作成 |
