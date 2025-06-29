import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        <div className="flex justify-center">
          <div className="p-4 bg-error-50 dark:bg-error-900/20 rounded-full">
            <ExclamationTriangleIcon className="h-12 w-12 text-error-600 dark:text-error-400" />
          </div>
        </div>
        
        <div>
          <h2 className="heading-2 text-balance mb-4">
            Access Denied
          </h2>
          <p className="body-default text-balance">
            You don't have permission to access this page.
          </p>
        </div>
        
        <div>
          <button
            onClick={() =>
              navigate(user?.role === "lecturer" ? "/lecturer" : "/student")
            }
            className="btn btn-primary px-6 py-3"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}