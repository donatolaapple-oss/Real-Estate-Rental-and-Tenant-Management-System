import { NavLink } from "react-router-dom";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

const linkBase =
  "px-2 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200";
const inactive = "text-slate-600 hover:bg-slate-100 hover:text-indigo-700";
const activeCls = ({ isActive }) =>
  `${linkBase} ${isActive ? "bg-indigo-50 text-indigo-700" : inactive}`;

/** Tenant: Home | Map | Listings | Chat | Profile */
export function StayScoutTenantNav() {
  return (
    <nav className="flex flex-wrap items-center gap-1 md:gap-2" aria-label="Main">
      <NavLink to="/tenant/dashboard" className={activeCls} end>
        Home
      </NavLink>
      <a href="#stayscout-map" className={`${linkBase} ${inactive}`}>
        Map
      </a>
      <a href="#stayscout-listings" className={`${linkBase} ${inactive}`}>
        Listings
      </a>
      <NavLink to="/tenant/chat" className={activeCls}>
        Chat
      </NavLink>
      <NavLink to="/tenant/profile" className={activeCls}>
        <span className="inline-flex items-center gap-1">
          <PersonOutlineIcon sx={{ fontSize: 18 }} />
          Profile
        </span>
      </NavLink>
    </nav>
  );
}

/** Landlord: Home | Map | Listings | Chat | Profile */
export function StayScoutLandlordNav() {
  return (
    <nav className="flex flex-wrap items-center gap-1 md:gap-2" aria-label="Main">
      <NavLink to="/landlord/dashboard" className={activeCls} end>
        Home
      </NavLink>
      <a href="#landlord-map" className={`${linkBase} ${inactive}`}>
        Map
      </a>
      <a href="#landlord-listings" className={`${linkBase} ${inactive}`}>
        Listings
      </a>
      <NavLink to="/landlord/chat" className={activeCls}>
        Chat
      </NavLink>
      <NavLink to="/landlord/profile" className={activeCls}>
        <span className="inline-flex items-center gap-1">
          <PersonOutlineIcon sx={{ fontSize: 18 }} />
          Profile
        </span>
      </NavLink>
    </nav>
  );
}

function AdminNavLink({ to, children, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `block px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive
            ? "bg-indigo-600/20 text-white font-medium"
            : "text-slate-300 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

/** Admin sidebar links (used inside AdminDashboard shell) */
export function StayScoutAdminSidebarNav() {
  const wrap = (fn) => (e) => {
    e.preventDefault();
    fn?.();
  };
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Admin">
      <AdminNavLink to="/admin/dashboard" end>
        Dashboard
      </AdminNavLink>
      <NavLink
        to="/admin/analytics"
        className={({ isActive }) =>
          `block px-3 py-2 rounded-lg text-sm transition-colors ${
            isActive
              ? "bg-indigo-600/20 text-white font-medium"
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`
        }
      >
        Analytics
      </NavLink>
      <a
        href="#admin-map"
        onClick={wrap(() =>
          document.getElementById("admin-map")?.scrollIntoView({ behavior: "smooth" })
        )}
        className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white"
      >
        Heatmap
      </a>
      <a
        href="#admin-pending"
        onClick={wrap(() =>
          document.getElementById("admin-pending")?.scrollIntoView({ behavior: "smooth" })
        )}
        className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white"
      >
        Approvals
      </a>
      <a
        href="#admin-users"
        onClick={wrap(() =>
          document.getElementById("admin-users")?.scrollIntoView({ behavior: "smooth" })
        )}
        className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white"
      >
        Users
      </a>
      <a
        href="#admin-settings"
        onClick={wrap(() =>
          document.getElementById("admin-settings")?.scrollIntoView({ behavior: "smooth" })
        )}
        className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white"
      >
        Settings
      </a>
    </nav>
  );
}

export function AdminTopBar({ title, subtitle }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 text-slate-500">
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Notifications"
        >
          <NotificationsNoneIcon fontSize="small" />
        </button>
        <span className="hidden sm:inline text-xs text-slate-400">StayScout</span>
      </div>
    </div>
  );
}
