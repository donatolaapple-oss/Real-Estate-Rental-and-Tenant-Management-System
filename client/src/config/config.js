/** Prefer VITE_API_BASE_URL; fall back to legacy VITE_APP_* from older .env files */
const devApiBase =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_APP_API_URL ||
  "http://localhost:5002/api";

const devSocket =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_APP_API_HOST ||
  (typeof devApiBase === "string" && devApiBase.includes("/api")
    ? devApiBase.replace(/\/api\/?$/, "")
    : "http://localhost:5002");

const development = {
  API_BASE_URL: devApiBase,
  SOCKET_URL: devSocket,
  APP_BASE_URL:
    import.meta.env.VITE_APP_URL ||
    import.meta.env.VITE_APP_BASE_URL ||
    "http://localhost:5175",
};

const production = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "/api",
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || window.location.origin,
  APP_BASE_URL: import.meta.env.VITE_APP_URL || window.location.origin,
};

const config = import.meta.env.DEV ? development : production;

export default config;
