# hangeul-typing-game

ハングル（韓国語）キーボード入力を練習するためのタイピングゲーム。
Web ブラウザ上で **サーバーなし（静的な HTML + JavaScript + CSS）** で動作することを目指します。

2벌식（Dubeolsik）レイアウトの入力をブラウザ内で自前合成し、OS の韓国語 IME を設定しなくても
ハングルのキー配置を練習できます。

設計の詳細は [DESIGN.md](./DESIGN.md) を参照してください。

## 技術スタック（予定）

- Vite + TypeScript + React
- Tailwind CSS
- react-i18next（日本語 / 韓国語の UI 切替）
- Vitest（コアロジックの単体テスト）
