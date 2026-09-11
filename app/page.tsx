import HomeView from "@/components/HomeView";
import { getState } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function Page() {
  const state = getState();
  return <HomeView initialState={state} />;
}
