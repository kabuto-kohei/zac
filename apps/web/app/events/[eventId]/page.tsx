import { EventDetail } from "../../../src/features/home/event-detail";

export default async function EventDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  return <EventDetail eventId={eventId} />;
}
