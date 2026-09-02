import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../../context/useAuth";
import type { UserRole } from "../../types";

function FullScreenLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]" role="status" aria-live="polite">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" aria-hidden="true" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { loading, authenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

export function RoleRoute({
  role,
  children,
}: {
  role: UserRole;
  children: ReactNode;
}) {
  const { loading, roleLoading, authenticated, role: userRole } = useAuth();
  const location = useLocation();

  if (loading || roleLoading) {
    return <FullScreenLoader />;
  }

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
