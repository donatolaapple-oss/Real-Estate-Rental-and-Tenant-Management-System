import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosFetch from "../../utils/axiosCreate";
import VirtualTour from "../../components/VirtualTour";
import SentimentAnalytics from "../../components/SentimentAnalytics";
import { Logo } from "../../components";
import { TenantRoleNavbar } from "../../components/RoleNavbar";
import ThreeSixtyIcon from "@mui/icons-material/ThreeSixty";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await axiosFetch.get(`/tenant/stayscout/property/${id}`);
      setProperty(data.property);
    })().catch(() => setProperty(null));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    axiosFetch
      .get(`/sentiment/property/${id}`)
      .then((r) => setSentiment(r.data))
      .catch(() => {});
  }, [id]);

  const ensureContactAndGoChat = async () => {
    const landlordId = property?.landlordId;
    if (!landlordId) return;
    try {
      const { data } = await axiosFetch.get("/tenant/profile");
      const contacts = data?.user?.contacts || [];
      const has = contacts.some((c) => c.toString() === landlordId.toString());
      if (!has) {
        await axiosFetch.patch(`/tenant/addContact/${landlordId}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await axiosFetch.post(`/sentiment/review/${id}`, { text: reviewText });
      setReviewText("");
      const { data } = await axiosFetch.get(`/sentiment/property/${id}`);
      setSentiment(data);
      const pr = await axiosFetch.get(`/tenant/stayscout/property/${id}`);
      setProperty(pr.data.property);
      setMsg("Review submitted. Sentiment updated.");
    } catch (err) {
      setMsg(err.response?.data?.msg || "Failed to submit review");
    }
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <p className="text-slate-600">Loading property…</p>
        <Link to="/tenant/dashboard" className="mt-4 text-indigo-600 font-medium">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const panUrl =
    property.panorama && String(property.panorama).startsWith("http")
      ? property.panorama
      : null;
  const gallery = (property.images || []).filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <Logo />
          <div className="min-w-0">
            <p className="font-display font-semibold text-slate-900 truncate">StayScout</p>
            <p className="text-xs text-slate-500 truncate">Property</p>
          </div>
        </div>
        <TenantRoleNavbar />
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">{property.name}</h1>
          <p className="text-slate-600 mt-1">
            ₱{property.price?.toLocaleString?.()} / month · {property.location || property.address?.city}
          </p>
          {property.distanceKm != null && (
            <p className="text-sm text-slate-500 mt-2">
              {property.distanceKm} km from SEAIT · ~{property.walkMinutes ?? "—"} min walk
            </p>
          )}
          <p className="text-slate-600 text-sm mt-4 leading-relaxed">{property.description}</p>

          <div className="flex flex-wrap gap-3 mt-6">
            <a
              href="#virtual-tour"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white text-sm font-medium px-4 py-2.5 shadow-md hover:bg-indigo-700 transition-colors"
            >
              <ThreeSixtyIcon fontSize="small" />
              360° virtual tour
            </a>
            <Link
              to="/tenant/chat"
              state={{ openChatWithLandlord: property.landlordId }}
              onClick={ensureContactAndGoChat}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-indigo-200 bg-white text-indigo-800 text-sm font-medium px-4 py-2.5 hover:bg-indigo-50 transition-colors"
            >
              <ChatBubbleOutlineIcon fontSize="small" />
              Chat landlord
            </Link>
            <Link
              to="/tenant/dashboard"
              state={{ focusPropertyId: property._id }}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 text-slate-900 text-sm font-medium px-4 py-2.5 hover:bg-slate-200 transition-colors"
            >
              <MapOutlinedIcon fontSize="small" />
              View on map
            </Link>
          </div>
        </div>

        {gallery.length > 0 && (
          <section className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Photos</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
              {gallery.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="h-52 w-auto min-w-[220px] rounded-xl object-cover border border-slate-200 shadow-sm snap-start"
                />
              ))}
            </div>
          </section>
        )}

        <section id="virtual-tour" className="scroll-mt-24">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            {panUrl ? "360° panorama" : "Immersive photo tour"}
          </h2>
          <p className="text-sm text-slate-500 mb-3">
            {panUrl
              ? "Full spherical view (optional upload)."
              : "Explore uploaded photos with zoom and drag — no external links required."}
          </p>
          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white p-2">
            <VirtualTour panorama={panUrl} fallbackImages={gallery} />
          </div>
        </section>

        {sentiment && (
          <SentimentAnalytics
            joy={sentiment.joy}
            anger={sentiment.anger}
            satisfaction={sentiment.satisfaction}
            sentimentScore={sentiment.sentimentScore}
          />
        )}

        {property.reviews?.length > 0 && (
          <section className="rounded-2xl border border-slate-200 p-5 bg-white shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Reviews</h2>
            <ul className="space-y-3 text-sm text-slate-700">
              {property.reviews.map((r, i) => (
                <li key={i} className="border-b border-slate-100 pb-3 last:border-0">
                  {r.text}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 p-5 bg-white shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Leave a review</h2>
          <form onSubmit={submitReview} className="space-y-3">
            <textarea
              className="w-full border border-slate-200 rounded-xl p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience…"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700"
            >
              Submit review
            </button>
          </form>
          {msg && <p className="text-sm mt-3 text-slate-700">{msg}</p>}
        </section>
      </main>
    </div>
  );
}
