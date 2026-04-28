import { AppShell } from "./app-shell";
import { gyms } from "./mock-data";

export function ClimbingLogForm() {
  return (
    <AppShell activeTab="logs">
      <section className="form-panel">
        <p className="card-kind">記録作成</p>
        <h2>登った内容を残す</h2>
        <div className="form-grid">
          <label>
            日付
            <input type="date" />
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
            グレード
            <input maxLength={50} placeholder="4級 / 5.10a" />
          </label>
          <label>
            概要
            <input maxLength={140} placeholder="垂壁の黄色を完登" />
          </label>
          <label>
            メモ
            <textarea maxLength={2000} placeholder="足位置、ムーブ、次回試したいこと" />
          </label>
        </div>
        <button className="primary-action" type="button">
          保存
        </button>
      </section>
    </AppShell>
  );
}

