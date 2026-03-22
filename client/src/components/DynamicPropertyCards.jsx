import { Link, useNavigate } from "react-router-dom";

function pickLayout(list) {
  if (!list?.length) {
    return { large: null, medium: [], small: [], more: [] };
  }
  const byRating = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  const large = byRating[0];
  const medium = byRating.slice(1, 3);
  const used = new Set([large?._id, ...medium.map((p) => p._id)].filter(Boolean));
  const rest = list.filter((p) => !used.has(p._id));
  const small = [...rest].sort((a, b) => (a.price ?? 0) - (b.price ?? 0)).slice(0, 6);
  const used2 = new Set(
    [large?._id, ...medium.map((p) => p._id), ...small.map((p) => p._id)].filter(Boolean)
  );
  const more = list.filter((p) => !used2.has(p._id));
  return { large, medium, small, more };
}

function CardShell({ size, children, className = "" }) {
  const h =
    size === "large"
      ? "min-h-[320px] md:col-span-2 md:row-span-2"
      : size === "medium"
        ? "min-h-[240px]"
        : "min-h-[180px]";
  return (
    <article
      className={`group relative rounded-2xl bg-white border border-slate-200/80 shadow-md overflow-hidden hover:shadow-xl transition-all ${h} ${className}`}
    >
      {children}
    </article>
  );
}

export default function DynamicPropertyCards({ properties, onMapFocus }) {
  const navigate = useNavigate();
  const { large, medium, small, more } = pickLayout(properties);

  const renderCard = (p, size) => {
    if (!p) return null;
    return (
      <CardShell key={p._id} size={size}>
        <button
          type="button"
          onClick={() => navigate(`/property/${p._id}`)}
          className="block w-full h-full text-left"
        >
          <div
            className={`relative ${size === "large" ? "aspect-[16/10]" : size === "medium" ? "aspect-[5/3]" : "aspect-[4/3]"} bg-slate-200`}
          >
            {p.imageUrl || p.imageUrls?.[0] ? (
              <img
                src={p.imageUrl || p.imageUrls?.[0]}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&w=800&q=80";
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">No image</div>
            )}
            <div className="absolute top-2 left-2 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700 shadow">
              {size === "large" ? "Featured" : size === "medium" ? "Top pick" : "Budget"}
            </div>
            <div className="absolute bottom-2 right-2 rounded-lg bg-white/95 px-2 py-1 text-sm font-semibold text-indigo-700 shadow">
              ₱{p.price?.toLocaleString?.()}/mo
            </div>
          </div>
          <div className="p-3 md:p-4">
            <h3 className={`font-semibold text-indigo-700 line-clamp-1 ${size === "large" ? "text-lg" : "text-sm"}`}>
              {p.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.location || p.city || "Tupi"}</p>
            <p className="text-xs text-amber-700 mt-1">
              {p.rating != null ? `${p.rating}★` : ""}
              {p.distanceKm != null ? ` · ${p.distanceKm}km` : ""}
              {p.walkMinutes != null ? ` · ${p.walkMinutes}min walk` : ""}
            </p>
          </div>
        </button>
        <div className="px-3 pb-3 md:px-4 md:pb-4 flex flex-wrap gap-2">
          <Link
            to={`/property/${p._id}`}
            className="px-2.5 py-1 bg-indigo-600 text-white text-[11px] font-medium rounded-lg hover:bg-indigo-700"
          >
            360° Tour
          </Link>
          <Link
            to="/tenant/chat"
            state={{ openChatWithLandlord: p.landlordId }}
            className="px-2.5 py-1 border border-indigo-200 text-indigo-700 text-[11px] font-medium rounded-lg hover:bg-indigo-50"
          >
            Message Landlord
          </Link>
          <button
            type="button"
            className="px-2.5 py-1 bg-slate-100 text-slate-800 text-[11px] font-medium rounded-lg hover:bg-slate-200"
            onClick={() => onMapFocus?.(p)}
          >
            Map
          </button>
        </div>
      </CardShell>
    );
  };

  if (!properties?.length) {
    return <p className="text-center text-slate-500 py-8">No listings to show.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
        {renderCard(large, "large")}
        {medium.map((p) => renderCard(p, "medium"))}
        {small.map((p) => renderCard(p, "small"))}
      </div>
      {more.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">More listings</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {more.map((p) => renderCard(p, "small"))}
          </div>
        </div>
      )}
    </div>
  );
}
