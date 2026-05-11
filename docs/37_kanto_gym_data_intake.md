# Kanto Gym Data Intake

作成日: 2026-05-10

## Scope

関東圏は、Zac MVP では以下の1都6県として扱う。

- 東京都
- 神奈川県
- 埼玉県
- 千葉県
- 茨城県
- 栃木県
- 群馬県

対象は、クライミング、ボルダリング、リード、トップロープ等の常設施設。
フィットネスクラブ内のクライミング施設、公営施設も「来店して登れる」場合は含める。

## Source Baseline

初期投入の存在確認ベースラインは Rockgym の都県別施設一覧を使う。

| 都県 | Rockgym表示件数 | seed投入件数 | 既存公式確認済み | 備考 |
|---|---:|---:|---:|---|
| 東京 | 71 | 67 | 3 | ページ上の可視リストは70件。既存3件を除外して投入 |
| 神奈川 | 38 | 38 | 0 | 全件投入 |
| 埼玉 | 31 | 31 | 0 | 全件投入 |
| 千葉 | 17 | 17 | 0 | 全件投入 |
| 茨城 | 10 | 10 | 0 | 全件投入 |
| 栃木 | 15 | 15 | 0 | 全件投入 |
| 群馬 | 9 | 9 | 0 | 全件投入 |

MVP DB上は、既存の公式確認済み3件と合わせて190件を持つ。

## Verification Rule

`0001_kanto_gym_directory.sql` の行は、公式確認済みではなく
「最新ディレクトリで営業/存在が確認されたベースライン」として扱う。

- `source_type = directory_crosscheck`
- `source_url = Rockgym 都県別URL`
- `source_attribution = Rockgym <都県>のクライミング施設一覧`
- `source_verified_at = 2026-05-10`
- `status = published`

各ジムの公式サイト、Instagram、Google Business Profile、系列公式店舗一覧で確認したら、
該当行の `source_type`, `source_url`, `source_attribution`, `address`,
`opening_hours_text`, `instagram_url` を公式情報に置き換える。

## Closure Check

閉店確認は以下の順で見る。

1. 公式サイトまたは系列公式店舗一覧
2. 公式Instagramの最新投稿・プロフィール
3. Google Business Profile相当の営業時間/閉業表示
4. RockgymやBoulgymなどの専門ディレクトリ
5. ジム名 + 閉店/移転/休業 の検索

閉店が確認できた場合は `status = closed` にし、公開UIからは通常一覧に出さない。

## Official Enrichment Progress

公式サイトで営業継続・住所・営業時間を確認できた行は、同じ
`source_external_id` に対する追加 upsert で `source_type = official_site`
へ昇格する。これにより、初期投入件数を増やさずにデータ品質だけを上げる。

2026-05-10 時点の公式確認済み追加バッチ:

| source_external_id | 確認先 | 確認内容 |
|---|---|---|
| `rockgym:tokyo:prime-climbing` | PRIME CLIMBING 公式サイト | 住所、アクセス、営業時間 |
| `rockgym:tokyo:boulcom-tokyo` | BOULCOM 東京店 公式サイト | 住所、営業時間、問い合わせ先 |
| `rockgym:tokyo:spider` | クライミングジムSPIDER 公式サイト | 住所、営業時間、2026年5月のお知らせ |
| `rockgym:tokyo:urban-base-camp-shinjuku` | Urban Base Camp 新宿 公式サイト | 住所、営業時間、2026年5月の更新 |
| `rockgym:tokyo:everfree` | Everfree Climbing Gym 公式サイト | 移転後住所、営業時間 |
| `rockgym:tokyo:rocky-shinjuku-akebonobashi` | ROCKY 新宿曙橋店 公式サイト | 住所、営業時間、店舗一覧掲載 |
| `rockgym:tokyo:beta` | BETA Climbing 公式サイト | 新宿店住所、営業時間 |
| `rockgym:tokyo:noborock-takadanobaba` | NOBOROCK 高田馬場店 公式サイト | 住所、営業時間、2026年5月営業変更 |
| `rockgym:tokyo:noborock-ikebukuro` | NOBOROCK 池袋店 公式サイト | 住所、営業時間、2026年5月営業変更 |
| `rockgym:tokyo:base-camp-tokyo-edogawabashi` | Base Camp Tokyo 江戸川橋 公式サイト | 住所、営業時間、定休日 |

## Known Caveat

Rockgym東京都ページは、見出しで71件と表示している一方、取得できた可視リストは70件だった。
この差分は追加調査対象として残す。
