import { useState } from "react";
import { AcademicCapIcon } from "@heroicons/react/24/outline";

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  grade: string;
  gradePoint: number;
  semester: string;
}

// Mock data - replace with actual API calls
const mockCourses: Course[] = [
  {
    id: "1",
    code: "CS101",
    name: "Introduction to Programming",
    credits: 3,
    grade: "A",
    gradePoint: 4.0,
    semester: "Fall 2023",
  },
  {
    id: "2",
    code: "MATH201",
    name: "Calculus II",
    credits: 4,
    grade: "B+",
    gradePoint: 3.3,
    semester: "Fall 2023",
  },
  {
    id: "3",
    code: "PHYS101",
    name: "Physics I",
    credits: 4,
    grade: "A-",
    gradePoint: 3.7,
    semester: "Spring 2024",
  },
];

const semesters = ["Fall 2023", "Spring 2024"];

export default function Grades() {
  const [selectedSemester, setSelectedSemester] = useState(semesters[0]);

  const filteredCourses = mockCourses.filter(
    (course) => course.semester === selectedSemester
  );

  const calculateGPA = () => {
    const totalPoints = filteredCourses.reduce(
      (sum, course) => sum + course.gradePoint * course.credits,
      0
    );
    const totalCredits = filteredCourses.reduce(
      (sum, course) => sum + course.credits,
      0
    );
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

  return (
    <div className="space-y-6">
      {/* Semester Selection and GPA */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                {semesters.map((semester) => (
                  <option key={semester} value={semester}>
                    {semester}
                  </option>
                ))}
              </select>
              <div className="flex items-center">
                <AcademicCapIcon className="h-5 w-5 text-primary-500 mr-2" />
                <span className="text-lg font-semibold text-gray-900">
                  GPA: {calculateGPA()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Course Code
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Course Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Credits
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Grade
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Grade Point
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCourses.map((course) => (
              <tr key={course.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {course.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {course.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {course.credits}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {course.grade}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {course.gradePoint}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
