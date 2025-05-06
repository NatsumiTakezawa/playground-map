This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# 環境構築手順

## 1. リポジトリのクローン

```bash
git clone <このリポジトリのURL>
cd <このリポジトリ名>
```

## 2. 依存パッケージのインストール

```bash
npm install
```

## 3. Supabase CLI のセットアップ（npx 経由）

```bash
npx supabase@latest init
npx supabase@latest start
```

## 4. 環境変数ファイルの作成

- `.env.local` をプロジェクトルートに作成し、下記を記載してください。
  - `NEXT_PUBLIC_SUPABASE_URL` … ローカル Supabase の URL（例: http://127.0.0.1:54321）
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` … ローカル Supabase の anon キー
- サンプルは `.env.example` を参照してください。

## 5. Supabase クライアントのインストール

```bash
npm install @supabase/supabase-js
```

## 6. Next.js から Supabase への接続

`.env.local` の値を使い、`@supabase/supabase-js` でクライアントを初期化してください。

---

### 参考

- Supabase Studio: http://127.0.0.1:54323
- Supabase API: http://127.0.0.1:54321

---

# English (for reference)

## Local Development Setup

1. Clone this repository and move into the directory
2. Install dependencies: `npm install`
3. Initialize and start Supabase locally via npx
4. Copy `.env.example` to `.env.local` and set your local Supabase URL and anon key
5. Install `@supabase/supabase-js`
6. Use these env vars to connect from Next.js

---
