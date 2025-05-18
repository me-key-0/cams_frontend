import { useState, useEffect } from "react";
import {
  AcademicCapIcon,
  ClockIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { gradeService } from "../../api/services/gradeService";
import { GradeReport, calculateGradePoint, calculateLetterGrade } from "../../types/grade";

const yearLevels = [1, 2, 3, 4];
const semesters = [1, 2];

export default function Grades() {
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [grades, setGrades] = useState<GradeReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // TODO: Get actual studentId from auth context
        const studentId = 1001;
        const response = await gradeService.getGradeReports(
          studentId,
          selectedYear,
          selectedSemester
        );
        setGrades(response);
      } catch (err) {
        console.error('Error fetching grades:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching grades');
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [selectedYear, selectedSemester]);

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
              My Grades
            </h3>
            <div className="flex items-center space-x-4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="min-w-[130px] pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                {yearLevels.map((year) => (
                  <option key={year} value={year}>
                    {year === 1 ? "1st Year" :
                     year === 2 ? "2nd Year" :
                     year === 3 ? "3rd Year" :
                     `${year}th Year`}
                  </option>
                ))}
              </select>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(Number(e.target.value))}
                className="min-w-[150px] pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                {semesters.map((semester) => (
                  <option key={semester} value={semester}>
                    {semester === 1 ? "1st Semester" : "2nd Semester"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Grades Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course Code
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit Hour
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade Point
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {grades.map((grade) => (
                <tr key={`${grade.courseCode}-${selectedYear}-${selectedSemester}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {grade.courseCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {grade.courseName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {grade.creditHour}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {grade.finalGrade}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {calculateGradePoint(grade.finalGrade)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {calculateLetterGrade(grade.finalGrade)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
