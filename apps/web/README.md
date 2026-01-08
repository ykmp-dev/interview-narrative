# interview-narrative

## 目的

職務経歴書(JD)、履歴書/職歴PDF、ナラティブ形式の面接回答を入力として受け取り、以下を生成するWebアプリケーション:

- JDに最適化された**要件 x 経験マトリクス**
- 面接Q&A（STARフレームワークによるアウトライン）
- 効果的な逆質問

## 技術スタック

- **フレームワーク**: Next.js (App Router)
- **認証/DB**: Supabase (Auth + Row Level Security)
- **パッケージマネージャ**: pnpm
- **スタイリング**: Tailwind CSS

## 開発コマンド

```bash
# 開発サーバー起動
pnpm -C apps/web dev

# リント
pnpm -C apps/web lint

# 本番ビルド
pnpm -C apps/web build

# 本番サーバー起動
pnpm -C apps/web start
```

## ディレクトリ構成

```
apps/
  web/              # Next.js アプリケーション
    app/            # App Router ルート
    public/         # 静的ファイル
```

## 開発ルール

詳細は [CLAUDE.md](../../claude.md) を参照してください。
