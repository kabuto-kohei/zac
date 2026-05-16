import { AuthGate } from "./auth-gate";
import { MetricStripView, type Tab } from "./app-shell";
import type { HomeViewData } from "./data";
import { ExplorePanel } from "./explore-panel";
import { FeedExperience } from "./feed-experience";
import { ProfilePanel } from "./profile-panel";

export function WebAppHomeContent({ activeTab, data }: { activeTab: Tab; data: HomeViewData }) {
  return (
    <>
      {activeTab === "home" || activeTab === "explore" ? <MetricStripView events={data.events.length} gyms={data.gyms.length} /> : null}
      {activeTab === "explore" ? <ExplorePanel data={data} /> : null}
      {activeTab === "me" ? (
        <AuthGate action="アカウント管理と更新申請はログイン後に使えます">
          <ProfilePanel />
        </AuthGate>
      ) : null}
      {activeTab === "home" ? <FeedExperience data={data} /> : null}
    </>
  );
}
