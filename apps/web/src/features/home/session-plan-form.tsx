import { AppShell } from "./app-shell";
import { gyms } from "./mock-data";

export function SessionPlanForm() {
  return (
    <AppShell activeTab="plans">
      <section className="form-panel">
        <p className="card-kind">予定作成</p>
        <h2>次に登る予定</h2>
        <div className="form-grid">
          <label>
            タイトル
            <input maxLength={80} placeholder="火曜夜にB-PUMPで登る" />
          </label>
          <label>
            ジム
            <select defaultValue="">
              <option value="" disabled>
                選択してください
              </option>
              {gyms.map((gym) => (
                <option key={gym.id} value={gym.id}>
                  {gym.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            開始日時
            <input type="datetime-local" />
          </label>
          <label>
            終了日時
            <input type="datetime-local" />
          </label>
          <label>
            公開範囲
            <select defaultValue="followers">
              <option value="followers">フォロワー</option>
              <option value="public">全体公開</option>
              <option value="participants">参加者</option>
              <option value="private">自分のみ</option>
            </select>
          </label>
          <label>
            メモ
            <textarea maxLength={1000} placeholder="軽めに登ります" />
          </label>
        </div>
        <button className="primary-action" type="button">
          保存
        </button>
      </section>
    </AppShell>
  );
}

