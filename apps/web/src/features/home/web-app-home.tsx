import { AppShell, type Tab } from "./app-shell";
import { AuthGate } from "./auth-gate";
import { getHomeViewData } from "./data";
import { ExplorePanel } from "./explore-panel";
import { FeedExperience } from "./feed-experience";
import { ActivityMetricStrip, MemberLogsPanel, MemberPlansPanel, MemberProfilePanel } from "./member-activity-data";

export async function WebAppHome({ activeTab }: { activeTab: Tab }) {
  const data = await getHomeViewData(activeTab);

  return (
    <AppShell activeTab={activeTab}>
      <ActivityMetricStrip baseData={data} />
      {activeTab === "explore" ? <ExplorePanel data={data} /> : null}
      {activeTab === "plans" ? (
        <AuthGate action="予定の管理はログイン後に使えます">
          <MemberPlansPanel baseData={data} />
        </AuthGate>
      ) : null}
      {activeTab === "logs" ? (
        <AuthGate action="記録の管理はログイン後に使えます">
          <MemberLogsPanel baseData={data} />
        </AuthGate>
      ) : null}
      {activeTab === "me" ? (
        <AuthGate action="マイページはログイン後に使えます">
          <MemberProfilePanel baseData={data} />
        </AuthGate>
      ) : null}
      {activeTab === "home" ? <FeedExperience data={data} /> : null}
    </AppShell>
  );
}
