import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../stores/authStore";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthStore();

  console.log("ProtectedRoute Debug:", {
    isAuthenticated,
    user,
    allowedRoles,
    hasAccess: user && allowedRoles.includes(user.role),
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    console.log("Unauthorized access:", { user, allowedRoles });
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
