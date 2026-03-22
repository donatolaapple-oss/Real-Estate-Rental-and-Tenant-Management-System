import { NavLink } from "react-router-dom";

const base =
  "px-2 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200";
const inactive = "text-slate-600 hover:bg-slate-100 hover:text-indigo-700";
const activeCls = ({ isActive }) => `${base} ${isActive ? "bg-indigo-50 text-indigo-700" : inactive}`;

export function TenantRoleNavbar() {
  return (
    <nav className="flex flex-wrap items-center gap-1 md:gap-2" aria-label="Tenant">
      <NavLink to="/tenant/dashboard" className={activeCls} end>
        🏠 Home
      </NavLink>
      <a href="#stayscout-map" className={`${base} ${inactive}`}>
        🗺️ Map
      </a>
      <a href="#stayscout-listings" className={`${base} ${inactive}`}>
        📋 Listings
      </a>
      <NavLink to="/tenant/chat" className={activeCls}>
        💬 Chat
      </NavLink>
      <NavLink to="/tenant/analytics" className={activeCls}>
        📊 Analytics
      </NavLink>
      <NavLink to="/tenant/profile" className={activeCls}>
        👤 Profile
      </NavLink>
    </nav>
  );
}

export function LandlordRoleNavbar() {
  return (
    <nav className="flex flex-wrap items-center gap-1 md:gap-2" aria-label="Landlord">
      <NavLink to="/landlord/dashboard" className={activeCls} end>
        📊 Dashboard
      </NavLink>
      <NavLink to="/landlord/property/post" className={activeCls}>
        ➕ Add Listing
      </NavLink>
      <a href="#landlord-listings" className={`${base} ${inactive}`}>
        📋 My Listings
      </a>
      <a href="#landlord-stats" className={`${base} ${inactive}`}>
        📈 Analytics
      </a>
      <NavLink to="/landlord/chat" className={activeCls}>
        💬 Chat
      </NavLink>
      <NavLink to="/landlord/profile" className={activeCls}>
        👤 Profile
      </NavLink>
    </nav>
  );
}

export function AdminRoleNavbar() {
  return (
    <nav className="flex flex-wrap items-center gap-1 md:gap-2 text-sm" aria-label="Admin">
      <NavLink to="/admin/dashboard" className={activeCls} end>
        📊 Overview
      </NavLink>
      <a href="#admin-users" className={`${base} ${inactive}`}>
        👥 Users
      </a>
      <a href="#admin-pending" className={`${base} ${inactive}`}>
        🏠 Listings
      </a>
      <NavLink to="/admin/analytics" className={activeCls}>
        📈 Analytics
      </NavLink>
      <a href="#admin-settings" className={`${base} ${inactive}`}>
        ⚙️ Settings
      </a>
      <span className={`${base} text-slate-400 cursor-not-allowed`} title="Use profile route when added">
        👤 Profile
      </span>
    </nav>
  );
}
