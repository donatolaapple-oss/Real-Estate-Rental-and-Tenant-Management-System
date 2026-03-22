import { useLocation } from "react-router-dom";

/** Resolves `/owner` vs `/landlord` route prefix for duplicated owner trees. */
export function useOwnerBasePath() {
  const { pathname } = useLocation();
  return pathname.startsWith("/landlord") ? "/landlord" : "/owner";
}
