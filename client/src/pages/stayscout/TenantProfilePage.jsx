import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Logo } from "../../components";
import { StayScoutTenantNav } from "../../components/StayScoutNav";

export default function TenantProfilePage() {
  const { user } = useSelector((s) => s.auth);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <Logo />
          <div className="min-w-0">
            <p className="font-display font-semibold text-slate-900 truncate">StayScout</p>
            <p className="text-xs text-slate-500">Tenant profile</p>
          </div>
        </div>
        <StayScoutTenantNav />
      </header>
      <main className="max-w-lg mx-auto px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900 mb-4">Your profile</h1>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium text-slate-900">
                {user?.firstName} {user?.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-slate-900 break-all">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Account</dt>
              <dd className="font-medium text-slate-900">
                {user?.accountStatus ? "Active" : "Pending verification"}
              </dd>
            </div>
          </dl>
          <Link
            to="/tenant/dashboard"
            className="inline-block mt-6 text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            ← Back to dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
