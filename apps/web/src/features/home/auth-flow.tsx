"use client";

import { localSessionSchema, onboardingProfileSchema } from "@zac/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { putApi } from "./api-client";
import { getBrowserSupabaseClient } from "./integration-provider";
import { SubmitButton } from "./submit-button";
import { ZacIcon } from "./zac-icons";

const sessionKey = "zac.local.session";
const profileKey = "zac.local.profile";

type FieldErrors = Partial<Record<"email" | "displayName" | "area" | "form", string>>;
type AuthMode = "login" | "register";

export function LaunchGate() {
  return (
    <main className="app-shell">
      <section className="topbar" aria-label="Zac start">
        <div className="topbar-brand">
          <ZacIcon icon="logo" size={56} />
          <div>
            <p className="eyebrow">Zac</p>
            <h1>次のセッションを決める</h1>
          </div>
        </div>
        <Link className="primary-action" href="/home">
          ゲストで見る
        </Link>
      </section>
      <section className="stack">
        <article className="wide-card">
          <p className="card-kind">Climb Life OS</p>
          <h2>まず探して、必要なときだけログイン</h2>
          <p>ジム、イベント、公開予定、投稿はゲストで閲覧できます。保存、参加、作成、マイページはログイン後に使えます。</p>
        </article>
        <article className="wide-card action-row">
          <Link className="primary-action" href="/home">
            ゲストで見る
          </Link>
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
  const [sentEmail, setSentEmail] = useState("");

  async function submit(formData: FormData) {
    const result = localSessionSchema.safeParse({
      email: formData.get("email")?.toString(),
    });

    if (!result.success) {
      setErrors({ email: result.error.issues[0]?.message ?? "Invalid email." });
      return;
    }

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

      window.localStorage.setItem(sessionKey, JSON.stringify(result.data));
      setSentEmail(result.data.email);
      setErrors({});
      return;
    }

    window.localStorage.setItem(sessionKey, JSON.stringify(result.data));
    setErrors({});
    router.push(mode === "register" ? "/onboarding" : hasLocalProfile() ? "/home" : "/onboarding");
  }

  if (sentEmail) {
    return (
      <main className="app-shell">
        <section className="form-panel">
          <p className="card-kind">{mode === "register" ? "新規登録" : "ログイン"}</p>
          <h1>メールを確認してください</h1>
          <p>{sentEmail} に認証リンクを送りました。リンクを開くとZacに戻ります。</p>
          <Link className="ghost-button" href="/login">
            別のメールで続ける
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <form action={submit} className="form-panel">
        <p className="card-kind">{mode === "register" ? "新規登録" : "ログイン"}</p>
        <h1>{mode === "register" ? "保存と作成を始める" : "保存した予定に戻る"}</h1>
        <p>メールリンクでログインします。閲覧だけなら登録せずに続けられます。</p>
        <div className="form-grid">
          <label>
            メールアドレス
            <input aria-describedby={errors.email ? "email-error" : undefined} inputMode="email" name="email" placeholder="climber@example.com" />
            {errors.email ? <span className="field-error" id="email-error">{errors.email}</span> : null}
          </label>
        </div>
        <SubmitButton pendingLabel="確認中">続ける</SubmitButton>
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
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const supabase = getBrowserSupabaseClient();

      if (!supabase) {
        if (active) {
          setHasSession(true);
          setCheckingSession(false);
        }
        return;
      }

      const session = await supabase.auth.getSession();

      if (active) {
        setHasSession(Boolean(session.data.session?.access_token));
        setCheckingSession(false);
      }
    }

    void checkSession();

    return () => {
      active = false;
    };
  }, []);

  async function submit(formData: FormData) {
    if (!hasSession) {
      setErrors({ form: "メール認証後にプロフィールを保存できます。" });
      return;
    }

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

    const supabase = getBrowserSupabaseClient();
    if (supabase) {
      const response = await putApi<typeof result.data>("/v1/me/profile", result.data);
      if (!response.ok) {
        setErrors({ form: response.message });
        return;
      }
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
        {checkingSession ? <p>認証状態を確認しています。</p> : null}
        {!checkingSession && !hasSession ? (
          <article className="wide-card">
            <p className="card-kind">認証が必要です</p>
            <h3>メールリンクから戻ってください</h3>
            <p>ログインメールのリンクを開くと、プロフィール設定を続けられます。</p>
            <Link className="ghost-button" href="/login">
              ログインへ
            </Link>
          </article>
        ) : null}
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
        <SubmitButton pendingLabel="保存中">ホームへ</SubmitButton>
        {errors.form ? <p className="field-error">{errors.form}</p> : null}
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
