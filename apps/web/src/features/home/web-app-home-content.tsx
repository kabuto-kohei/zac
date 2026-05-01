"use client";

import { AuthGate } from "./auth-gate";
import { useAuthStatus } from "./auth-state";
import type { Tab } from "./app-shell";
import type { HomeViewData } from "./data";
import { ExplorePanel } from "./explore-panel";
import { FeedExperience } from "./feed-experience";
import {
  ActivityMetricStrip,
  MemberActivityState,
  MemberLogsPanel,
  MemberPlansPanel,
  MemberProfilePanel,
  useMemberActivityData,
} from "./member-activity-data";

export function WebAppHomeContent({ activeTab, data }: { activeTab: Tab; data: HomeViewData }) {
  const { authenticated, checking } = useAuthStatus();
  const memberState = useMemberActivityData(data, !checking && authenticated);
  const showMetricStrip = activeTab === "home" || activeTab === "explore" || (!checking && authenticated);

  return (
    <>
      {showMetricStrip ? <ActivityMetricStrip authenticated={authenticated} baseData={data} checking={checking} memberState={memberState} /> : null}
      {activeTab === "explore" ? <ExplorePanel data={data} /> : null}
      {activeTab === "plans" ? (
        <AuthGate action="予定の管理はログイン後に使えます">
          {memberState.status === "ready" ? <MemberPlansPanel data={memberState.data} /> : <MemberActivityState state={memberState} />}
        </AuthGate>
      ) : null}
      {activeTab === "logs" ? (
        <AuthGate action="記録の管理はログイン後に使えます">
          {memberState.status === "ready" ? <MemberLogsPanel data={memberState.data} /> : <MemberActivityState state={memberState} />}
        </AuthGate>
      ) : null}
      {activeTab === "me" ? (
        <AuthGate action="マイページはログイン後に使えます">
          {memberState.status === "ready" ? <MemberProfilePanel data={memberState.data} /> : <MemberActivityState state={memberState} />}
        </AuthGate>
      ) : null}
      {activeTab === "home" ? <FeedExperience data={data} memberState={memberState} /> : null}
    </>
  );
}
