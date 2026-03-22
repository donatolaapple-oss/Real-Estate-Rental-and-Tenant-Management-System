import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axiosFetch from "../../utils/axiosCreate";
import { Logo } from "../../components";
import { TenantRoleNavbar } from "../../components/RoleNavbar";
import StayScoutMap from "../../components/StayScoutMap";
import SentimentAnalytics from "../../components/SentimentAnalytics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TenantAnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [mapData, setMapData] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [s, h, m] = await Promise.all([
          axiosFetch.get("/analytics/tenant/summary"),
          axiosFetch.get("/analytics/heatmap").catch(() => ({ data: [] })),
          axiosFetch.get("/tenant/stayscout/map"),
        ]);
        if (!cancelled) {
          setSummary(s.data);
          setHeatmap(Array.isArray(h.data) ? h.data : []);
          setMapData(m.data);
          const firstProp = m.data?.properties?.[0];
          if (firstProp?._id) {
            const sen = await axiosFetch.get(`/sentiment/property/${firstProp._id}`).catch(() => null);
            if (sen?.data) setSentiment(sen.data);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const priceByArea = useMemo(() => {
    const rows = summary?.byArea || [];
    return rows.slice(0, 10).map((r) => ({
      area: r.area?.length > 12 ? r.area.slice(0, 12) + "…" : r.area,
      avgPrice: r.avgPrice,
    }));
  }, [summary]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Logo />
          <Link to="/tenant/dashboard" className="text-sm text-indigo-600">
            ← Dashboard
          </Link>
        </div>
        <TenantRoleNavbar />
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Market analytics</h1>
          <p className="text-slate-600 mt-1">
            Live data from approved listings — compare areas and find where to stay.
          </p>
        </div>

        {loading && <p className="text-slate-500">Loading…</p>}

        {!loading && summary && (
          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
              <p className="text-xs text-slate-500 uppercase">Active landlords</p>
              <p className="text-2xl font-bold text-slate-900">{summary.landlordCount ?? "—"}</p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
              <p className="text-xs text-slate-500 uppercase">Areas tracked</p>
              <p className="text-2xl font-bold text-slate-900">{summary.byArea?.length ?? 0}</p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
              <p className="text-xs text-slate-500 uppercase">Best area (sentiment)</p>
              <p className="text-lg font-semibold text-indigo-700 truncate">
                {summary.bestAreas?.[0]?.area ?? "—"}
              </p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
              <p className="text-xs text-slate-500 uppercase">Top-rated</p>
              <p className="text-lg font-semibold text-slate-900 truncate">
                {summary.topRated?.[0]?.name ?? "—"}
              </p>
            </div>
          </section>
        )}

        {summary?.topRated?.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Best-rated properties</h2>
            <ul className="space-y-2 text-sm">
              {summary.topRated.slice(0, 8).map((p, i) => (
                <li key={i} className="flex justify-between gap-2 border-b border-slate-50 pb-2 last:border-0">
                  <span className="font-medium text-slate-800">{p.name}</span>
                  <span className="text-slate-500">
                    {p.rating}★ · ₱{p.price?.toLocaleString?.()} · {p.location}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {priceByArea.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Average price by area</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceByArea}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="area" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgPrice" fill="#6366f1" name="Avg ₱" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {sentiment && (
          <SentimentAnalytics
            joy={sentiment.joy}
            anger={sentiment.anger}
            satisfaction={sentiment.satisfaction}
            sentimentScore={sentiment.sentimentScore}
          />
        )}

        {mapData?.properties?.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Map · sentiment heatmap</h2>
            <p className="text-sm text-slate-500 mb-4">Same listings as the dashboard — heatmap shows review sentiment.</p>
            <StayScoutMap
              properties={mapData.properties || []}
              heatmapPoints={heatmap.length ? heatmap : []}
              mode={heatmap.length ? "both" : "pins"}
            />
          </section>
        )}
      </main>
    </div>
  );
}
