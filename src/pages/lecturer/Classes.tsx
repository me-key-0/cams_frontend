import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AcademicCapIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../stores/authStore";
import api from "../../api/config";

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
  enrolledStudentCount?: number;
}

const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const semesters = ["1st Semester", "2nd Semester"];
const academicYears = [2023, 2024, 2025, 2026];

export default function Classes() {
  const [selectedYear, setSelectedYear] = useState("1st Year");
  const [selectedSemester, setSelectedSemester] = useState("1st Semester");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [courseSessions, setCourseSessions] = useState<CourseSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, lecturer } = useAuthStore();

  useEffect(() => {
    const fetchCourseSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!lecturer?.id) {
          setError('Lecturer information not available');
          return;
        }

        // Get course sessions by department (assuming lecturer has department)
        const response = await api.get(`/api/course-sessions/department/${lecturer.id}`);
        
        if (response.data && Array.isArray(response.data)) {
          // Filter by lecturer assignment and selected criteria
          const filteredSessions = response.data.filter((session: CourseSession) => {
            const matchesLecturer = session.lecturerIds.includes(lecturer.id);
            const matchesYear = session.year === getNumericYear(selectedYear);
            const matchesSemester = session.semester === getNumericSemester(selectedSemester);
            const matchesAcademicYear = session.academicYear === selectedAcademicYear;
            
            return matchesLecturer && matchesYear && matchesSemester && matchesAcademicYear;
          });

          // Fetch enrolled student count for each session
          const sessionsWithCounts = await Promise.all(
            filteredSessions.map(async (session) => {
              try {
                const enrollmentResponse = await api.get(`/api/enrollment/course-session/${session.id}/students`);
                const studentIds = enrollmentResponse.data || [];
                return {
                  ...session,
                  enrolledStudentCount: Array.isArray(studentIds) ? studentIds.length : 0
                };
              } catch (err) {
                console.warn(`Failed to fetch enrollment for session ${session.id}`);
                return { ...session, enrolledStudentCount: 0 };
              }
            })
          );

          setCourseSessions(sessionsWithCounts);
        } else {
          setCourseSessions([]);
        }
      } catch (err: any) {
        console.error('Error fetching course sessions:', err);
        setError('Failed to load course sessions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseSessions();
  }, [selectedYear, selectedSemester, selectedAcademicYear, lecturer?.id]);

  const getNumericYear = (yearLevel: string): number => {
    return parseInt(yearLevel.split(" ")[0]);
  };

  const getNumericSemester = (semester: string): number => {
    return parseInt(semester.split(" ")[0]);
  };

  const filteredCourseSessions = courseSessions.filter((session) => {
    if (!searchQuery) return true;
    return (
      session.course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.course.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleCourseSessionClick = (session: CourseSession) => {
    navigate(`/lecturer/classes/${session.id}/resources`, {
      state: {
        courseSessionId: session.id,
        code: session.course.code,
        name: session.course.name,
        credits: session.course.creditHour,
        year: session.year,
        semester: session.semester,
        academicYear: session.academicYear,
        status: session.isActive ? "ACTIVE" : "INACTIVE",
        enrollmentOpen: session.enrollmentOpen,
        enrolledStudentCount: session.enrolledStudentCount || 0
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="heading-3">My Course Sessions</h3>
            <p className="body-small mt-1 text-foreground-secondary">
              {filteredCourseSessions.length} {filteredCourseSessions.length === 1 ? 'session' : 'sessions'} found
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(Number(e.target.value))}
              className="input min-w-[140px]"
            >
              {academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}-{year + 1}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="input min-w-[130px]"
            >
              {yearLevels.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="input min-w-[150px]"
            >
              {semesters.map((semester) => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input min-w-[200px]"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="status-error p-4 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            <p className="body-default">{error}</p>
          </div>
        </div>
      )}

      {/* Course Sessions Grid */}
      {filteredCourseSessions.length === 0 ? (
        <div className="card text-center py-12">
          <AcademicCapIcon className="h-16 w-16 text-foreground-tertiary mx-auto mb-4" />
          <h3 className="heading-4 mb-2">No Course Sessions Found</h3>
          <p className="body-default text-foreground-secondary">
            {searchQuery 
              ? "No course sessions match your search criteria. Try adjusting your filters."
              : "You are not assigned to any course sessions for this period."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourseSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => handleCourseSessionClick(session)}
              className="card card-interactive group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="heading-4 text-primary-600 group-hover:text-primary-700 transition-colors">
                      {session.course.code}
                    </h4>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.isActive 
                          ? "bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300"
                          : "bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-300"
                      }`}>
                        {session.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {session.enrollmentOpen && (
                        <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                          Enrollment Open
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="body-large font-medium text-foreground leading-snug mb-3">
                    {session.course.name}
                  </h3>
                  {session.course.description && (
                    <p className="body-small text-foreground-secondary mb-3 line-clamp-2">
                      {session.course.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-foreground-secondary">
                  <CalendarIcon className="h-4 w-4 mr-3 text-foreground-tertiary" />
                  <span className="body-small">
                    Academic Year {session.academicYear}-{session.academicYear + 1}
                  </span>
                </div>
                
                <div className="flex items-center text-foreground-secondary">
                  <ClockIcon className="h-4 w-4 mr-3 text-foreground-tertiary" />
                  <span className="body-small">
                    Year {session.year}, Semester {session.semester}
                  </span>
                </div>
                
                <div className="flex items-center text-foreground-secondary">
                  <UserGroupIcon className="h-4 w-4 mr-3 text-foreground-tertiary" />
                  <span className="body-small">
                    {session.enrolledStudentCount || 0} Students Enrolled
                  </span>
                </div>

                <div className="flex items-center text-foreground-secondary pt-2 border-t border-border">
                  <AcademicCapIcon className="h-4 w-4 mr-3 text-foreground-tertiary" />
                  <span className="body-small font-medium">
                    {session.course.creditHour} Credit Hours
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}