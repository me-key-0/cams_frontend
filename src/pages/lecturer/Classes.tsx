import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AcademicCapIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { assignmentService } from "../../api/services/assignmentService";
import { Assignment } from "../../types/assignment";

const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const semesters = ["1st Semester", "2nd Semester"];

export default function Classes() {
  const [selectedYear, setSelectedYear] = useState(yearLevels[0]);
  const [selectedSemester, setSelectedSemester] = useState(semesters[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // TODO: Get actual lecturerId from auth context
        const lecturerId = 1;
        console.log('Fetching assignments for lecturer:', lecturerId);
        const response = await assignmentService.getAssignmentSessions(lecturerId);
        console.log('Received assignments:', response);
        setAssignments(response || []);
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching assignments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const filteredAssignments = assignments.filter((assignment) => {
    if (!searchQuery) return true;
    return (
      assignment?.course?.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment?.course?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  console.log('Current state:', { assignments, searchQuery, filtered: filteredAssignments.length });

  const handleAssignmentClick = (assignment: Assignment) => {
    navigate(`/lecturer/classes/${assignment.course.id}/resources`, {
      state: {
        code: assignment.course.code,
        name: assignment.course.name,
        credits: assignment.course.creditHour,
        year: assignment.year,
        semester: assignment.semester,
        academicYear: assignment.academicYear,
        status: assignment.status
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Classes Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAssignments.map((assignment) => (
          <div
            key={assignment.id}
            onClick={() => handleAssignmentClick(assignment)}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg w-full">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xl font-semibold text-gray-900">
                        {assignment.course.code}
                      </h4>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          assignment.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : assignment.status === "UPCOMING"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {assignment.status}
                      </span>
                    </div>
                    <p className="text-base text-gray-700 font-medium">{assignment.course.name}</p>
                    <div className="mt-2 flex items-center">
                      <span className="text-sm text-gray-600 font-medium">Credit Hours:</span>
                      <span className="ml-2 text-sm text-gray-900">{assignment.course.creditHour}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <AcademicCapIcon className="h-5 w-5 mr-2" />
                    Year Level: {assignment.year === 1 ? "1st Year" : 
                               assignment.year === 2 ? "2nd Year" : 
                               assignment.year === 3 ? "3rd Year" : 
                               `${assignment.year}th Year`}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    Semester: {assignment.semester === 1 ? "1st Semester" : "2nd Semester"}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Academic Year: {assignment.academicYear} - {assignment.academicYear + 1}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}