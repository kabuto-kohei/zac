import { expect, test } from "@playwright/test";

test.describe("web guest experience", () => {
  test("allows public browsing before login and guides protected actions to auth", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("公開情報はこのまま閲覧できます")).toBeVisible();
    const overview = page.getByLabel("Zac overview");
    await expect(overview.getByRole("link", { name: "Login" })).toBeVisible();
    await expect(overview.getByRole("link", { name: "予定作成" })).toHaveCount(0);
    await expect(page.getByRole("region", { name: "ログイン" }).getByRole("link", { name: "探す" })).toBeVisible();

    await page.goto("/plans/new");
    await expect(page).toHaveURL(/\/plans\/new$/);
    await expect(page.getByText("予定作成はログイン後に保存できます")).toBeVisible();
    await expect(page.getByRole("link", { name: "ゲストで戻る" })).toBeVisible();
  });

  test("keeps notifications private for guests", async ({ page }) => {
    await page.goto("/notifications");

    await expect(page.getByText("通知はログイン後に確認できます")).toBeVisible();
    await expect(page.getByRole("article").getByRole("link", { name: "ログイン" })).toBeVisible();
  });

  test("filters public gyms and events on explore", async ({ page }) => {
    await page.goto("/explore");

    await expect(page.getByRole("heading", { name: "登る場所と予定を探す" })).toBeVisible();
    await page.getByPlaceholder("秋葉原、B-PUMP、ボルダー").fill("品川");

    await expect(page.getByRole("heading", { name: "Rocky Shinagawa" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "B-PUMP Tokyo" })).toHaveCount(0);

    await page.getByRole("button", { name: "リード" }).click();
    await expect(page.getByText("ジムが見つかりません")).toBeVisible();
    await page.getByRole("button", { name: "すべて" }).click();
    await expect(page.getByRole("heading", { name: "Rocky Shinagawa" })).toBeVisible();
  });
});
