import { expect, type Page, test } from "@playwright/test";

const localSession = { email: "climber@example.test" };
const localProfile = {
  displayName: "Climber",
  discipline: "boulder",
  experience: "beginner",
  area: "東京",
  defaultVisibility: "followers",
};

test.describe("web guest experience", () => {
  test("allows public browsing before login and guides protected actions to auth", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("公開情報はこのまま閲覧できます")).toBeVisible();
    const overview = page.getByLabel("Zac overview");
    await expect(overview.getByRole("link", { name: "Login" })).toBeVisible();
    await expect(overview.getByRole("link", { name: "予定作成" })).toHaveCount(0);
    const navigation = page.getByRole("navigation", { name: "Main navigation" });
    await expect(navigation.getByRole("link", { name: "ホーム" })).toBeVisible();
    await expect(navigation.getByRole("link", { name: "探す" })).toBeVisible();
    await expect(navigation.getByRole("link", { name: "予定" })).toHaveCount(0);
    await expect(navigation.getByRole("link", { name: "記録" })).toHaveCount(0);
    await expect(navigation.getByRole("link", { name: "マイ" })).toHaveCount(0);
    const publicSummary = page.getByRole("region", { name: "Public summary" });
    await expect(publicSummary.getByText("閲覧範囲")).toBeVisible();
    await expect(page.getByRole("region", { name: "Weekly summary" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "ジムとイベント" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "火曜夜に軽く登る" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "垂壁の黄色を完登" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "週末セッション" })).toHaveCount(0);
    await expect(page.getByRole("region", { name: "作成" })).toHaveCount(0);

    await page.goto("/plans/new");
    await expect(page).toHaveURL(/\/plans\/new$/);
    await expect(page.getByText("予定作成はログイン後に保存できます")).toBeVisible();
    await expect(page.getByLabel("タイトル")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "ゲストで戻る" })).toBeVisible();
  });

  test("keeps notifications private for guests", async ({ page }) => {
    await page.goto("/notifications");

    await expect(page.getByText("通知はログイン後に確認できます")).toBeVisible();
    await expect(page.getByRole("article").getByRole("link", { name: "ログイン" })).toBeVisible();
  });

  test("keeps member tabs private for guests", async ({ page }) => {
    await page.goto("/plans");
    await expect(page.getByText("予定の管理はログイン後に使えます")).toBeVisible();
    await expect(page.getByText("閲覧範囲")).toHaveCount(0);

    await page.goto("/logs");
    await expect(page.getByText("記録の管理はログイン後に使えます")).toBeVisible();

    await page.goto("/me");
    await expect(page.getByText("マイページはログイン後に使えます")).toBeVisible();
  });

  test("keeps user activity details private for guests", async ({ page }) => {
    const homeResponse = await page.request.get("/");
    const homeHtml = await homeResponse.text();
    expect(homeHtml).not.toContain("火曜夜に軽く登る");
    expect(homeHtml).not.toContain("垂壁の黄色を完登");
    expect(homeHtml).not.toContain("週末セッション");

    const gymResponse = await page.request.get("/gyms/b-pump-tokyo");
    const gymHtml = await gymResponse.text();
    expect(gymHtml).not.toContain("火曜夜に軽く登る");

    const planResponse = await page.request.get("/plans/tuesday-night");
    const planHtml = await planResponse.text();
    expect(planHtml).not.toContain("火曜夜に軽く登る");

    await page.goto("/plans/tuesday-night");
    await expect(page.getByText("予定詳細はログイン後に閲覧できます")).toBeVisible();
    await expect(page.getByRole("heading", { name: "火曜夜に軽く登る" })).toHaveCount(0);

    await page.goto("/logs/yellow-wall");
    await expect(page.getByText("記録詳細はログイン後に閲覧できます")).toBeVisible();
    await expect(page.getByRole("heading", { name: "垂壁の黄色を完登" })).toHaveCount(0);

    await page.goto("/posts/yellow-wall-post");
    await expect(page.getByText("投稿詳細はログイン後に閲覧できます")).toBeVisible();
    await expect(page.getByRole("heading", { name: "垂壁の黄色を完登" })).toHaveCount(0);
  });

  test("keeps protected forms private for guests", async ({ page }) => {
    await page.goto("/logs/new");
    await expect(page.getByText("記録作成はログイン後に保存できます")).toBeVisible();
    await expect(page.getByLabel("日付")).toHaveCount(0);

    await page.goto("/posts/new");
    await expect(page.getByText("投稿作成はログイン後に公開できます")).toBeVisible();
    await expect(page.getByLabel("本文")).toHaveCount(0);

    await page.goto("/reports/new");
    await expect(page.getByText("通報はログイン後に送信できます")).toBeVisible();
    await expect(page.getByLabel("対象")).toHaveCount(0);

    await page.goto("/settings");
    await expect(page.getByText("設定はログイン後に使えます")).toBeVisible();
    await expect(page.getByRole("link", { name: "プロフィール" })).toHaveCount(0);
  });

  test("allows authenticated users to log out from the header", async ({ page }) => {
    await signInWithLocalSession(page);

    await page.goto("/");

    const overview = page.getByLabel("Zac overview");
    await expect(page.getByRole("region", { name: "ログイン後ホーム" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "今日のセッション管理" })).toBeVisible();
    const weeklySummary = page.getByRole("region", { name: "Weekly summary" });
    await expect(weeklySummary.getByText("今週の予定", { exact: true })).toBeVisible();
    await expect(weeklySummary.getByText("保存ジム", { exact: true })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "予定" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "記録" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "マイ" })).toBeVisible();
    await expect(overview.getByRole("link", { name: "予定作成" })).toBeVisible();
    await overview.getByRole("button", { name: "ログアウト" }).click();

    await expect(overview.getByRole("link", { name: "Login" })).toBeVisible();
    await expect(overview.getByRole("button", { name: "ログアウト" })).toHaveCount(0);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.evaluate(() => window.localStorage.getItem("zac.local.profile"))).resolves.toBeNull();
  });

  test("filters public gyms and events on explore", async ({ page }) => {
    await page.goto("/explore");

    await expect(page.getByRole("heading", { name: "ジムとイベントを探す" })).toBeVisible();
    await page.getByPlaceholder("秋葉原、B-PUMP、ボルダー").fill("品川");

    await expect(page.getByRole("heading", { name: "Rocky Shinagawa" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "B-PUMP Tokyo" })).toHaveCount(0);

    await page.getByRole("button", { name: "リード" }).click();
    await expect(page.getByText("ジムが見つかりません")).toBeVisible();
    await page.getByRole("button", { name: "すべて" }).click();
    await expect(page.getByRole("heading", { name: "Rocky Shinagawa" })).toBeVisible();
  });
});

