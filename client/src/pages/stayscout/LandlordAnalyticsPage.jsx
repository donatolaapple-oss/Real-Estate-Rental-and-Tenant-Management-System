import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axiosFetch from "../../utils/axiosCreate";
import { Logo } from "../../components";
import { LandlordRoleNavbar } from "../../components/RoleNavbar";
import StayScoutMap from "../../components/StayScoutMap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function LandlordAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosFetch
      .get("/analytics/landlord/dashboard")
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const chartRows = useMemo(() => {
    if (!data?.listings?.length) return [];
    return data.listings.slice(0, 12).map((l) => ({
      name: l.title?.length > 18 ? l.title.slice(0, 18) + "…" : l.title,
      views: l.viewCount || 0,
      rating: l.rating ?? 0,
      sentiment: Math.round((l.sentimentScore ?? 0.5) * 100),
    }));
  }, [data]);

  const mapProps = useMemo(() => {
    if (!data?.heatmapPoints?.length) return [];
    return data.heatmapPoints.map((p, i) => ({
      _id: `ll-${i}`,
      name: p.name || "Listing",
      lat: p.lat,
      lng: p.lng,
      price: p.price,
      description: "",
      distanceKm: null,
      walkMinutes: null,
      landlordId: null,
    }));
  }, [data?.heatmapPoints]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Logo />
          <Link to="/landlord/dashboard" className="text-sm text-indigo-600">
            ← Dashboard
          </Link>
        </div>
        <LandlordRoleNavbar />
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Property analytics</h1>
          <p className="text-slate-600 mt-1">Your listings only — views, sentiment, and map.</p>
        </div>

        {loading && <p className="text-slate-500">Loading…</p>}

        {data?.summary && (
          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Listings", value: data.summary.listingCount },
              { label: "Total views", value: data.summary.totalViews },
              { label: "Avg rating", value: data.summary.avgRating },
              { label: "Avg sentiment", value: data.summary.avgSentiment },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
                <p className="text-xs text-slate-500 uppercase">{s.label}</p>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              </div>
            ))}
          </section>
        )}

        {chartRows.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Views per listing</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartRows}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#10b981" name="Views" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {data?.listings?.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm overflow-x-auto">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Listing performance</h2>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Views</th>
                  <th className="py-2 pr-4">Rating</th>
                  <th className="py-2 pr-4">Sentiment</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.listings.map((l) => (
                  <tr key={l._id} className="border-b border-slate-50">
                    <td className="py-2 pr-4 font-medium text-slate-800">{l.title}</td>
                    <td className="py-2 pr-4">{l.viewCount}</td>
                    <td className="py-2 pr-4">{l.rating}</td>
                    <td className="py-2 pr-4">{(l.sentimentScore ?? 0.5).toFixed(2)}</td>
                    <td className="py-2 capitalize">{l.listingStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {mapProps.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Your listings on the map</h2>
            <StayScoutMap properties={mapProps} heatmapPoints={data?.heatmapPoints || []} mode="both" />
          </section>
        )}
      </main>
    </div>
  );
}
