import { useState } from "react";
import { AcademicCapIcon } from "@heroicons/react/24/outline";

interface Class {
  id: string;
  code: string;
  name: string;
  credits: number;
  grade: string;
  gradePoint: number;
  yearLevel: string;
  semester: string;
}

const mockClass: Class[] = [
  {
    id: "1",
    code: "CS101",
    name: "Introduction to Programming",
    credits: 3,
    grade: "A",
    gradePoint: 4.0,
    yearLevel: "1st Year",
    semester: "1st Semester",
  },
  {
    id: "2",
    code: "MATH201",
    name: "Calculus II",
    credits: 4,
    grade: "B+",
    gradePoint: 3.3,
    yearLevel: "1st Year",
    semester: "1st Semester",
  },
  {
    id: "3",
    code: "PHYS101",
    name: "Physics I",
    credits: 4,
    grade: "A-",
    gradePoint: 3.7,
    yearLevel: "1st Year",
    semester: "2nd Semester",
  },
  {
    id: "4",
    code: "CS301",
    name: "Algorithms",
    credits: 3,
    grade: "B",
    gradePoint: 3.0,
    yearLevel: "3rd Year",
    semester: "1st Semester",
  },
];

const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const semesters = ["1st Semester", "2nd Semester"];

const yearOrder = {
  "1st Year": 1,
  "2nd Year": 2,
  "3rd Year": 3,
  "4th Year": 4,
};

const semesterOrder = {
  "1st Semester": 1,
  "2nd Semester": 2,
};

export default function Grades() {
  const [selectedYear, setSelectedYear] = useState(yearLevels[0]);
  const [selectedSemester, setSelectedSemester] = useState(semesters[0]);

  const filteredClass = mockClass.filter(
    (Class) =>
      Class.yearLevel === selectedYear && Class.semester === selectedSemester
  );

  const calculateGPA = () => {
    const totalPoints = filteredClass.reduce(
      (sum, Class) => sum + Class.gradePoint * Class.credits,
      0
    );
    const totalCredits = filteredClass.reduce(
      (sum, Class) => sum + Class.credits,
      0
    );
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

  const calculateCGPA = () => {
    const currentYearOrder = yearOrder[selectedYear as keyof typeof yearOrder];
    const currentSemesterOrder =
      semesterOrder[selectedSemester as keyof typeof semesterOrder];

    const eligibleClass = mockClass.filter((Class) => {
      const ClassYearOrder =
        yearOrder[Class.yearLevel as keyof typeof yearOrder];
      const ClassemesterOrder =
        semesterOrder[Class.semester as keyof typeof semesterOrder];

      return (
        ClassYearOrder < currentYearOrder ||
        (ClassYearOrder === currentYearOrder &&
          ClassemesterOrder <= currentSemesterOrder)
      );
    });

    const totalPoints = eligibleClass.reduce(
      (sum, Class) => sum + Class.gradePoint * Class.credits,
      0
    );
    const totalCredits = eligibleClass.reduce(
      (sum, Class) => sum + Class.credits,
      0
    );
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

  return (
    <div className="space-y-6">
      {/* Year and Semester Selection */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            </div>

            {/* GPA & CGPA Display */}
            <div className="flex items-center space-x-6 mt-2 sm:mt-0">
              <div className="flex items-center space-x-2">
                <AcademicCapIcon className="h-5 w-5 text-primary-500" />
                <span className="text-sm font-semibold text-gray-700">
                  GPA: <span className="text-gray-900">{calculateGPA()}</span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <AcademicCapIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm font-semibold text-gray-700">
                  CGPA: <span className="text-gray-900">{calculateCGPA()}</span>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Credits
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grade Point
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grade
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredClass.map((Class) => (
              <tr key={Class.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {Class.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {Class.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {Class.credits}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {Class.gradePoint}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {Class.grade}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