test.describe("web authenticated local experience", () => {
  test.beforeEach(async ({ page }) => {
    await signInWithLocalSession(page);
  });

  test("saves profile and privacy settings locally", async ({ page }) => {
    await page.goto("/settings/profile");

    const profileForm = page.locator("form").filter({ hasText: "プロフィール編集" });
    await expect(profileForm.getByRole("heading", { name: "プロフィール編集" })).toBeVisible();
    await profileForm.getByLabel("表示名").fill("Zac Tester");
    await profileForm.getByLabel("よく行くエリア").fill("横浜");
    await profileForm.getByLabel("経験").selectOption("intermediate");
    await profileForm.getByLabel("予定の初期表示範囲").selectOption("private");
    await profileForm.getByRole("button", { name: "保存" }).click();

    await expect(profileForm.getByText("プロフィールを保存しました。")).toBeVisible();
    await expect(page.evaluate(() => JSON.parse(window.localStorage.getItem("zac.local.profile") ?? "{}"))).resolves.toMatchObject({
      area: "横浜",
      defaultVisibility: "private",
      displayName: "Zac Tester",
      experience: "intermediate",
    });

    await page.goto("/settings/privacy");

    const privacyPanel = page.getByRole("main");
    await expect(privacyPanel.getByRole("heading", { name: "自分のみ" })).toBeVisible();
    await privacyPanel.getByLabel("初期表示範囲").selectOption("public");
    await privacyPanel.getByRole("button", { name: "保存" }).click();

    await expect(privacyPanel.getByText("公開範囲を保存しました。")).toBeVisible();
    await expect(page.evaluate(() => JSON.parse(window.localStorage.getItem("zac.local.profile") ?? "{}"))).resolves.toMatchObject({
      defaultVisibility: "public",
    });
  });

  test("submits the main creation forms with authenticated UI", async ({ page }) => {
    await routeCreationApis(page);

    await page.goto("/plans/new");
    const planForm = page.locator("form").filter({ hasText: "次に登る予定" });
    await expect(planForm.getByLabel("タイトル")).toBeVisible();
    await planForm.getByLabel("タイトル").fill("E2E セッション");
    await planForm.getByLabel("ジム").selectOption("B-PUMP Tokyo");
    await planForm.getByLabel("開始日時").fill("2026-05-12T19:00");
    await planForm.getByLabel("終了日時").fill("2026-05-12T21:00");
    await planForm.getByLabel("メモ").fill("軽めに登る");
    await planForm.getByRole("button", { name: "保存" }).click();

    await expect(planForm.getByText("予定を保存しました。")).toBeVisible();
    await expect(planForm.getByRole("link", { name: "作成した予定" })).toHaveAttribute("href", "/plans/e2e-plan");

    await page.goto("/logs/new");
    const logForm = page.locator("form").filter({ hasText: "登った内容を残す" });
    await expect(logForm.getByLabel("日付")).toBeVisible();
    await logForm.getByLabel("日付").fill("2026-05-12");
    await logForm.getByLabel("ジム").selectOption("B-PUMP Tokyo");
    await logForm.getByLabel("グレード").fill("4級");
    await logForm.getByLabel("概要").fill("E2E 完登ログ");
    await logForm.getByLabel("メモ").fill("足位置を確認");
    await logForm.getByRole("button", { name: "保存" }).click();

    await expect(logForm.getByText("記録を保存しました。")).toBeVisible();
    await expect(logForm.getByRole("link", { name: "作成した記録" })).toHaveAttribute("href", "/logs/e2e-log");

    await page.goto("/posts/new");
    const postForm = page.locator("form").filter({ hasText: "登ったことを共有する" });
    await expect(postForm.getByLabel("本文")).toBeVisible();
    await postForm.getByLabel("本文").fill("E2E 投稿テスト");
    await postForm.getByLabel("表示範囲").selectOption("public");
    await postForm.getByRole("button", { name: "投稿" }).click();

    await expect(postForm.getByText("投稿しました。")).toBeVisible();
    await expect(postForm.getByRole("link", { name: "作成した投稿" })).toHaveAttribute("href", "/posts/e2e-post");
  });
});

async function signInWithLocalSession(page: Page) {
  await page.addInitScript(
    ({ profile, session }) => {
      if (!window.localStorage.getItem("zac.local.session")) {
        window.localStorage.setItem("zac.local.session", JSON.stringify(session));
      }

      if (!window.localStorage.getItem("zac.local.profile")) {
        window.localStorage.setItem("zac.local.profile", JSON.stringify(profile));
      }
    },
    { profile: localProfile, session: localSession },
  );
}

async function routeCreationApis(page: Page) {
  await page.route("**/v1/session-plans", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }

    await route.fulfill({
      contentType: "application/json",
      status: 201,
      body: JSON.stringify({ data: { id: "e2e-plan" } }),
    });
  });

  await page.route("**/v1/logs", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }

    await route.fulfill({
      contentType: "application/json",
      status: 201,
      body: JSON.stringify({ data: { id: "e2e-log" } }),
    });
  });

  await page.route("**/v1/posts", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }

    await route.fulfill({
      contentType: "application/json",
      status: 201,
      body: JSON.stringify({ data: { id: "e2e-post" } }),
    });
  });
}
