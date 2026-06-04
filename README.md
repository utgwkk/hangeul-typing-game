# hangeul-typing-game

ハングル（韓国語）キーボード入力を練習するためのタイピングゲーム。
Web ブラウザ上で **サーバーなし（静的な HTML + JavaScript + CSS）** で動作します。

2벌식（Dubeolsik）レイアウトの入力をブラウザ内で自前合成し、OS の韓国語 IME を設定しなくても
ハングルのキー配置を練習できます。

設計の詳細は [DESIGN.md](./DESIGN.md) を参照してください。

## 技術スタック

- Vite + TypeScript + React
- Tailwind CSS
- react-i18next（日本語 / 韓国語の UI 切替）
- Vitest（コアロジックの単体テスト）

## セットアップ

Node.js（v18 以降推奨）と npm が必要です。

```bash
npm install
```

## 開発

```bash
npm run dev
```

起動後、`http://localhost:5173/hangeul-typing-game/` でアクセスできます。

## テスト・静的解析

```bash
# 単体テスト（Vitest）
npm test

# 型チェック
npm run typecheck

# Lint
npm run lint
```

## ビルド

```bash
npm run build
```

型チェック（`tsc --noEmit`）を実行したあと `dist/` ディレクトリに静的ファイルを生成します。

## ビルド済みファイルのプレビュー

```bash
npm run preview
```

`dist/` の静的ファイルをローカルサーバで確認できます（`http://localhost:4173/hangeul-typing-game/`）。

## デプロイ

`npm run build` で生成された `dist/` の内容を、任意の静的ホスティングサービス（GitHub Pages・Netlify・Cloudflare Pages など）に配置するだけで動作します。サーバーサイドの処理は不要です。

`vite.config.ts` の `base` は `/hangeul-typing-game/` に設定されています。別のパスにデプロイする場合はこの値を変更してからビルドしてください。
