import { GymDetail } from "../../../src/features/home/gym-detail";

export default async function GymDetailPage({ params }: { params: Promise<{ gymId: string }> }) {
  const { gymId } = await params;
  return <GymDetail gymId={gymId} />;
}

