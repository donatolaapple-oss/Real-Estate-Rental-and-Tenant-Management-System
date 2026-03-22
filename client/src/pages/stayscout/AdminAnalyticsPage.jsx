import AdminDashboard from "./AdminDashboard";

/** Dedicated analytics route — same full dashboard (no 404 on /admin/analytics). */
export default function AdminAnalyticsPage() {
  return <AdminDashboard />;
}
