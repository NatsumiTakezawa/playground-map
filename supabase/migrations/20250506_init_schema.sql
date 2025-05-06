-- 2025-05-06 初期スキーマ: 松江市温泉マップ

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'user',
  created_at timestamp with time zone DEFAULT now()
);

-- 温泉テーブル
CREATE TABLE IF NOT EXISTS public.onsen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  geo_lat double precision NOT NULL,
  geo_lng double precision NOT NULL,
  description text,
  tags text[],
  images text[],
  created_at timestamp with time zone DEFAULT now()
);

-- レビューテーブル
CREATE TABLE IF NOT EXISTS public.review (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  onsen_id uuid REFERENCES public.onsen(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now()
);

-- 広告バナーテーブル
CREATE TABLE IF NOT EXISTS public.ad_banner (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  link_url text NOT NULL,
  start_at timestamp with time zone NOT NULL,
  end_at timestamp with time zone NOT NULL,
  placement text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- テーマテーブル
CREATE TABLE IF NOT EXISTS public.theme (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  primary_color text,
  assets jsonb,
  created_at timestamp with time zone DEFAULT now()
);
