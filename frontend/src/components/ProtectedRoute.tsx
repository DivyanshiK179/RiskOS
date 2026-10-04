import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import type { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const accessToken = useAuthStore((s) => s.accessToken || s.token);
  const is2FaVerified = useAuthStore((s) => s.is2FaVerified || s.is2FAVerified);
  const isAuthenticatedState = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const isAuthenticated = Boolean(accessToken) && Boolean(isAuthenticatedState);
  const is2FAVerified = Boolean(is2FaVerified);

  if (!isAuthenticated || !is2FAVerified) {
    if (accessToken && !is2FAVerified) {
      logout();
    }
    const currentTarget = location.pathname + location.search;
    const redirectTarget = encodeURIComponent(currentTarget || "/dashboard");
    return <Navigate to={`/login?redirect=${redirectTarget}&reason=2fa_required`} replace />;
  }

  return <>{children}</>;
}