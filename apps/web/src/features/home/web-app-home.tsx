import { AppShell, type Tab } from "./app-shell";
import { getHomeViewData } from "./data";
import { WebAppHomeContent } from "./web-app-home-content";

export async function WebAppHome({ activeTab }: { activeTab: Tab }) {
  const data = await getHomeViewData(activeTab);

  return (
    <AppShell activeTab={activeTab}>
      <WebAppHomeContent activeTab={activeTab} data={data} />
    </AppShell>
  );
}
