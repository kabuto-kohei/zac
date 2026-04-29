import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "./app-shell";
import { getLogDetailData } from "./data";
import { LogConvertActions } from "./detail-actions";
import { ZacIcon } from "./zac-icons";

export async function LogDetail({ logId }: { logId: string }) {
  const log = await getLogDetailData(logId);

  if (!log) {
    notFound();
  }

  return (
    <AppShell activeTab="logs" action={<Link className="primary-action" href="/plans/new">次回予定</Link>}>
      <section className="hero-card">
        <div className="hero-visual icon-visual log-visual">
          <ZacIcon decorative icon="climbLog" size={76} />
        </div>
        <div>
          <p className="card-kind">{log.place}</p>
          <h2>{log.title}</h2>
          <p>{log.grade}</p>
          <p>{log.note}</p>
        </div>
      </section>
      <section className="stack">
        <LogConvertActions logId={log.id} />
      </section>
    </AppShell>
  );
}
