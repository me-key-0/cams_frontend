import { useState, useEffect } from "react";
import { Outlet, useParams, useNavigate, useLocation } from "react-router-dom";
import {
  BookOpenIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../../stores/authStore";
import api from "../../../api/config";

const navigation = [
  { name: "Resources", href: "resources", icon: BookOpenIcon },
  { name: "Grades", href: "grades", icon: AcademicCapIcon },
  { name: "Assessments", href: "assessments", icon: ClipboardDocumentListIcon },
  { name: "Chat", href: "chat", icon: ChatBubbleLeftRightIcon },
];

interface CourseSession {
  id: number;
  academicYear: number;
  semester: number;
  year: number;
  courseId: number;
  departmentId: number;
  isActive: boolean;
  enrollmentOpen: boolean;
  course: {
    id: number;
    code: string;
    name: string;
    creditHour: number;
    description: string;
  };
  lecturerIds: number[];
  batchId: number;
  enrolledStudentCount: number;
}

export default function LecturerClassDetails() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { lecturer } = useAuthStore();
  const [activeTab, setActiveTab] = useState(() => {
    const path = location.pathname.split("/").pop();
    return navigation.find((item) => item.href === path)?.href || "resources";
  });
  const [courseSession, setCourseSession] = useState<CourseSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get initial data from location state or fetch from API
  const initialClassDetails = location.state || null;

  useEffect(() => {
    const fetchCourseSession = async () => {
      if (initialClassDetails) {
        // Use data from navigation state
        setCourseSession({
          id: parseInt(classId!),
          ...initialClassDetails,
          enrolledStudentCount: initialClassDetails.enrolledStudentCount || 0
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch course session details
        const response = await api.get(`/api/course-sessions/${classId}`);
        const sessionData = response.data;

        // Fetch enrolled student count
        let enrolledStudentCount = 0;
        try {
          const enrollmentResponse = await api.get(`/api/enrollment/course-session/${classId}/students`);
          const studentIds = enrollmentResponse.data || [];
          enrolledStudentCount = Array.isArray(studentIds) ? studentIds.length : 0;
        } catch (enrollmentErr) {
          console.warn('Failed to fetch enrollment count');
        }

        setCourseSession({
          ...sessionData,
          enrolledStudentCount
        });
      } catch (err: any) {
        console.error('Error fetching course session:', err);
        setError('Failed to load course session details.');
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchCourseSession();
    }
  }, [classId, initialClassDetails]);

  const handleSessionAction = async (action: 'activate' | 'deactivate' | 'openEnrollment' | 'closeEnrollment') => {
    try {
      await api.post(`/api/course-sessions/${classId}/${action}`);
      
      // Update local state
      setCourseSession(prev => prev ? {
        ...prev,
        isActive: action === 'activate' ? true : action === 'deactivate' ? false : prev.isActive,
        enrollmentOpen: action === 'openEnrollment' ? true : action === 'closeEnrollment' ? false : prev.enrollmentOpen
      } : null);
      
    } catch (err) {
      console.error(`Failed to ${action} session:`, err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !courseSession) {
    return (
      <div className="card text-center py-12">
        <h3 className="heading-4 mb-2">Error Loading Course Session</h3>
        <p className="body-default text-foreground-secondary mb-4">
          {error || "Course session not found."}
        </p>
        <button
          onClick={() => navigate('/lecturer/classes')}
          className="btn btn-primary"
        >
          Back to Classes
        </button>
      </div>
    );
  }

  const classDetails = {
    courseSessionId: courseSession.id,
    code: courseSession.course.code,
    name: courseSession.course.name,
    credits: courseSession.course.creditHour,
    year: courseSession.year,
    semester: courseSession.semester,
    academicYear: courseSession.academicYear,
    status: courseSession.isActive ? "ACTIVE" : "INACTIVE",
    enrollmentOpen: courseSession.enrollmentOpen,
    enrolledStudentCount: courseSession.enrolledStudentCount,
    description: courseSession.course.description
  };

  return (
    <div className="space-y-6">
      {/* Course Session Header */}
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <h1 className="heading-1 text-primary-600">
                {courseSession.course.code}
              </h1>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  courseSession.isActive 
                    ? "bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300"
                    : "bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-300"
                }`}>
                  {courseSession.isActive ? 'Active' : 'Inactive'}
                </span>
                {courseSession.enrollmentOpen && (
                  <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                    Enrollment Open
                  </span>
                )}
              </div>
            </div>
            <h2 className="heading-3 text-foreground mb-2">
              {courseSession.course.name}
            </h2>
            {courseSession.course.description && (
              <p className="body-default text-foreground-secondary mb-4">
                {courseSession.course.description}
              </p>
            )}
          </div>
          
          {/* Session Management Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSessionAction(courseSession.isActive ? 'deactivate' : 'activate')}
              className={`btn ${courseSession.isActive ? 'btn-secondary' : 'btn-primary'} text-sm`}
            >
              {courseSession.isActive ? 'Deactivate' : 'Activate'} Session
            </button>
            <button
              onClick={() => handleSessionAction(courseSession.enrollmentOpen ? 'closeEnrollment' : 'openEnrollment')}
              className={`btn ${courseSession.enrollmentOpen ? 'btn-secondary' : 'btn-primary'} text-sm`}
            >
              {courseSession.enrollmentOpen ? 'Close' : 'Open'} Enrollment
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center text-foreground-secondary">
            <AcademicCapIcon className="h-6 w-6 mr-3 text-primary-500" />
            <div>
              <span className="block body-small font-medium text-foreground">Credit Hours</span>
              <span className="body-default">{courseSession.course.creditHour} Credits</span>
            </div>
          </div>

          <div className="flex items-center text-foreground-secondary">
            <CalendarIcon className="h-6 w-6 mr-3 text-primary-500" />
            <div>
              <span className="block body-small font-medium text-foreground">Academic Period</span>
              <span className="body-default">
                Year {courseSession.year}, Semester {courseSession.semester}
              </span>
            </div>
          </div>

          <div className="flex items-center text-foreground-secondary">
            <ClockIcon className="h-6 w-6 mr-3 text-primary-500" />
            <div>
              <span className="block body-small font-medium text-foreground">Academic Year</span>
              <span className="body-default">
                {courseSession.academicYear} - {courseSession.academicYear + 1}
              </span>
            </div>
          </div>

          <div className="flex items-center text-foreground-secondary">
            <UserGroupIcon className="h-6 w-6 mr-3 text-primary-500" />
            <div>
              <span className="block body-small font-medium text-foreground">Enrolled Students</span>
              <span className="body-default">{courseSession.enrolledStudentCount} Students</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="card p-0 overflow-hidden">
        <div className="border-b border-border">
          <nav className="flex overflow-x-auto" aria-label="Tabs">
            {navigation.map((item) => {
              const isActive = activeTab === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.href);
                    navigate(`/lecturer/classes/${classId}/${item.href}`, {
                      state: classDetails
                    });
                  }}
                  className={`
                    group inline-flex items-center border-b-2 py-4 px-6 text-sm font-medium whitespace-nowrap transition-all duration-200
                    ${
                      isActive
                        ? "border-primary-500 text-primary-600 bg-primary-50 dark:bg-primary-900/20"
                        : "border-transparent text-foreground-secondary hover:border-border-secondary hover:text-foreground hover:bg-background-secondary"
                    }
                  `}
                >
                  <item.icon
                    className={`
                      -ml-0.5 mr-2 h-5 w-5 transition-colors duration-200
                      ${
                        isActive
                          ? "text-primary-500"
                          : "text-foreground-tertiary group-hover:text-foreground-secondary"
                      }
                    `}
                    aria-hidden="true"
                  />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="card">
        <Outlet context={{ classDetails }} />
      </div>
    </div>
  );
}