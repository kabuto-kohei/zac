# Zac v5 設計書棚卸し

作成日: 2026-04-27  
基準文書: `Zac_planning_v5.md`  
目的: コード実装前に必要な設計文書を棚卸しし、実装開始可否を判断できる状態にする。

---

## 1. 現在の状態

`Zac_planning_v5.md` は、Zacを「Climb Life OS」として定義し、MVPの中心を `session_plans` と `climbing_logs` に置いている。企画、MVP範囲、粗いDB/API、技術スタック、プライバシー、運営、KPI、ロードマップは含まれている。

本棚卸しで、実装前に必要な詳細文書を次の観点に分離した。MVP実装前提の固定事項は `docs/19_fixed_pre_implementation_decisions.md` に集約する。

- 要件定義
- 非機能要件
- システム構成
- ディレクトリ構成
- DB詳細設計
- API詳細設計
- 認可・公開範囲・セキュリティ設計
- 画面・導線設計
- 画面一覧・画面遷移図
- ワイヤーフレーム/UI仕様
- 管理画面・運営設計
- 計測イベント設計
- 技術選定
- テスト計画
- リリース・運用計画
- プロジェクト計画
- 利用規約・プライバシーポリシー草案
- 実装順序と着手条件
- ドメイン責務・サービス境界
- Webフロントエンド構造
- 品質ゲート・CI/CD

---

## 2. 実装前に必要な文書一覧

| 文書 | ファイル | 状態 | 用途 |
|---|---|---:|---|
| 設計書棚卸し | `docs/00_design_inventory.md` | 作成済み | 不足文書と優先順位の確認 |
| 要件定義 | `docs/01_requirements.md` | 作成済み | MVPで作る/作らない範囲の固定 |
| システム設計 | `docs/02_system_architecture.md` | 作成済み | 技術構成、境界、主要コンポーネントの固定 |
| ディレクトリ構成 | `docs/03_directory_structure.md` | 作成済み | リポジトリ初期化時の配置方針 |
| DB設計 | `docs/04_database_design.md` | 作成済み | 初期スキーマ、制約、インデックス方針 |
| API設計 | `docs/05_api_design.md` | 作成済み | REST API、エラー形式、認証方針 |
| セキュリティ/プライバシー設計 | `docs/06_security_privacy_design.md` | 作成済み | 公開範囲、ブロック、通報、データ保護 |
| UX/画面フロー設計 | `docs/07_ux_flow_design.md` | 作成済み | 主要画面とユーザーフロー |
| KPI/イベント計測設計 | `docs/08_analytics_design.md` | 作成済み | PostHog等へ送るイベント定義 |
| 管理画面/運営設計 | `docs/09_admin_operations_design.md` | 作成済み | 管理者機能、通報対応、監査 |
| 実装準備チェックリスト | `docs/10_implementation_readiness.md` | 作成済み | 実装開始前の固定事項と着手条件 |
| 技術選定書 | `docs/11_technology_selection.md` | 作成済み | 使用技術、選定理由、不採用案 |
| テスト計画書 | `docs/12_test_plan.md` | 作成済み | テスト範囲、受け入れ条件、重点ケース |
| リリース・運用計画書 | `docs/13_release_operations_plan.md` | 作成済み | 公開、監視、障害対応、保守 |
| プロジェクト計画書 | `docs/14_project_plan.md` | 作成済み | スコープ、マイルストーン、リスク |
| 法務・ポリシー草案 | `docs/15_legal_policy_drafts.md` | 作成済み | 利用規約、プライバシーポリシー、UGC論点 |
| 画面一覧・画面遷移図 | `docs/16_screen_transition_design.md` | 作成済み | 画面構成、導線、状態別画面 |
| ワイヤーフレーム/UI仕様書 | `docs/17_wireframe_ui_spec.md` | 作成済み | 各画面の表示項目、操作、入力制約 |
| 非機能要件定義書 | `docs/18_non_functional_requirements.md` | 作成済み | 性能、可用性、保守性、対応環境 |
| 実装前固定事項 | `docs/19_fixed_pre_implementation_decisions.md` | 作成済み | MVP実装の最終判断 |
| 必要ツール・外部設定 | `docs/20_required_tools_and_settings.md` | 作成済み | ユーザー側で準備するアカウント/CLI |
| 環境変数設計 | `docs/21_environment_variables.md` | 作成済み | `.env` とSecret設計 |
| 初期seedデータ設計 | `docs/22_initial_seed_data.md` | 作成済み | マスターデータと初期ジム |
| 認可・RLS詳細設計 | `docs/23_authorization_rls_design.md` | 作成済み | API認可、RLS、service role、管理者権限 |
| 削除・退会・匿名化設計 | `docs/24_deletion_retention_design.md` | 作成済み | 退会、削除、非表示、画像削除 |
| Storage・画像アップロード設計 | `docs/25_storage_media_design.md` | 作成済み | bucket、path、signed URL、画像制限 |
| 外部サービス設定チェックリスト | `docs/26_external_services_setup_checklist.md` | 作成済み | GitHub/Supabase/Vercel/PostHog/Sentry設定 |
| 将来モバイル版・ストア審査チェックリスト | `docs/27_mobile_future_review_checklist.md` | 作成済み | Web検証後のモバイル移行準備 |
| 設計書整合性監査 | `docs/28_design_consistency_audit.md` | 作成済み | 全Markdownの矛盾・穴の再棚卸し |
| ドメイン責務・サービス境界設計 | `docs/29_domain_service_contracts.md` | 作成済み | route/service/query/transactionの境界 |
| Webフロントエンド構造設計 | `docs/30_web_frontend_architecture.md` | 作成済み | routing、状態管理、フォーム、レスポンシブ |
| 品質ゲート・CI/CD設計 | `docs/31_quality_gate_ci_cd.md` | 作成済み | PR/CI/migration/OpenAPI/Release gate |

---

## 3. 実装前の優先順位

### 最優先で固定するもの

1. 認証方式: Supabase Auth
2. API実装方式: Hono + TypeScript
3. DBマイグレーション方式: Drizzle ORM + drizzle-kit
4. 画像ストレージ: Supabase Storage
5. 公開範囲とブロック適用ルール
6. MVP初期データとして登録するジム情報の項目
7. 主要画面のワイヤーフレーム/UI仕様
8. 受け入れテスト条件
9. route/service/queryの責務境界
10. CI品質ゲート

### 実装と並行して詰めてもよいもの

- 管理画面の詳細UI
- 通知テンプレート文言
- 投稿カテゴリの初期セット
- KPIダッシュボードの見た目
- 将来Phaseの課金・ジム連携仕様

---

## 4. コード実装開始の判定

以下が決まれば、MVP基盤の実装に入れる。

- 技術スタックが `docs/19_fixed_pre_implementation_decisions.md` の通り固定されている
- ディレクトリ構成が決まっている
- DB初期スキーマのv0が作れる
- APIの主要リソースと認可ルールが決まっている
- `session_plans` と `climbing_logs` の公開範囲仕様が決まっている
- 削除、通報、ブロックの最低限の挙動が決まっている

---

## 5. 推奨する次アクション

1. `docs/20_required_tools_and_settings.md` の外部サービスを準備する。
2. `docs/21_environment_variables.md` に従ってローカル/ホスティング環境へSecretを設定する。
3. DBマイグレーションとOpenAPIの初版を作る。
4. `session_plans` と `climbing_logs` から実装する。
5. 認証、プロフィール、ジム、予定、記録の順で縦に薄く通す。
