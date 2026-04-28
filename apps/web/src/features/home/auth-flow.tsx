"use client";

import { localSessionSchema, onboardingProfileSchema } from "@zac/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getBrowserSupabaseClient } from "./integration-provider";

const sessionKey = "zac.local.session";
const profileKey = "zac.local.profile";

type FieldErrors = Partial<Record<"email" | "displayName" | "area" | "form", string>>;
type AuthMode = "login" | "register";

export function LaunchGate() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <main className="app-shell">
      <section className="topbar" aria-label="Zac start">
        <div>
          <p className="eyebrow">Zac</p>
          <h1>次のセッションを決める</h1>
        </div>
        <Link className="primary-action" href={ready && hasLocalProfile() ? "/home" : "/register"}>
          開始
        </Link>
      </section>
      <section className="stack">
        <article className="wide-card">
          <p className="card-kind">Climb Life OS</p>
          <h2>予定、記録、仲間探しをひとつに集約</h2>
          <p>予定、記録、投稿を保存しながら、クライミングの次の行動を決められます。</p>
        </article>
        <article className="wide-card action-row">
          <Link className="primary-action" href="/register">
            新規登録
          </Link>
          <Link className="ghost-button" href="/login">
            ログイン
          </Link>
        </article>
      </section>
    </main>
  );
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});

  async function submit(formData: FormData) {
    const result = localSessionSchema.safeParse({
      email: formData.get("email")?.toString(),
    });

    if (!result.success) {
      setErrors({ email: result.error.issues[0]?.message ?? "Invalid email." });
      return;
    }

    window.localStorage.setItem(sessionKey, JSON.stringify(result.data));
    const supabase = getBrowserSupabaseClient();

    if (supabase) {
      const { error } = await supabase.auth.signInWithOtp({
        email: result.data.email,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      });

      if (error) {
        setErrors({ form: "認証メールの送信に失敗しました。" });
        return;
      }
    }

    setErrors({});
    router.push(mode === "register" ? "/onboarding" : hasLocalProfile() ? "/home" : "/onboarding");
  }

  return (
    <main className="app-shell">
      <form action={submit} className="form-panel">
        <p className="card-kind">{mode === "register" ? "新規登録" : "ログイン"}</p>
        <h1>{mode === "register" ? "Zacを始める" : "Zacに戻る"}</h1>
        <div className="form-grid">
          <label>
            メールアドレス
            <input aria-describedby={errors.email ? "email-error" : undefined} inputMode="email" name="email" placeholder="climber@example.com" />
            {errors.email ? <span className="field-error" id="email-error">{errors.email}</span> : null}
          </label>
        </div>
        <button className="primary-action" type="submit">
          続ける
        </button>
        {errors.form ? <p className="field-error">{errors.form}</p> : null}
        <Link className="ghost-button" href={mode === "register" ? "/login" : "/register"}>
          {mode === "register" ? "ログインへ" : "新規登録へ"}
        </Link>
      </form>
    </main>
  );
}

export function OnboardingForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});

  function submit(formData: FormData) {
    const result = onboardingProfileSchema.safeParse({
      displayName: formData.get("displayName")?.toString(),
      discipline: formData.get("discipline")?.toString(),
      experience: formData.get("experience")?.toString(),
      area: formData.get("area")?.toString(),
      interest: formData.get("interest")?.toString(),
      defaultVisibility: formData.get("defaultVisibility")?.toString(),
      locationEnabled: false,
    });

    if (!result.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === "displayName" || field === "area") {
          nextErrors[field] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    window.localStorage.setItem(profileKey, JSON.stringify(result.data));
    setErrors({});
    router.push("/home");
  }

  return (
    <main className="app-shell">
      <form action={submit} className="form-panel">
        <p className="card-kind">オンボーディング</p>
        <h1>登るスタイルを設定</h1>
        <div className="form-grid">
          <label>
            表示名
            <input aria-describedby={errors.displayName ? "display-name-error" : undefined} maxLength={40} name="displayName" placeholder="Climber" />
            {errors.displayName ? <span className="field-error" id="display-name-error">{errors.displayName}</span> : null}
          </label>
          <label>
            メイン種目
            <select defaultValue="boulder" name="discipline">
              <option value="boulder">ボルダー</option>
              <option value="lead">リード</option>
              <option value="top_rope">トップロープ</option>
            </select>
          </label>
          <label>
            経験
            <select defaultValue="beginner" name="experience">
              <option value="beginner">初心者</option>
              <option value="intermediate">中級者</option>
              <option value="advanced">上級者</option>
            </select>
          </label>
          <label>
            よく行くエリア
            <input aria-describedby={errors.area ? "area-error" : undefined} maxLength={40} name="area" placeholder="東京" />
            {errors.area ? <span className="field-error" id="area-error">{errors.area}</span> : null}
          </label>
          <label>
            興味
            <select defaultValue="partner" name="interest">
              <option value="partner">仲間探し</option>
              <option value="log">記録</option>
              <option value="event">イベント</option>
              <option value="training">トレーニング</option>
            </select>
          </label>
          <label>
            予定の初期表示範囲
            <select defaultValue="followers" name="defaultVisibility">
              <option value="followers">フォロワー</option>
              <option value="public">全体</option>
              <option value="participants">参加者</option>
              <option value="private">自分のみ</option>
            </select>
          </label>
        </div>
        <article className="wide-card">
          <p className="card-kind">位置情報</p>
          <h3>OFF</h3>
          <p>現在地共有はMVPでは使いません。</p>
        </article>
        <button className="primary-action" type="submit">
          ホームへ
        </button>
      </form>
    </main>
  );
}

function hasLocalProfile() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(window.localStorage.getItem(profileKey));
}
