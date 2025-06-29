import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { SignupCredentials } from "../../types/auth";
import { useAuthStore } from "../../stores/authStore";
import toast from "react-hot-toast";

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setToken } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupCredentials>();

  const onSubmit = async (data: SignupCredentials) => {
    try {
      setIsLoading(true);
      // await setToken(data);
      toast.success("Account created successfully!");
      navigate("/student");
    } catch (error) {
      toast.error("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="heading-1 gradient-text mb-2">CAMS</h1>
          <h2 className="heading-3 text-balance">
            Create your account
          </h2>
          <p className="mt-3 body-default">
            Or{" "}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
            >
              sign in to your account
            </Link>
          </p>
        </div>
        
        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                  First Name
                </label>
                <input
                  {...register("firstName", {
                    required: "First name is required",
                  })}
                  type="text"
                  className={`input ${errors.firstName ? 'input-error' : ''}`}
                  placeholder="First Name"
                />
                {errors.firstName && (
                  <p className="mt-2 text-sm text-error-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                  Last Name
                </label>
                <input
                  {...register("lastName", { required: "Last name is required" })}
                  type="text"
                  className={`input ${errors.lastName ? 'input-error' : ''}`}
                  placeholder="Last Name"
                />
                {errors.lastName && (
                  <p className="mt-2 text-sm text-error-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email address
              </label>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                type="email"
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-error-600">
                  {errors.email.message}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-foreground mb-2">
                Student ID
              </label>
              <input
                {...register("studentId", {
                  required: "Student ID is required",
                })}
                type="text"
                className={`input ${errors.studentId ? 'input-error' : ''}`}
                placeholder="Enter your student ID"
              />
              {errors.studentId && (
                <p className="mt-2 text-sm text-error-600">
                  {errors.studentId.message}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-foreground mb-2">
                Department
              </label>
              <input
                {...register("department", {
                  required: "Department is required",
                })}
                type="text"
                className={`input ${errors.department ? 'input-error' : ''}`}
                placeholder="Enter your department"
              />
              {errors.department && (
                <p className="mt-2 text-sm text-error-600">
                  {errors.department.message}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                type="password"
                className={`input ${errors.password ? 'input-error' : ''}`}
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-error-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-3 text-base font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                "Create account"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}