# AGENTS.md

## プロジェクト概要

散歩に適したルートを提案するモバイルナビアプリ（React Native / Expo）。
仕様: [`spec.md`](./spec.md) / MVP 実装計画: [`docs/plans/mvp_plans.md`](./docs/plans/mvp_plans.md)

---

## 開発ルール

### Git
- `main` へ直接コミット（PR 不要）
- コミットメッセージは日本語・Conventional Commits 形式
  ```
  feat: ルート検索条件画面を追加
  fix: GPS許可拒否時のクラッシュを修正
  ```

### plan ファイル
- `docs/plans/` に格納。完了したものは `docs/plans/done/` へ移動

### コード規約
- TypeScript strict モード。`any` 禁止（やむを得ない場合はコメントで理由を明記）
- ビジネスロジックは `hooks/` / `services/` / `stores/` に分離。画面に書かない
- 外部 API 呼び出しは必ず `services/` 経由
- グローバル状態は Zustand。画面ローカルは `useState`
- マジックナンバーは `src/constants/` に定義

### テスト（t_wada 式 TDD）
Red → Green → Refactor の順で進める。テストを先に書く。

```
# テスト実行
npx jest

# 型チェック
npx tsc --noEmit

# Lint
npx eslint .
```

`services/` と `utils/` のカバレッジ目標: 70% 以上

---

## 技術スタック（抜粋）

| 分類 | 技術 |
| --- | --- |
| アプリ | React Native (Expo) + TypeScript strict |
| 画面遷移 | Expo Router |
| 状態管理 | Zustand |
| 地図 | react-native-maps (Google Maps SDK) |
| BaaS | Firebase Auth / Firestore |
| サーバー | Cloud Functions Gen 2 (Node.js 20 + esbuild) |
| テスト | Jest + React Native Testing Library |

全スタック詳細は `spec.md §7` 参照。

---

## タスクの進め方

1. `docs/plans/mvp_plans.md` で次に着手するタスクを確認する
2. 着手前に `/grilling` で詳細設計を行う
3. TDD で実装（Red → Green → Refactor）
4. `mvp_plans.md` のチェックボックスを更新し、`main` にコミット
5. タスク完了後、plan ファイルを `docs/plans/done/` へ移動（そのタスクの plan ファイルが存在する場合）

---

## 完了報告フォーマット

```
## 対応内容
（2〜3行で簡潔に）

## 主な変更ファイル
- path/to/file

## 使用ツール
- Skills: （使用した skill 名、なければ「なし」）
- MCP: （使用した MCP、なければ「なし」）

## 次にやること
- （次のタスクまたは残課題）
```
