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
// import CourseNotifications from "./pages/student/courses/CourseNotifications";
// import CourseGrades from "./pages/student/courses/CourseGrades";
// import CourseAssessments from "./pages/student/courses/CourseAssessments";
// import CourseChat from "./pages/student/courses/CourseChat";

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

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

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
