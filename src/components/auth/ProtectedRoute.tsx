import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children?: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, isAuthenticated, error } = useAuthStore();
  const location = useLocation();

  // Handle authentication errors
  if (error) {
    console.error('Auth error:', error);
    return <Navigate to="/error" replace />;
  }

  // Handle unauthenticated users
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle unauthorized access
  console.log(user, allowedRoles);
  if (!user || !allowedRoles.some(role => role.toLowerCase() === user.role.toLowerCase())) {
    // Redirect to appropriate dashboard based on user's role
    if (user?.role.toLowerCase() === 'student') {
      return <Navigate to="/student" replace />;
    } else if (user?.role.toLowerCase() === 'lecturer') {
      return <Navigate to="/lecturer" replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  // Render children if provided, otherwise use Outlet
  return children ? <>{children}</> : <Outlet />;
}
