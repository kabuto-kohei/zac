import { ClimbingLogForm } from "../../../src/features/home/climbing-log-form";
import { getGymOptions } from "../../../src/features/home/data";

export default async function NewLogPage() {
  return <ClimbingLogForm gyms={await getGymOptions()} />;
}
