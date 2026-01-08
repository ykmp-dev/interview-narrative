# interview-narrative

## 目的

職務経歴書(JD)、履歴書/職歴PDF、ナラティブ形式の面接回答を入力として受け取り、以下を生成するWebアプリケーション:

- JDに最適化された**要件 x 経験マトリクス**
- 面接Q&A（STARフレームワークによるアウトライン）
- 効果的な逆質問

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 16 (App Router) |
| 認証/DB | Supabase (Auth + Row Level Security) |
| スタイリング | Tailwind CSS v4 |
| パッケージマネージャ | pnpm (workspace) |
| 言語 | TypeScript |

## ディレクトリ構成

```
interview-narrative/
├── apps/
│   └── web/          # Next.js アプリケーション
│       ├── app/      # App Router ルート
│       └── public/   # 静的ファイル
├── claude.md         # Claude Code 用プロジェクト設定
└── pnpm-workspace.yaml
```

## 開発コマンド

```bash
# 依存関係インストール
pnpm install

# 開発サーバー起動
pnpm -C apps/web dev

# リント
pnpm -C apps/web lint

# 本番ビルド
pnpm -C apps/web build

# 本番サーバー起動
pnpm -C apps/web start
```

## 環境変数

`apps/web/.env.local` に以下を設定:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 認証フローの動作確認

1. 開発サーバーを起動:
   ```bash
   pnpm -C apps/web dev
   ```

2. ブラウザで http://localhost:3000/auth/sign-up にアクセス

3. メールアドレスとパスワード（6文字以上）を入力してサインアップ

4. Supabase の設定によっては確認メールが届くので、リンクをクリック

5. http://localhost:3000/auth/sign-in でサインイン

6. サインイン成功後、自動的に /dashboard へリダイレクト

7. ダッシュボードでユーザー情報が表示されることを確認

8. Sign Out ボタンでログアウト

**保護ルートの確認:**
- 未ログイン状態で http://localhost:3000/dashboard にアクセスすると、/auth/sign-in へリダイレクトされる

## 開発ルール

詳細は [claude.md](./claude.md) を参照してください。
