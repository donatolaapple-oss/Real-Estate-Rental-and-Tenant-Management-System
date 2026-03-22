import { useEffect, useState, useMemo } from "react";
import axiosFetch from "../../utils/axiosCreate";
import StayScoutMap from "../../components/StayScoutMap";
import { Logo } from "../../components";
import { StayScoutAdminSidebarNav, AdminTopBar } from "../../components/StayScoutNav";
import { AdminRoleNavbar } from "../../components/RoleNavbar";
import { useDispatch } from "react-redux";
import { logOut } from "../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const PIE_COLORS = ["#6366f1", "#a5b4fc", "#c7d2fe"];

export default function AdminDashboard() {
  const [users, setUsers] = useState({ tenants: [], landlords: [] });
  const [pending, setPending] = useState([]);
  const [settings, setSettings] = useState({ chatbotEnabled: true, heatmapEnabled: true });
  const [analytics, setAnalytics] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const load = async () => {
    const [u, p, s, a] = await Promise.all([
      axiosFetch.get("/admin/users"),
      axiosFetch.get("/admin/listings/pending"),
      axiosFetch.get("/admin/settings"),
      axiosFetch.get("/admin/analytics/dashboard").catch(() => ({ data: null })),
    ]);
    setUsers(u.data);
    setPending(p.data.listings || []);
    setSettings(s.data);
    setAnalytics(a.data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const toggleUser = async (role, id, active) => {
    await axiosFetch.patch(`/admin/users/${role}/${id}/active`, { active: !active });
    load();
  };

  const setListing = async (id, status) => {
    await axiosFetch.patch(`/admin/listings/${id}/status`, { status });
    load();
  };

  const patchSettings = async (patch) => {
    const { data } = await axiosFetch.patch("/admin/settings", patch);
    setSettings(data);
  };

  const handleLogout = async () => {
    await dispatch(logOut());
    navigate("/");
  };

  const mapProps = useMemo(() => {
    if (!analytics?.heatmapOverview?.length) return [];
    return analytics.heatmapOverview.slice(0, 40).map((pt, i) => ({
      _id: `adm-${i}`,
      name: pt.name || `Listing ${i + 1}`,
      lat: pt.lat,
      lng: pt.lng,
      price: pt.price ?? 0,
      description: "",
      distanceKm: null,
      walkMinutes: null,
      landlordId: null,
    }));
  }, [analytics?.heatmapOverview]);

  const pieData = useMemo(() => {
    const d = analytics?.overallSentiment?.distribution;
    if (!d) return [];
    return [
      { name: "Low", value: d.low },
      { name: "Neutral", value: d.neutral },
      { name: "High", value: d.high },
    ];
  }, [analytics?.overallSentiment?.distribution]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-56 lg:w-64 shrink-0 bg-slate-900 text-slate-100 md:min-h-screen flex flex-col border-r border-white/5">
        <div className="p-4 border-b border-white/10 flex items-center gap-2">
          <Logo />
          <div>
            <p className="font-display font-semibold text-white text-sm">StayScout</p>
            <p className="text-[10px] text-slate-400">Admin</p>
          </div>
        </div>
        <div className="p-2 flex-1 overflow-y-auto">
          <StayScoutAdminSidebarNav />
        </div>
        <div className="p-4 border-t border-white/10">
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-slate-400 hover:text-white w-full text-left"
          >
            Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-4 shadow-sm space-y-3">
          <AdminTopBar title="Analytics dashboard" subtitle="StayScout · LGU oversight" />
          <AdminRoleNavbar />
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-8 max-w-7xl mx-auto w-full">
          {analytics && (
            <section id="admin-stats" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Total users",
                  value: (analytics.users?.totalTenants ?? 0) + (analytics.users?.totalLandlords ?? 0),
                  sub: "Tenants + landlords",
                },
                {
                  label: "Total listings",
                  value: (analytics.listings?.approved ?? 0) + (analytics.listings?.pending ?? 0),
                  sub: "All statuses",
                },
                {
                  label: "Active listings",
                  value: analytics.listings?.approved ?? "—",
                  sub: "Approved",
                },
                {
                  label: "Pending approvals",
                  value: analytics.listings?.pending ?? "—",
                  sub: "Awaiting review",
                },
              ].map((c) => (
                <div
                  key={c.label}
                  className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{c.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{c.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
                </div>
              ))}
            </section>
          )}

          {analytics?.userGrowth && (
            <section className="rounded-2xl bg-white border border-slate-200 p-4 md:p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">User growth (new registrations)</h2>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="newUsers" name="New users" stroke="#4f46e5" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            {analytics?.listingsPerArea && (
              <section className="rounded-2xl bg-white border border-slate-200 p-4 md:p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Listings per area</h2>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.listingsPerArea}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="area" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={70} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" name="Listings" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {pieData.length > 0 && (
              <section className="rounded-2xl bg-white border border-slate-200 p-4 md:p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Sentiment distribution</h2>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}
          </div>

          {analytics && (
            <section id="admin-map" className="rounded-2xl bg-white border border-slate-200 p-4 md:p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Global heatmap</h2>
              <p className="text-sm text-slate-600 mb-4">
                Approved listings (sentiment-weighted). SEAIT ref: {analytics.seait?.lat?.toFixed(4)},{" "}
                {analytics.seait?.lng?.toFixed(4)}
              </p>
              <StayScoutMap
                properties={mapProps}
                heatmapPoints={analytics.heatmapOverview || []}
                mode="both"
              />
            </section>
          )}

          <section id="admin-settings" className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">System settings</h2>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.chatbotEnabled}
                  onChange={(e) => patchSettings({ chatbotEnabled: e.target.checked })}
                  className="rounded border-slate-300"
                />
                Chatbot enabled
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.heatmapEnabled}
                  onChange={(e) => patchSettings({ heatmapEnabled: e.target.checked })}
                  className="rounded border-slate-300"
                />
                Heatmap enabled
              </label>
            </div>
          </section>

          <section id="admin-pending" className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Pending listings</h2>
              <p className="text-sm text-slate-500">Approve or reject new submissions</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-slate-600">
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Landlord</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((l) => (
                    <tr key={l._id} className="border-t border-slate-100 hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-medium text-slate-900">{l.title}</td>
                      <td className="px-4 py-3">₱{l.price?.toLocaleString?.()}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {l.propertyOwner?.firstName} {l.propertyOwner?.lastName}
                        <span className="block text-xs text-slate-400">{l.propertyOwner?.email}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          className="mr-2 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700"
                          onClick={() => setListing(l._id, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-700"
                          onClick={() => setListing(l._id, "rejected")}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!pending.length && (
              <p className="text-slate-500 text-sm px-5 py-8 text-center">No pending listings.</p>
            )}
          </section>

          <section id="admin-users" className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">Tenants</h2>
              </div>
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-slate-600">
                      <th className="px-4 py-2 font-medium">Name</th>
                      <th className="px-4 py-2 font-medium">Role</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                      <th className="px-4 py-2 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.tenants?.map((t) => (
                      <tr key={t._id} className="border-t border-slate-100">
                        <td className="px-4 py-2">
                          {t.firstName} {t.lastName}
                          <span className="block text-xs text-slate-400">{t.email}</span>
                        </td>
                        <td className="px-4 py-2">Tenant</td>
                        <td className="px-4 py-2">{t.accountStatus ? "Active" : "Inactive"}</td>
                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            className="text-indigo-600 font-medium text-xs hover:underline"
                            onClick={() => toggleUser("tenant", t._id, t.accountStatus)}
                          >
                            {t.accountStatus ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">Landlords</h2>
              </div>
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-slate-600">
                      <th className="px-4 py-2 font-medium">Name</th>
                      <th className="px-4 py-2 font-medium">Role</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                      <th className="px-4 py-2 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.landlords?.map((t) => (
                      <tr key={t._id} className="border-t border-slate-100">
                        <td className="px-4 py-2">
                          {t.firstName} {t.lastName}
                          <span className="block text-xs text-slate-400">{t.email}</span>
                        </td>
                        <td className="px-4 py-2">Landlord</td>
                        <td className="px-4 py-2">{t.accountStatus ? "Active" : "Inactive"}</td>
                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            className="text-indigo-600 font-medium text-xs hover:underline"
                            onClick={() => toggleUser("landlord", t._id, t.accountStatus)}
                          >
                            {t.accountStatus ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {analytics?.popularProperties && (
            <section className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Most popular (views)</h2>
              <ul className="text-sm space-y-2 text-slate-600">
                {analytics.popularProperties?.map((p) => (
                  <li key={p._id} className="flex justify-between gap-2 border-b border-slate-50 pb-2 last:border-0">
                    <span>{p.title}</span>
                    <span className="text-slate-400">{`${p.viewCount ?? 0} views`}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
