INSERT INTO "disciplines" ("key", "name", "sort_order")
VALUES
  ('boulder', 'ボルダー', 10),
  ('lead', 'リード', 20),
  ('top_rope', 'トップロープ', 30),
  ('outdoor', '外岩', 40),
  ('training', 'トレーニング', 50)
ON CONFLICT ("key") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sort_order" = EXCLUDED."sort_order";

INSERT INTO "categories" ("key", "name", "sort_order")
VALUES
  ('partner', '仲間探し', 10),
  ('log', '記録', 20),
  ('event', 'イベント', 30),
  ('competition', 'コンペ', 40),
  ('gym_discovery', 'ジム開拓', 50),
  ('training', 'トレーニング', 60)
ON CONFLICT ("key") DO UPDATE SET
  "name" = EXCLUDED."name",
  "sort_order" = EXCLUDED."sort_order";

INSERT INTO "gyms" ("id", "name", "description", "address", "area", "website_url", "opening_hours_text", "status")
VALUES
  ('11111111-1111-4111-8111-111111111111', 'B-PUMP Tokyo', '初期検証用の公開ジムデータ', '東京都千代田区', '秋葉原', NULL, '平日 12:00-23:00', 'published'),
  ('22222222-2222-4222-8222-222222222222', 'Rocky Shinagawa', '初期検証用の公開ジムデータ', '東京都港区', '品川', NULL, '10:00-22:00', 'published'),
  ('33333333-3333-4333-8333-333333333333', 'Noborock Shibuya', '初期検証用の公開ジムデータ', '東京都渋谷区', '渋谷', NULL, '平日 13:00-23:00', 'published')
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "address" = EXCLUDED."address",
  "area" = EXCLUDED."area",
  "website_url" = EXCLUDED."website_url",
  "opening_hours_text" = EXCLUDED."opening_hours_text",
  "status" = EXCLUDED."status",
  "updated_at" = now(),
  "deleted_at" = NULL;
