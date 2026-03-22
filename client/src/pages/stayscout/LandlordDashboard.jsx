import { useEffect, useState, useCallback } from "react";
import axiosFetch from "../../utils/axiosCreate";
import StayScoutMap from "../../components/StayScoutMap";
import { Logo } from "../../components";
import { LandlordRoleNavbar } from "../../components/RoleNavbar";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "../../features/auth/authSlice";
import { deleteProperty } from "../../features/realEstateOwner/realEstateOwnerSlice";
import { useNavigate, Link } from "react-router-dom";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import ChatIcon from "@mui/icons-material/Chat";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

export default function LandlordDashboard() {
  const { user } = useSelector((s) => s.auth);
  const [dash, setDash] = useState(null);
  const [mode, setMode] = useState("both");
  const [focus, setFocus] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const load = useCallback(() => {
    axiosFetch
      .get("/analytics/landlord/dashboard")
      .then((r) => setDash(r.data))
      .catch(() => setDash(null));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleLogout = async () => {
    await dispatch(logOut());
    navigate("/");
  };

  const mapProps = (dash?.heatmapPoints || []).map((p, i) => ({
    _id: `ll-${i}`,
    name: p.name || "Listing",
    lat: p.lat,
    lng: p.lng,
    price: p.price,
    description: "",
    distanceKm: null,
    walkMinutes: null,
    rating: 4,
    landlordId: user?._id,
  }));

  const summary = dash?.summary;

  const onDelete = (slug, title) => {
    if (!window.confirm(`Delete listing “${title}”? This cannot be undone.`)) return;
    dispatch(deleteProperty({ slug }))
      .unwrap()
      .then(() => load())
      .catch(() => {});
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-56 lg:w-64 shrink-0 bg-slate-900 text-slate-100 md:min-h-screen flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Logo />
            <div>
              <p className="font-display font-semibold text-white text-sm">StayScout</p>
              <p className="text-[10px] text-slate-400">Landlord</p>
            </div>
          </div>
        </div>
        <nav className="p-2 flex-1 space-y-1">
          <Link
            to="/landlord/dashboard"
            className="block px-3 py-2 rounded-lg text-sm bg-white/10 text-white font-medium"
          >
            Dashboard
          </Link>
          <Link
            to="/landlord/property/post"
            className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white"
          >
            New listing
          </Link>
          <Link
            to="/landlord/chat"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white"
          >
            <ChatIcon sx={{ fontSize: 18 }} /> Messages
          </Link>
          <Link
            to="/landlord/profile"
            className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white"
          >
            Profile
          </Link>
        </nav>
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
        <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Overview</h1>
            <p className="text-xs text-slate-500">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
          <LandlordRoleNavbar />
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-8 max-w-6xl mx-auto w-full">
          {summary && (
            <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" id="landlord-stats">
              {[
                { label: "Total listings", value: summary.listingCount, icon: "📋" },
                { label: "Total views", value: summary.totalViews, icon: "👁" },
                { label: "Avg rating", value: summary.avgRating, icon: "⭐" },
                { label: "Sentiment score", value: summary.avgSentiment, icon: "💬" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <p className="text-xs text-slate-500 uppercase tracking-wide">{s.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    <span className="mr-2" aria-hidden>
                      {s.icon}
                    </span>
                    {s.value}
                  </p>
                </div>
              ))}
            </section>
          )}

          <section
            id="landlord-upload"
            className="rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div>
              <h2 className="font-semibold text-slate-900">Upload new property</h2>
              <p className="text-sm text-slate-600 mt-1">
                Add photos, map pin, and optional 360° panorama from the posting flow.
              </p>
            </div>
            <Link
              to="/landlord/property/post"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white font-medium px-5 py-3 shadow-lg hover:bg-indigo-700 transition-colors"
            >
              <AddPhotoAlternateIcon />
              Open upload panel
            </Link>
          </section>

          <section id="landlord-listings">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Your listings</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {dash?.listings?.map((l) => (
                <div
                  key={l._id}
                  className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm flex flex-col gap-3"
                >
                  <div>
                    <h3 className="font-semibold text-slate-900 line-clamp-2">{l.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      ₱{l.price?.toLocaleString?.()} · {l.location || "—"} · {l.listingStatus}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      Views {l.viewCount} · Rating {l.rating} · Sentiment {l.sentimentScore?.toFixed?.(2) ?? "—"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {l.listingStatus === "approved" && (
                      <Link
                        to={`/property/${l._id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        <VisibilityIcon sx={{ fontSize: 16 }} /> View
                      </Link>
                    )}
                    <Link
                      to={`/landlord/property/post?slug=${encodeURIComponent(l.slug)}`}
                      className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 text-slate-800 hover:bg-slate-50"
                    >
                      <EditIcon sx={{ fontSize: 16 }} /> Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(l.slug, l.title)}
                      className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg text-rose-700 border border-rose-200 hover:bg-rose-50"
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 16 }} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {!dash?.listings?.length && (
              <p className="text-slate-500 text-sm py-8 text-center">No listings yet. Create one to see it here.</p>
            )}
          </section>

          <section id="landlord-map">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Sentiment heatmap</h2>
            <p className="text-sm text-slate-600 mb-4">Mini map of your properties — switch pins, heatmap, or both.</p>
            <div className="inline-flex rounded-full p-1 bg-slate-200/80 mb-4">
              {["pins", "heatmap", "both"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setFocus(null);
                  }}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all duration-200 ${
                    mode === m ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <StayScoutMap
              properties={mapProps}
              heatmapPoints={dash?.heatmapPoints || []}
              mode={mode}
              focusPosition={focus}
            />
          </section>
        </main>
      </div>
    </div>
  );
}
