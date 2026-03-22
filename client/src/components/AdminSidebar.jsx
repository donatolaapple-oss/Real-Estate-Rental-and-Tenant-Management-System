import { StayScoutAdminSidebarNav } from "./StayScoutNav";

/** Modern admin sidebar — wraps existing StayScout admin nav blocks. */
export default function AdminSidebar() {
  return (
    <aside className="w-full md:w-56 lg:w-64 shrink-0 bg-slate-900 text-slate-100 md:min-h-screen flex flex-col border-r border-white/5">
      <StayScoutAdminSidebarNav />
    </aside>
  );
}
