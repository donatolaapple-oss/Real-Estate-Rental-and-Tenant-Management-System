import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import axiosFetch from "../../utils/axiosCreate";
import InteractiveMap from "../../components/InteractiveMap";
import DynamicPropertyCards from "../../components/DynamicPropertyCards";
import SentimentAnalytics from "../../components/SentimentAnalytics";
import FloatingStayScoutChatbot from "../../components/FloatingStayScoutChatbot";
import ChatSystem from "../../components/ChatSystem";
import { Logo } from "../../components";
import { TenantRoleNavbar } from "../../components/RoleNavbar";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "../../features/auth/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import MapIcon from "@mui/icons-material/Map";
import SearchIcon from "@mui/icons-material/Search";

const PRICE_PRESETS = [
  { id: "all", label: "Any price" },
  { id: "under5k", label: "Under ₱5,000" },
  { id: "5k10k", label: "₱5,000 – ₱10,000" },
  { id: "over10k", label: "Over ₱10,000" },
];

function priceMatches(preset, price) {
  if (!price && price !== 0) return true;
  if (preset === "all") return true;
  if (preset === "under5k") return price < 5000;
  if (preset === "5k10k") return price >= 5000 && price <= 10000;
  if (preset === "over10k") return price > 10000;
  return true;
}

