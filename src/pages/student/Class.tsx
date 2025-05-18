import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpenIcon,
  UserGroupIcon,
  ClockIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { enrollmentService } from "../../api/services/enrollmentService";
import { EnrollmentSession } from "../../types/enrollment";

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

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError(null);
        const studentId = 1001; // Sample student ID
        const year = getNumericYear(selectedYear);
        const semester = getApiSemester(selectedSemester);
        const academicYear = 2023; // This should be dynamic in the future

        const response = await enrollmentService.getEnrollmentSessions(
          studentId,
          year,
          semester,
          academicYear
        );
        setClasses(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching classes');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [selectedYear, selectedSemester]);

  // Filter by search query
  const filteredClasses = classes.filter(
    (classItem) =>
      classItem.course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClassClick = (classItem: EnrollmentSession) => {
    navigate(`/student/class/${classItem.id}/resources`, {
      state: { 
        code: classItem.course.code,
        name: classItem.course.name,
        instructor: classItem.lecturerName,
        credits: classItem.course.creditHour
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 m-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              My Classes
            </h3>
            <div className="flex items-center space-x-4">
              {/* Year dropdown */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="min-w-[130px] pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                {yearLevels.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {/* Semester dropdown */}
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="min-w-[150px] ml-2 pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                className="block w-full pl-4 pr-12 py-3 text-lg border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-lg rounded-md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Class Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredClasses.map((classItem) => (
          <div
            key={classItem.id}
            onClick={() => handleClassClick(classItem)}
            className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-xl hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer"
          >
            <div className="p-6">
              {/* Header Section */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">
                        {classItem.course.code}
                      </h4>
                      <h3 className="text-lg font-medium text-gray-700 leading-snug">
                        {classItem.course.name}
                      </h3>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/10">
                      Enrolled
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="space-y-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <ClockIcon className="h-5 w-5 mr-3 text-gray-400" />
                  <span>Year {classItem.year}, Semester {classItem.semester}</span>
                </div>
                
                <div className="flex items-start text-gray-600">
                  <BookOpenIcon className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-medium text-gray-700">Lecturers</span>
                    <div className="mt-2 space-y-1">
                      {classItem.lecturerName ? classItem.lecturerName.split(" | ").map((name, index) => (
                        <div key={name} className="flex items-center">
                          <div className="h-2 w-2 bg-gray-300 rounded-full mr-2"></div>
                          <span className="text-gray-600">{name}</span>
                        </div>
                      )) : (
                        <span className="text-gray-500 italic">No lecturers assigned</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <AcademicCapIcon className="h-5 w-5 mr-3 text-gray-400" />
                  <span>{classItem.course.creditHour} Credit Hours</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

