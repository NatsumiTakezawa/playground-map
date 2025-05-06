-- ダミーデータ投入用 seed.sql

-- ユーザー
INSERT INTO public.users (id, name, email, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'テストユーザーA', 'usera@example.com', 'user'),
  ('00000000-0000-0000-0000-000000000002', 'テストユーザーB', 'userb@example.com', 'user'),
  ('00000000-0000-0000-0000-000000000003', '管理者', 'admin@example.com', 'admin');

-- 温泉
INSERT INTO public.onsen (id, name, geo_lat, geo_lng, description, tags, images) VALUES
  ('10000000-0000-0000-0000-000000000001', '松江しんじ湖温泉', 35.4723, 133.0505, '宍道湖畔の代表的な温泉。', ARRAY['湖畔','絶景'], ARRAY['/images/onsen1.webp']),
  ('10000000-0000-0000-0000-000000000002', '玉造温泉', 35.4081, 133.0702, '美肌の湯で有名な歴史ある温泉地。', ARRAY['美肌','歴史'], ARRAY['/images/onsen2.webp']),
  ('10000000-0000-0000-0000-000000000003', '八雲温泉', 35.4234, 133.0899, '地元に愛される小さな温泉。', ARRAY['地元','静か'], ARRAY['/images/onsen3.webp']);

-- レビュー
INSERT INTO public.review (onsen_id, user_id, rating, comment) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 5, '景色が最高でした！'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 4, 'お湯がとても良い。'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 3, '静かで落ち着く温泉です。');

-- 広告バナー
INSERT INTO public.ad_banner (image_url, link_url, start_at, end_at, placement) VALUES
  ('/images/banner1.webp', 'https://onsen-matsue.jp', now(), now() + interval '30 day', 'footer'),
  ('/images/banner2.webp', 'https://matsue-kankou.jp', now(), now() + interval '15 day', 'sidebar');

-- テーマ
INSERT INTO public.theme (name, slug, primary_color, assets) VALUES
  ('松江温泉デフォルト', 'matsue-default', '#3B82F6', '{"logo": "/images/logo.svg"}');
