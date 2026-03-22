/**
 * Displays joy / anger / satisfaction as progress bars.
 * @param {{ joy?: number, anger?: number, satisfaction?: number, sentimentScore?: number }} props
 */
export default function SentimentAnalytics({ joy = 0, anger = 0, satisfaction = 0, sentimentScore }) {
  const rows = [
    { label: "Joy", value: joy, color: "bg-emerald-500" },
    { label: "Anger", value: anger, color: "bg-rose-500" },
    { label: "Satisfaction", value: satisfaction, color: "bg-sky-500" },
  ];

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 p-4 bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800">Customer sentiment</h3>
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex justify-between text-sm text-slate-600 mb-1">
            <span>{r.label}</span>
            <span>{(r.value * 100).toFixed(0)}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full ${r.color} transition-all`}
              style={{ width: `${Math.min(100, Math.max(0, r.value * 100))}%` }}
            />
          </div>
        </div>
      ))}
      {sentimentScore != null && (
        <p className="text-sm text-slate-600 pt-2 border-t border-slate-100">
          Overall sentiment score: <strong>{(sentimentScore * 100).toFixed(0)}%</strong>
        </p>
      )}
    </div>
  );
}