export default function TenantDashboard() {
  const [mapData, setMapData] = useState({ properties: [], center: null, seait: null });
  const [heatmap, setHeatmap] = useState([]);
  const [mode, setMode] = useState("both");
  const [sentiment, setSentiment] = useState({ joy: 0.5, anger: 0.1, satisfaction: 0.5 });
  const [insights, setInsights] = useState(null);
  const [focus, setFocus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [areaFilter, setAreaFilter] = useState("all");
  const [dealType, setDealType] = useState("rent");
  const [roomType, setRoomType] = useState("all");
  const [pricePreset, setPricePreset] = useState("all");
  const mapSectionRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);
  const chatbotDisabled = false;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mapRes, heatRes, insRes] = await Promise.all([
        axiosFetch.get("/tenant/stayscout/map"),
        axiosFetch.get("/analytics/heatmap").catch(() => ({ data: [] })),
        axiosFetch.get("/tenant/stayscout/insights").catch(() => ({ data: null })),
      ]);
      setMapData(mapRes.data);
      setHeatmap(Array.isArray(heatRes.data) ? heatRes.data : []);
      setInsights(insRes.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const focusId = location.state?.focusPropertyId;
    if (!focusId || !mapData.properties?.length) return;
    const p = mapData.properties.find((x) => String(x._id) === String(focusId));
    if (p) {
      setFocus({ lat: p.lat, lng: p.lng });
      setTimeout(() => mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, mapData.properties, navigate, location.pathname]);

  useEffect(() => {
    if (!mapData.properties?.length) return;
    const first = mapData.properties[0];
    axiosFetch
      .get(`/sentiment/property/${first._id}`)
      .then((r) => setSentiment(r.data))
      .catch(() => {});
  }, [mapData.properties]);

  const areaOptions = useMemo(() => {
    const set = new Set();
    mapData.properties?.forEach((p) => {
      const a = (p.city || p.location || "").trim();
      if (a) set.add(a);
    });
    return ["all", ...Array.from(set).sort()];
  }, [mapData.properties]);

  const filteredProperties = useMemo(() => {
    let list = mapData.properties || [];
    if (areaFilter !== "all") {
      list = list.filter((p) => {
        const label = (p.city || p.location || "").trim();
        return label === areaFilter;
      });
    }
    if (dealType === "boarding") {
      list = list.filter((p) => (p.category || "").toLowerCase() === "room");
    }
    if (roomType !== "all") {
      list = list.filter((p) => (p.category || "") === roomType);
    }
    list = list.filter((p) => priceMatches(pricePreset, p.price));
    return list;
  }, [mapData.properties, areaFilter, dealType, roomType, pricePreset]);

  const handleLogout = async () => {
    await dispatch(logOut());
    navigate("/");
  };

  const focusListing = (p) => {
    setFocus({ lat: p.lat, lng: p.lng });
    mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToMap = () => {
    mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <Logo />
          <div className="min-w-0">
            <h1 className="font-display text-lg font-semibold text-slate-900 truncate">StayScout</h1>
            <p className="text-xs text-slate-500 hidden sm:block">Boarding houses near SEAIT · Tupi</p>
          </div>
        </div>
        <TenantRoleNavbar />
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500 truncate max-w-[140px] hidden md:inline">
            {user?.firstName ? `Hi, ${user.firstName}` : ""}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-100"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Hero + search */}
      <section
        className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white overflow-hidden"
        aria-label="Search"
      >
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTYgMzBjMC0xLjY2IDEuMzQtMyAzLTNoMTJjMS42NiAwIDMgMS4zNCAzIDNzLTEuMzQgMy0zIDNoLTEyYy0xLjY2IDAtMy0xLjM0LTMtM3oiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')]"
        />
        <div className="relative max-w-6xl mx-auto px-4 py-10 md:py-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Find your next stay</h2>
          <p className="text-indigo-100 text-sm md:text-base max-w-2xl mb-8">
            Search Tupi-area boarding houses with filters tuned for StayScout. Distances reference SEAIT.
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <label className="flex-1 min-w-[140px]">
              <span className="block text-[11px] uppercase tracking-wide text-indigo-200 mb-1">Tupi area</span>
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="w-full rounded-xl border-0 bg-white text-slate-900 text-sm py-2.5 px-3 shadow-sm"
              >
                {areaOptions.map((a) => (
                  <option key={a} value={a}>
                    {a === "all" ? "All areas" : a}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex-1 min-w-[140px]">
              <span className="block text-[11px] uppercase tracking-wide text-indigo-200 mb-1">Deal type</span>
              <select
                value={dealType}
                onChange={(e) => setDealType(e.target.value)}
                className="w-full rounded-xl border-0 bg-white text-slate-900 text-sm py-2.5 px-3 shadow-sm"
              >
                <option value="rent">Rent (all)</option>
                <option value="boarding">Boarding house (Room)</option>
              </select>
            </label>
            <label className="flex-1 min-w-[140px]">
              <span className="block text-[11px] uppercase tracking-wide text-indigo-200 mb-1">Room type</span>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full rounded-xl border-0 bg-white text-slate-900 text-sm py-2.5 px-3 shadow-sm"
              >
                <option value="all">All categories</option>
                <option value="Room">Room</option>
                <option value="House">House</option>
                <option value="Apartment">Apartment</option>
                <option value="Shop Space">Shop Space</option>
                <option value="Office Space">Office Space</option>
              </select>
            </label>
            <label className="flex-1 min-w-[140px]">
              <span className="block text-[11px] uppercase tracking-wide text-indigo-200 mb-1">Price range</span>
              <select
                value={pricePreset}
                onChange={(e) => setPricePreset(e.target.value)}
                className="w-full rounded-xl border-0 bg-white text-slate-900 text-sm py-2.5 px-3 shadow-sm"
              >
                {PRICE_PRESETS.map((pr) => (
                  <option key={pr.id} value={pr.id}>
                    {pr.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={scrollToMap}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-indigo-700 font-semibold text-sm px-5 py-2.5 shadow-lg hover:bg-indigo-50 transition-colors"
            >
              <SearchIcon fontSize="small" />
              Search &amp; map
            </button>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        <section id="stayscout-listings">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Popular listings</h2>
              <p className="text-sm text-slate-500">
                {loading ? "Loading…" : `${filteredProperties.length} propert${filteredProperties.length === 1 ? "y" : "ies"} match`}
              </p>
            </div>
            <button
              type="button"
              onClick={scrollToMap}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 text-emerald-800 text-sm font-medium px-4 py-2 shadow-sm hover:bg-emerald-100 transition-colors"
            >
              <MapIcon sx={{ fontSize: 20 }} className="text-emerald-600" />
              Show on map
            </button>
          </div>

          <DynamicPropertyCards properties={filteredProperties} onMapFocus={focusListing} />
          {!loading && filteredProperties.length === 0 && (
            <p className="text-center text-slate-500 py-12">No listings match these filters. Try adjusting your search.</p>
          )}
        </section>

        <section id="stayscout-map" ref={mapSectionRef} className="scroll-mt-24">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Interactive map</h2>
          <p className="text-sm text-slate-600 mb-4">
            Reference: SEAIT ≈ ({mapData.seait?.lat?.toFixed(4)}, {mapData.seait?.lng?.toFixed(4)}). Toggle pins,
            heatmap, or both.
          </p>
          <div
            className="inline-flex rounded-full p-1 bg-slate-200/80 mb-4"
            role="tablist"
            aria-label="Map display mode"
          >
            {["pins", "heatmap", "both"].map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all duration-200 ${
                  mode === m ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className={`relative rounded-2xl overflow-hidden ${loading ? "min-h-[460px] bg-slate-100 animate-pulse" : ""}`}>
            {!loading && (
              <InteractiveMap
                properties={filteredProperties}
                heatmapPoints={heatmap}
                mode={mode}
                focusPosition={focus}
              />
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2">Pins shown: {filteredProperties.length}</p>
        </section>

        {insights && (
          <section className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-2">Best areas (sentiment)</h3>
              <ul className="text-sm space-y-1 text-slate-600">
                {insights.bestAreas?.slice(0, 5).map((a) => (
                  <li key={a.area}>
                    {a.area}: avg ₱{a.avgPrice?.toLocaleString?.()} · sentiment {a.avgSentiment}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-2">Average price by area</h3>
              <ul className="text-sm space-y-1 max-h-40 overflow-y-auto text-slate-600">
                {insights.byArea?.map((a) => (
                  <li key={a.area}>
                    {a.area}: ₱{a.avgPrice?.toLocaleString?.()} ({a.listingCount} listings)
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section id="tenant-analytics" className="grid md:grid-cols-2 gap-6 scroll-mt-24">
          <SentimentAnalytics
            joy={sentiment.joy}
            anger={sentiment.anger}
            satisfaction={sentiment.satisfaction}
            sentimentScore={sentiment.sentimentScore}
          />
          <div className="space-y-4">
            <ChatSystem role="tenant" />
            <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 p-6 text-sm text-slate-600">
              <p className="font-semibold text-slate-900 mb-1">Need a quick comparison?</p>
              <p>
                Use the purple assistant (bottom-right). Answers use live MongoDB listings; ranking uses rating×0.6 +
                sentiment×0.4.
              </p>
            </div>
          </div>
        </section>
      </main>

      <FloatingStayScoutChatbot disabled={chatbotDisabled} />
    </div>
  );
}
