import { ClimbingLogForm } from "../../../src/features/home/climbing-log-form";
import { getGymOptions } from "../../../src/features/home/data";

export default function NewLogPage() {
  return <ClimbingLogForm gyms={getGymOptions()} />;
}
