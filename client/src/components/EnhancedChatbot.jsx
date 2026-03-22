import { useState } from "react";
import axiosFetch from "../utils/axiosCreate";
import CircularProgress from "@mui/material/CircularProgress";

export default function EnhancedChatbot({ disabled }) {
  const [message, setMessage] = useState("under 1500 near SEAIT");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (disabled) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const { data } = await axiosFetch.post("/tenant/stayscout/chatbot/compare", {
        message,
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.msg || "Could not compare properties");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 p-4 bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-2">Chatbot comparison</h3>
      <p className="text-sm text-slate-600 mb-3">
        Database-backed: try &quot;under 1500 near SEAIT&quot; or &quot;cheapest near SEAIT&quot;. Ranking:
        rating×0.6 + sentiment×0.4.
      </p>
      <form onSubmit={submit} className="space-y-3">
        <textarea
          className="w-full border border-slate-300 rounded-md p-2 text-sm min-h-[80px]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled || loading}
        />
        <button
          type="submit"
          disabled={disabled || loading}
          className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm disabled:opacity-50"
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Compare"}
        </button>
      </form>
      {error && <p className="text-rose-600 text-sm mt-2">{error}</p>}
      {result && (
        <div className="mt-4 text-sm space-y-2">
          <p className="text-slate-500">
            {result.parsed?.cheapest && result.parsed?.nearSeait
              ? "Query: cheapest near SEAIT"
              : `Query: up to ₱${result.parsed?.budget?.toLocaleString?.() ?? result.parsed?.budget}`}
            {result.parsed?.maxDistanceKm != null && ` · within ${result.parsed.maxDistanceKm}km`}
          </p>
          <ul className="list-decimal pl-5 space-y-1">
            {result.top3?.map((p) => (
              <li key={p._id}>
                <strong>{p.name}</strong> — ₱{p.price?.toLocaleString?.()}
                {p.distanceKm != null && ` · ${p.distanceKm}km`}
                {p.walkMinutes != null && ` · ${p.walkMinutes}min walk`}
                {p.score != null && ` · score ${p.score.toFixed(2)}`}
                {p.features && (
                  <div className="text-slate-600 text-xs mt-0.5">{p.features}</div>
                )}
              </li>
            ))}
          </ul>
          <p className="text-slate-800 font-medium border-t border-slate-100 pt-2">{result.recommendation}</p>
        </div>
      )}
    </div>
  );
}
