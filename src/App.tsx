import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Unauthorized from "./pages/Unauthorized";
import StudentDashboard from "./pages/student/Dashboard";
import StudentAnnouncements from "./pages/student/Announcements";
import StudentGrades from "./pages/student/Grades";
import StudentGPACalculator from "./pages/student/GPACalculator";
import StudentSchedules from "./pages/student/Schedules";
import StudentClass from "./pages/student/Class";
import StudentContactAdmin from "./pages/student/ContactAdmin";
import ClassDetails from "./pages/student/Class/ClassDetails";
import StudentClassResources from "./pages/student/ClassResources";
import ClassNotifications from "./pages/student/Class/ClassNotifications";
import ClassAssessments from "./pages/student/Class/ClassAssessments";
import ClassChat from "./pages/student/Class/ClassChat";
import ClassEvaluation from "./pages/student/Class/ClassEvaluation";

// Lecturer imports
import LecturerDashboard from "./pages/lecturer/Dashboard";
import LecturerAnnouncements from "./pages/lecturer/Announcements";
import LecturerResources from "./pages/lecturer/Resources";
import LecturerAssessments from "./pages/lecturer/classes/ClassesAssessments";
import LecturerChat from "./pages/lecturer/Chat";
import LecturerContactAdmin from "./pages/lecturer/ContactAdmin";
import Classes from "./pages/lecturer/Classes";
import ClassesDetails from "./pages/lecturer/classes/ClassesDetails";
import Grades from "./pages/student/Grades";
import LecturerClassResources from "./pages/lecturer/ClassResources";
import ClassesGrades from "./pages/lecturer/classes/ClassesGrades";
import ClassesAssessments from "./pages/lecturer/classes/ClassesAssessments";
import ClassesChat from "./pages/lecturer/classes/ClassesChat";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgb(var(--color-background))',
              color: 'rgb(var(--color-foreground))',
              border: '1px solid rgb(var(--color-border))',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          {/* Catch-all route for unauthorized access */}
          <Route path="*" element={<ProtectedRoute allowedRoles={['student', 'lecturer']} />} />

          {/* Protected Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route element={<Layout />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route
                path="/student/announcements"
                element={<StudentAnnouncements />}
              />
              <Route path="/student/grades" element={<StudentGrades />} />
              <Route
                path="/student/gpa-calculator"
                element={<StudentGPACalculator />}
              />
              <Route path="/student/schedules" element={<StudentSchedules />} />
              <Route path="/student/Class" element={<StudentClass />} />
              <Route
                path="/student/contact-admin"
                element={<StudentContactAdmin />}
              />

              {/* Class Routes */}
              <Route
                path="/student/Class/:ClassId"
                element={<ClassDetails />}
              >
                <Route path="resources" element={<StudentClassResources />} />
                <Route path="notifications" element={<ClassNotifications />} />
                <Route path="assessments" element={<ClassAssessments />} />
                <Route path="chat" element={<ClassChat />} />
                <Route path="evaluation" element={<ClassEvaluation />} />
              </Route>
            </Route>
          </Route>

          {/* Protected Lecturer Routes */}
          <Route element={<ProtectedRoute allowedRoles={["lecturer"]} />}>
            <Route element={<Layout />}>
              <Route path="/lecturer" element={<LecturerDashboard />} />
              <Route
                path="/lecturer/announcements"
                element={<LecturerAnnouncements />}
              />
              <Route path="/lecturer/classes" element={<Classes />} />
              <Route path="/lecturer/classes/:classId" element={<ClassesDetails />}>
                <Route path="resources" element={<LecturerClassResources />} />
                <Route path="grades" element={<ClassesGrades />} />
                <Route path="assessments" element={<ClassesAssessments />} />
                <Route path="chat" element={<ClassesChat />} />
              </Route>
              <Route path="/lecturer/resources" element={<LecturerResources />} />
              <Route path="/lecturer/grades" element={<Grades />} />
              <Route
                path="/lecturer/assessments"
                element={<LecturerAssessments />}
              />
              <Route path="/lecturer/chat" element={<LecturerChat />} />
              <Route
                path="/lecturer/contact-admin"
                element={<LecturerContactAdmin />}
              />
            </Route>
          </Route>

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;