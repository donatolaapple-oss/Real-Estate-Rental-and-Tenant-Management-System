import { Link } from "react-router-dom";

export default function FeatureUnavailable({ title = "This page", homeTo = "/" }) {
  return (
    <main className="max-w-lg mx-auto mt-16 px-4 text-center">
      <h1 className="text-xl font-semibold text-slate-800 mb-2">{title}</h1>
      <p className="text-slate-600 text-sm mb-6">
        This section is not available in the current build. Use the dashboard and property flows from the main menu.
      </p>
      <Link to={homeTo} className="text-indigo-600 font-medium hover:underline">
        Go back
      </Link>
    </main>
  );
}
