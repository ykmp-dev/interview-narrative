# デプロイ手順

このドキュメントでは、interview-narrative アプリケーションを各種プラットフォームにデプロイする手順を説明します。

## 目次

- [GitHub Pages デプロイ](#github-pages-デプロイ)
- [VPS デプロイ](#vps-デプロイ手順)

---

# GitHub Pages デプロイ

GitHub Pages を使用して静的サイトとして公開する方法です。

## 重要な制限事項

GitHub Pages は**静的サイトのみ**をサポートするため、以下の機能は使用できません：

- ❌ API Routes (`/api/*`)
- ❌ Server-Side Rendering (SSR)
- ❌ Server Actions
- ❌ Dynamic Routes（一部制限あり）
- ❌ Image Optimization

このため、GitHub Pages デプロイは**デモやドキュメント用途**に適しています。完全な機能を使用する場合は、Vercel、Netlify、または VPS デプロイを推奨します。

## デプロイ手順

### 1. リポジトリの GitHub Pages 設定

1. GitHub リポジトリの **Settings** > **Pages** に移動
2. **Source** で「GitHub Actions」を選択
3. 保存

### 2. Secrets の設定

GitHub リポジトリの **Settings** > **Secrets and variables** > **Actions** で以下を追加：

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase プロジェクト URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 匿名キー

### 3. basePath の設定（リポジトリ名でサブパスになる場合）

リポジトリが `https://username.github.io/repo-name/` 形式でホストされる場合、環境変数を追加：

```bash
# GitHub Secrets に追加
NEXT_PUBLIC_BASE_PATH=/repo-name
```

※ユーザー/組織のメインサイト（`https://username.github.io/`）の場合は不要です。

### 4. デプロイの実行

main ブランチにプッシュすると、GitHub Actions が自動的に：

1. Next.js アプリをビルド
2. 静的ファイルにエクスポート
3. GitHub Pages にデプロイ

デプロイ状況は **Actions** タブで確認できます。

### 5. 手動デプロイ

GitHub の **Actions** タブから「Deploy to GitHub Pages」ワークフローを手動実行することもできます。

## ローカルでの静的エクスポート確認

```bash
# ビルドとエクスポート
pnpm -C apps/web build

# 静的ファイルは apps/web/out/ に生成される
ls apps/web/out/

# ローカルサーバーで確認
npx serve apps/web/out
```

## 代替デプロイオプション

完全な機能を利用する場合は、以下のプラットフォームを推奨します：

- **Vercel**: Next.js の公式ホスティング（推奨）
- **Netlify**: 簡単なデプロイとCI/CD
- **VPS**: 完全なコントロール（下記参照）

---

# VPS デプロイ手順

interview-narrative アプリケーションを VPS (Linux) にデプロイする手順です。

## 前提条件

VPS に以下がインストール済みであること：

- **Node.js** 20.x 以上
- **pnpm** 9.x 以上（`npm install -g pnpm`）
- **Git**
- **pm2**（推奨、プロセス常駐用。`npm install -g pm2`）

## 1. リポジトリのクローン

```bash
# リポジトリをクローン
git clone https://github.com/ykmp-dev/interview-narrative.git
cd interview-narrative

# または既存のリポジトリを更新
cd interview-narrative
git pull origin main
```

## 2. 環境変数の設定

`apps/web/.env.production` を作成し、以下の環境変数を設定します：

```bash
# apps/web/.env.production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

### 環境変数の説明

| 変数名 | 説明 | 取得方法 |
|--------|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名キー | Supabase Dashboard > Settings > API |
| `GEMINI_API_KEY` | Google Gemini API キー | [Google AI Studio](https://aistudio.google.com/apikey) |

> **重要**: `GEMINI_API_KEY` は `NEXT_PUBLIC_` プレフィックスを付けないでください。サーバーサイドでのみ使用します。

## 3. 依存関係のインストール

```bash
# ルートディレクトリで実行
pnpm install

# または apps/web のみインストール
pnpm -C apps/web install
```

## 4. 本番ビルド

```bash
pnpm -C apps/web build
```

ビルドが成功すると、`apps/web/.next` ディレクトリに本番用ファイルが生成されます。

## 5. アプリケーションの起動

### 方法 A: 直接起動（テスト用）

```bash
pnpm -C apps/web start
```

デフォルトで `http://localhost:3000` で起動します。

### 方法 B: pm2 による常駐（推奨）

```bash
# pm2 でアプリを起動
cd apps/web
pm2 start npm --name "interview-narrative" -- start

# ステータス確認
pm2 status

# ログ確認
pm2 logs interview-narrative

# サーバー再起動時に自動起動するよう設定
pm2 startup
pm2 save
```

### 方法 C: pm2 ecosystem ファイルを使用

`apps/web/ecosystem.config.js` を作成：

```javascript
module.exports = {
  apps: [
    {
      name: "interview-narrative",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/path/to/interview-narrative/apps/web",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
```

起動：

```bash
pm2 start ecosystem.config.js
```

## 6. ポート設定

デフォルトではポート 3000 で起動します。変更する場合：

```bash
# 環境変数で指定
PORT=8080 pnpm -C apps/web start

# または .env.production に追加
PORT=8080
```

## 7. リバースプロキシ設定（Nginx）

本番環境では Nginx をリバースプロキシとして使用することを推奨します。

### Nginx 設定例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### HTTPS 設定（Let's Encrypt）

```bash
# Certbot インストール（Ubuntu/Debian）
sudo apt install certbot python3-certbot-nginx

# 証明書取得と Nginx 設定
sudo certbot --nginx -d your-domain.com
```

## 8. 更新デプロイ手順

アプリケーションを更新する際の手順：

```bash
cd interview-narrative

# 最新コードを取得
git pull origin main

# 依存関係を更新
pnpm install

# 再ビルド
pnpm -C apps/web build

# pm2 でリスタート
pm2 restart interview-narrative
```

## 9. トラブルシューティング

### ビルドエラー

```bash
# キャッシュをクリアして再ビルド
rm -rf apps/web/.next
pnpm -C apps/web build
```

### 環境変数が読み込まれない

- `.env.production` がビルド時に存在することを確認
- 環境変数名のタイポを確認
- `NEXT_PUBLIC_` プレフィックスが必要な変数を確認

### pm2 のメモリ使用量が多い

```bash
# メモリ制限を設定
pm2 start npm --name "interview-narrative" -- start --max-memory-restart 500M
```

### ログの確認

```bash
# pm2 ログ
pm2 logs interview-narrative

# Next.js ビルドログ
cat apps/web/.next/BUILD_ID
```

## 10. Supabase Storage 設定

VPS デプロイ前に、Supabase Dashboard で以下の設定が必要です：

1. **Storage バケット作成**
   - Bucket name: `interview-docs`
   - Public: `false`

2. **Storage RLS ポリシー設定**
   - SQL Editor で `supabase/schema.sql` のコメント部分（Storage policies）を実行

## チェックリスト

デプロイ前に以下を確認：

- [ ] `.env.production` に全ての環境変数が設定されている
- [ ] Supabase プロジェクトが本番用に設定されている
- [ ] Supabase Storage バケットと RLS が設定されている
- [ ] Gemini API キーが有効で、クォータに余裕がある
- [ ] ドメインと SSL 証明書が設定されている（本番運用時）
- [ ] ファイアウォールで必要なポートが開放されている
