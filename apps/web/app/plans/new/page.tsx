import { getGymOptions } from "../../../src/features/home/data";
import { SessionPlanForm } from "../../../src/features/home/session-plan-form";

export default function NewPlanPage() {
  return <SessionPlanForm gyms={getGymOptions()} />;
}
