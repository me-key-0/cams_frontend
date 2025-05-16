export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "student" | "lecturer" | "admin" | "superadmin";
  department?: string;
  studentId?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  firstName: string;
  lastName: string;
  studentId: string;
  department: string;
}
