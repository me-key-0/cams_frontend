import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpenIcon,
  UserGroupIcon,
  ClockIcon,
  AcademicCapIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { enrollmentService } from "../../api/services/enrollmentService";
import { EnrollmentSession } from "../../types/enrollment";
import { useAuthStore } from "../../stores/authStore";

const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const semesters = ["1st Semester", "2nd Semester"];

// Helper function to convert year level to numeric year
const getNumericYear = (yearLevel: string): number => {
  return parseInt(yearLevel.split(" ")[0]);
};

// Helper function to convert semester to format expected by API
const getApiSemester = (semester: string): number => {
  return parseInt(semester.split(" ")[0]);
};

export default function Class() {
  const [selectedYear, setSelectedYear] = useState(yearLevels[0]);
  const [selectedSemester, setSelectedSemester] = useState(semesters[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [classes, setClasses] = useState<EnrollmentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!user?.id) {
          setError('User not authenticated');
          return;
        }

        const year = getNumericYear(selectedYear);
        const semester = getApiSemester(selectedSemester);
        const academicYear = new Date().getFullYear(); // Current academic year

        const response = await enrollmentService.getEnrollmentSessions(
          parseInt(user.id.toString()),
          year,
          semester,
          academicYear
        );
        setClasses(response);
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching classes');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [selectedYear, selectedSemester, user?.id]);

  // Filter by search query
  const filteredClasses = classes.filter(
    (classItem) =>
      classItem.course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClassClick = (classItem: EnrollmentSession) => {
    navigate(`/student/class/${classItem.id}/resources`, {
      state: { 
        courseSessionId: classItem.id,
        code: classItem.course.code,
        name: classItem.course.name,
        instructor: classItem.lecturerName,
        credits: classItem.course.creditHour,
        year: classItem.year,
        semester: classItem.semester,
        academicYear: classItem.academicYear
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

  if (error) {
    return (
      <div className="card bg-error-50 border-error-200 text-error-700">
        <p className="body-default">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="heading-3">My Classes</h3>
            <p className="body-small mt-1">
              {filteredClasses.length} {filteredClasses.length === 1 ? 'class' : 'classes'} found
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input min-w-[200px]"
            />
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <div className="card text-center py-12">
          <BookOpenIcon className="h-16 w-16 text-foreground-tertiary mx-auto mb-4" />
          <h3 className="heading-4 mb-2">No Classes Found</h3>
          <p className="body-default text-foreground-secondary">
            {searchQuery 
              ? "No classes match your search criteria. Try adjusting your filters."
              : "You are not enrolled in any classes for this period."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClasses.map((classItem) => (
            <div
              key={classItem.id}
              onClick={() => handleClassClick(classItem)}
              className="card card-interactive group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="heading-4 text-primary-600 group-hover:text-primary-700 transition-colors">
                      {classItem.course.code}
                    </h4>
                    <span className="status-success px-2 py-1 rounded-full text-xs font-medium">
                      Enrolled
                    </span>
                  </div>
                  <h3 className="body-large font-medium text-foreground leading-snug mb-3">
                    {classItem.course.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-foreground-secondary">
                  <CalendarIcon className="h-4 w-4 mr-3 text-foreground-tertiary" />
                  <span className="body-small">
                    Academic Year {classItem.academicYear}-{classItem.academicYear + 1}
                  </span>
                </div>
                
                <div className="flex items-center text-foreground-secondary">
                  <ClockIcon className="h-4 w-4 mr-3 text-foreground-tertiary" />
                  <span className="body-small">
                    Year {classItem.year}, Semester {classItem.semester}
                  </span>
                </div>
                
                <div className="flex items-start text-foreground-secondary">
                  <UserGroupIcon className="h-4 w-4 mr-3 text-foreground-tertiary mt-0.5" />
                  <div className="flex-1">
                    <span className="body-small font-medium text-foreground">Lecturers</span>
                    <div className="mt-1 space-y-1">
                      {classItem.lecturerName ? classItem.lecturerName.split(" | ").map((name, index) => (
                        <div key={name} className="flex items-center">
                          <div className="h-1.5 w-1.5 bg-foreground-tertiary rounded-full mr-2"></div>
                          <span className="body-small">{name}</span>
                        </div>
                      )) : (
                        <span className="body-small text-foreground-tertiary italic">No lecturers assigned</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-foreground-secondary pt-2 border-t border-border">
                  <AcademicCapIcon className="h-4 w-4 mr-3 text-foreground-tertiary" />
                  <span className="body-small font-medium">
                    {classItem.course.creditHour} Credit Hours
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