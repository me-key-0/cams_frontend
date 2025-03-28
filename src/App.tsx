import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
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
import StudentCourses from "./pages/student/Courses";
import StudentContactAdmin from "./pages/student/ContactAdmin";
import CourseDetails from "./pages/student/courses/CourseDetails";
import CourseResources from "./pages/student/courses/CourseResources";
import CourseNotifications from "./pages/student/courses/CourseNotifications";
import CourseGrades from "./pages/student/courses/CourseGrades";
import CourseAssessments from "./pages/student/courses/CourseAssessments";
import CourseChat from "./pages/student/courses/CourseChat";

// Lecturer imports
import LecturerDashboard from "./pages/lecturer/Dashboard";
import LecturerAnnouncements from "./pages/lecturer/Announcements";
import LecturerResources from "./pages/lecturer/Resources";
import LecturerGrades from "./pages/lecturer/Grades";
import LecturerAssessments from "./pages/lecturer/Assessments";
import LecturerChat from "./pages/lecturer/Chat";
import LecturerContactAdmin from "./pages/lecturer/ContactAdmin";

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

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
            <Route path="/student/courses" element={<StudentCourses />} />
            <Route
              path="/student/contact-admin"
              element={<StudentContactAdmin />}
            />

            {/* Course Routes */}
            <Route
              path="/student/courses/:courseId"
              element={<CourseDetails />}
            >
              <Route path="resources" element={<CourseResources />} />
              <Route path="notifications" element={<CourseNotifications />} />
              <Route path="grades" element={<CourseGrades />} />
              <Route path="assessments" element={<CourseAssessments />} />
              <Route path="chat" element={<CourseChat />} />
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
            <Route path="/lecturer/resources" element={<LecturerResources />} />
            <Route path="/lecturer/grades" element={<LecturerGrades />} />
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
  );
}

export default App;
