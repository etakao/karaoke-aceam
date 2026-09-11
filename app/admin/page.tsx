import AdminView from "@/components/AdminView";
import { getState } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const state = getState();
  return <AdminView initialState={state} />;
}
