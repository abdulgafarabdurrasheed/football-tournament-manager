import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useIsAuthenticated, useAuthLoading } from "@/stores/authStores";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  redirectTo = "/",
}: ProtectedRouteProps) {
  const isAuthenticated = useIsAuthenticated;
  const isLoading = useAuthLoading();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-500 mx-auto" />
          <p className="text-slate-400 mt-8">Loading......</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

export default ProtectedRoute;
