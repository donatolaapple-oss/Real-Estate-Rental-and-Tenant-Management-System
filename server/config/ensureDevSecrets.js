/**
 * Local dev fallbacks so login works without a full .env.
 * In production, set real secrets — these defaults are not used when NODE_ENV=production.
 */
export default function ensureDevSecrets() {
  if (process.env.NODE_ENV === "production") return;

  const jwt =
    process.env.STAYSCOUT_DEV_JWT_SECRET ||
    "stayscout-local-dev-jwt-secret-min-32-characters-long";

  const pairs = [
    ["ACCESS_TOKEN_SECRET_OWNER", jwt],
    ["ACCESS_TOKEN_SECRET_TENANT", jwt],
    ["ACCESS_TOKEN_SECRET_ADMIN", jwt],
    ["REFRESH_TOKEN_SECRET_OWNER", `${jwt}_refresh_owner`],
    ["REFRESH_TOKEN_SECRET_TENANT", `${jwt}_refresh_tenant`],
    ["REFRESH_TOKEN_SECRET_ADMIN", `${jwt}_refresh_admin`],
  ];

  for (const [key, val] of pairs) {
    if (!process.env[key]) process.env[key] = val;
  }

  if (!process.env.ACCESS_LIFETIME) process.env.ACCESS_LIFETIME = "15m";
  if (!process.env.REFRESH_LIFETIME) process.env.REFRESH_LIFETIME = "7d";
}
